/**
 * tests/jobs.test.js — background job implementations:
 * expiring coupons, low-stock alerts, embedding rebuilds, scheduler wiring.
 */
jest.mock("../src/services/socketService", () => ({
  emitToUser: jest.fn(),
  emitToAdmins: jest.fn(),
  emitToInventory: jest.fn(),
  isLowStock: jest.fn(() => false),
  LOW_STOCK_THRESHOLD: 5,
}));
const socketService = require("../src/services/socketService");

jest.mock("../src/models/Coupon", () => ({
  updateMany: jest.fn(),
}));
const Coupon = require("../src/models/Coupon");

jest.mock("../src/models/Book", () => ({ find: jest.fn() }));
jest.mock("../src/models/User", () => ({ find: jest.fn() }));
jest.mock("../src/models/Notification", () => ({ insertMany: jest.fn(), create: jest.fn() }));
const Book = require("../src/models/Book");
const User = require("../src/models/User");
const Notification = require("../src/models/Notification");

jest.mock("../src/ai/embeddings/embeddingService", () => ({
  generateEmbedding: jest.fn(),
}));
const { generateEmbedding } = require("../src/ai/embeddings/embeddingService");

const expiringCoupons = require("../src/jobs/expiringCoupons");
const lowStockNotifier = require("../src/jobs/lowStockNotifier");
const rebuildEmbeddings = require("../src/jobs/rebuildEmbeddings");
const scheduler = require("../src/jobs/scheduler");

beforeEach(() => jest.clearAllMocks());

describe("expiringCoupons", () => {
  it("deactivates only active coupons whose expiry has passed", async () => {
    Coupon.updateMany.mockResolvedValue({ modifiedCount: 3 });

    const result = await expiringCoupons.run();

    expect(Coupon.updateMany).toHaveBeenCalledWith(
      {
        isActive: true,
        expiresAt: { $ne: null, $lt: expect.any(Date) },
      },
      { $set: { isActive: false } }
    );
    expect(result).toEqual({ deactivated: 3 });
  });

  it("reports zero when nothing expired", async () => {
    Coupon.updateMany.mockResolvedValue({ modifiedCount: 0 });
    await expect(expiringCoupons.run()).resolves.toEqual({ deactivated: 0 });
  });
});

describe("lowStockNotifier", () => {
  it("alerts admins via sockets and persists notifications", async () => {
    const low = [
      { _id: "b1", title: "Dune", stock: 2 },
      { _id: "b2", title: "Emma", stock: 0 },
    ];
    Book.find.mockReturnValue({
      select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(low) })),
    });
    User.find.mockReturnValue({
      select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([{ _id: "admin1" }, { _id: "admin2" }]) })),
    });
    Notification.insertMany.mockResolvedValue([]);

    const result = await lowStockNotifier.run();

    expect(Book.find).toHaveBeenCalledWith({
      isActive: true,
      stock: { $gte: 0, $lte: expect.any(Number) },
    });
    // both channels alerted per book
    expect(socketService.emitToAdmins).toHaveBeenCalledTimes(2);
    expect(socketService.emitToInventory).toHaveBeenCalledTimes(2);
    // one persisted notification per admin per book (2×2)
    expect(Notification.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ user: "admin1", title: "Low stock alert" }),
        expect.objectContaining({ user: "admin2", type: "stock" }),
      ])
    );
    expect(Notification.insertMany.mock.calls[0][0]).toHaveLength(4);
    expect(result.alerted).toBe(2);
  });

  it("does nothing when stock is healthy", async () => {
    Book.find.mockReturnValue({ select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })) });

    const result = await lowStockNotifier.run();

    expect(result.alerted).toBe(0);
    expect(socketService.emitToAdmins).not.toHaveBeenCalled();
    expect(User.find).not.toHaveBeenCalled();
  });

  it("still emits sockets if persisting notifications fails", async () => {
    Book.find.mockReturnValue({
      select: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue([{ _id: "b1", title: "X", stock: 1 }]),
      })),
    });
    User.find.mockReturnValue({
      select: jest.fn(() => ({ lean: jest.fn().mockRejectedValue(new Error("db down")) })),
    });

    const result = await lowStockNotifier.run();

    expect(result.alerted).toBe(1);
    expect(socketService.emitToAdmins).toHaveBeenCalled();
  });
});

describe("rebuildEmbeddings", () => {
  it("embeds only books missing a vector by default", async () => {
    const missing = { _id: "b1", title: "No Vector", authors: ["A"], save: jest.fn() };
    const hasVector = { _id: "b2", title: "Has Vector", embedding: [9, 9], save: jest.fn() };
    Book.find.mockReturnValue({ select: jest.fn().mockResolvedValue([missing, hasVector]) });
    generateEmbedding.mockResolvedValue([1, 2, 3]);

    const result = await rebuildEmbeddings.run();

    expect(result).toEqual({ total: 2, generated: 1, skipped: 1, failed: 0 });
    expect(generateEmbedding).toHaveBeenCalledTimes(1);
    expect(missing.embedding).toEqual([1, 2, 3]);
    expect(missing.save).toHaveBeenCalled();
    expect(hasVector.save).not.toHaveBeenCalled();
  });

  it("force re-embeds every active book", async () => {
    const old = { _id: "b2", title: "Stale", save: jest.fn(), embedding: [5] };
    Book.find.mockReturnValue({ select: jest.fn().mockResolvedValue([old]) });
    generateEmbedding.mockResolvedValue([7, 7]);

    const result = await rebuildEmbeddings.run({ force: true });

    expect(result.generated).toBe(1);
    expect(old.embedding).toEqual([7, 7]);
    expect(generateEmbedding).toHaveBeenCalledWith(expect.stringContaining("Stale"));
  });

  it("counts failures without aborting the batch", async () => {
    const bad = { _id: "bad", title: "", description: "", save: jest.fn() };
    const good = { _id: "good", title: "Fine", save: jest.fn() };
    Book.find.mockReturnValue({ select: jest.fn().mockResolvedValue([bad, good]) });
    generateEmbedding.mockImplementation(async (text) => {
      if (!String(text).trim()) throw new Error("no text");
      return [1];
    });

    const result = await rebuildEmbeddings.run({ force: true });

    expect(result.failed).toBeGreaterThanOrEqual(0);
    expect(result.generated + result.failed + result.skipped).toBe(2);
  });
});

describe("scheduler", () => {
  it("registers the two recurring jobs", () => {
    const names = scheduler.JOBS.map((j) => j.name);
    expect(names).toEqual(
      expect.arrayContaining(["lowStockNotifier", "expiringCoupons"])
    );
    scheduler.JOBS.forEach((job) => {
      expect(job.intervalMs).toBeGreaterThan(0);
      expect(typeof job.run).toBe("function");
    });
  });

  it("start/stop are idempotent and safe to call repeatedly", () => {
    scheduler.start();
    scheduler.start(); // second call is a no-op
    scheduler.stop();
    scheduler.stop(); // clearing again is harmless
  });

  it("runNow executes a registered job immediately", async () => {
    Coupon.updateMany.mockResolvedValue({ modifiedCount: 1 });
    const result = await scheduler.runNow("expiringCoupons");
    expect(result.skipped).toBe(false);
    expect(result.result.deactivated).toBe(1);
    expect(Coupon.updateMany).toHaveBeenCalled();
  });

  it("runNow rejects unknown job names", async () => {
    await expect(scheduler.runNow("nope")).rejects.toThrow("Unknown job: nope");
  });
});
