/**
 * tests/cartOrder.test.js — cart operations, checkout pricing math,
 * payment-method branching, and cancellation eligibility.
 * Models, coupon service, sockets, and notifications are mocked.
 */
jest.mock("../src/models", () => ({
  Order: { findOne: jest.fn(), findById: jest.fn(), create: jest.fn(), findOneAndUpdate: jest.fn(), countDocuments: jest.fn(), find: jest.fn() },
  Cart: { findOne: jest.fn(), create: jest.fn(), findOneAndUpdate: jest.fn() },
  Book: { findById: jest.fn(), updateOne: jest.fn(), find: jest.fn() },
  User: { findById: jest.fn() },
  Notification: { create: jest.fn(), insertMany: jest.fn() },
}));
const { Cart, Book, Order, User, Notification } = require("../src/models");

jest.mock("../src/services/couponService", () => ({
  apply: jest.fn(),
  trackUsage: jest.fn(),
}));
const couponService = require("../src/services/couponService");

jest.mock("../src/services/socketService", () => ({
  emitToUser: jest.fn(),
  emitToAdmins: jest.fn(),
  emitToInventory: jest.fn(),
  isLowStock: jest.fn(() => false),
  LOW_STOCK_THRESHOLD: 5,
}));

jest.mock("../src/services/notificationService", () => ({
  sendOrderConfirmation: jest.fn(),
  sendOrderStatusUpdate: jest.fn(),
}));
const notificationService = require("../src/services/notificationService");

const cartService = require("../src/services/cartService");
const orderService = require("../src/services/orderService");
const AppError = require("../src/utils/AppError").default;

function makeCart(overrides = {}) {
  const cart = {
    _id: "c1",
    user: "u1",
    items: [],
    coupon: undefined,
    save: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn(async function populate() {
      return cart;
    }),
    ...overrides,
  };
  return cart;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("cartService.addItem", () => {
  it("creates a cart and adds a new item at the current price", async () => {
    const book = { _id: "b1", title: "Dune", price: 20, stock: 5, isActive: true };
    Book.findById.mockResolvedValue(book);
    Cart.findOne.mockResolvedValue(null);
    const created = makeCart();
    Cart.create.mockResolvedValue(created);

    const cart = await cartService.addItem("u1", "b1", 2);

    expect(Cart.create).toHaveBeenCalledWith({ user: "u1", items: [] });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({ book: "b1", quantity: 2, price: 20 });
    expect(cart.save).toHaveBeenCalled();
  });

  it("merges quantities for an existing item", async () => {
    const book = { _id: "b1", title: "Dune", price: 20, stock: 10, isActive: true };
    Book.findById.mockResolvedValue(book);
    const cart = makeCart({ items: [{ book: "b1", quantity: 1, price: 18 }] });
    Cart.findOne.mockResolvedValue(cart);

    await cartService.addItem("u1", "b1", 3);

    expect(cart.items[0].quantity).toBe(4);
    expect(cart.items[0].price).toBe(20); // refreshed to current price
  });

  it("rejects quantities above available stock with 409", async () => {
    Book.findById.mockResolvedValue({ _id: "b1", price: 20, stock: 5, isActive: true });
    Cart.findOne.mockResolvedValue(makeCart({ items: [{ book: "b1", quantity: 4 }] }));

    await expect(cartService.addItem("u1", "b1", 2)).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
    });
  });

  it("rejects inactive books with 400", async () => {
    Book.findById.mockResolvedValue({ _id: "b1", price: 20, stock: 5, isActive: false });
    Cart.findOne.mockResolvedValue(makeCart());

    await expect(cartService.addItem("u1", "b1")).rejects.toMatchObject({
      statusCode: 400,
      code: "BOOK_INACTIVE",
    });
  });

  it("removeItem drops only the targeted book", async () => {
    Cart.findOne.mockResolvedValue(
      makeCart({ items: [{ book: "b1", quantity: 1 }, { book: "b2", quantity: 2 }] })
    );
    const cart = await cartService.removeItem("u1", "b1");
    expect(cart.items.map((i) => i.book)).toEqual(["b2"]);
  });

  it("applyCoupon stores code+discount on the cart", async () => {
    const subtotal = 40;
    const cart = makeCart({
      items: [
        { book: "b1", quantity: 1, price: 20 },
        { book: "b2", quantity: 1, price: 20 },
      ],
    });
    Cart.findOne.mockResolvedValue(cart);
    couponService.apply.mockResolvedValue({ coupon: { code: "SAVE10" }, discount: 4 });

    await cartService.applyCoupon("u1", "save10");

    expect(couponService.apply).toHaveBeenCalledWith("save10", subtotal);
    expect(cart.coupon).toEqual({ code: "SAVE10", discount: 4 });
  });
});

describe("orderService.createOrder pricing", () => {
  const populatedBooks = {
    b1: { _id: "b1", title: "Dune", coverImage: "", price: 20, stock: 10, isActive: true },
    b2: { _id: "b2", title: "Emma", coverImage: "", price: 20, stock: 1, isActive: true },
  };

  function setupCart(items, coupon) {
    const cart = makeCart({ items, coupon });
    Cart.findOne.mockReturnValue({ populate: jest.fn(async () => cart) });
    return cart;
  }

  beforeEach(() => {
    Book.updateOne.mockResolvedValue({});
    Book.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
    // User.findById is called bare (resolveShippingAddress → .addresses)
    // and chained with .select("name email") — support both shapes.
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ name: "Test", email: "t@example.com" }),
      name: "Test",
      email: "t@example.com",
      addresses: [
        {
          street: "1 Main St",
          recipient: "Test",
          isDefault: true,
          toObject() {
            return { street: this.street, recipient: this.recipient, isDefault: this.isDefault };
          },
        },
      ],
    });
    Notification.create.mockResolvedValue({});
    Order.create.mockImplementation(async (data) => ({ _id: "o1", ...data }));
  });

  it("computes subtotal, percent discount, shipping, tax and total", async () => {
    const cart = setupCart([{ book: populatedBooks.b1, quantity: 2 }], { code: "SAVE10" });
    couponService.apply.mockResolvedValue({
      coupon: { code: "SAVE10", type: "percent", value: 10 },
      discount: 4,
    });

    const { order } = await orderService.createOrder("u1", {});

    // subtotal 40 − 4 discount = 36 → shipping 3.99 (<50), tax 5% = 1.80
    expect(order.subtotal).toBe(40);
    expect(order.discount).toBeUndefined();
    expect(order.coupon).toEqual({ code: "SAVE10", discount: 4 });
    expect(order.shipping).toBe(3.99);
    expect(order.tax).toBeCloseTo(1.8, 2);
    expect(order.total).toBeCloseTo(41.79, 2);
    expect(order.status).toBe("pending");
    expect(order.orderNumber).toMatch(/^ORD-\d{8}-[A-F0-9]{6}$/);
    expect(couponService.trackUsage).toHaveBeenCalledWith("SAVE10");
    expect(cart.items).toHaveLength(0); // COD clears the cart
  });

  it("grants free shipping at the threshold and skips coupon when none applied", async () => {
    setupCart([{ book: populatedBooks.b1, quantity: 3 }], undefined);

    const { order } = await orderService.createOrder("u1", {});

    expect(order.subtotal).toBe(60);
    expect(order.shipping).toBe(0);
    expect(order.tax).toBeCloseTo(3, 2);
    expect(order.total).toBeCloseTo(63, 2);
    expect(order.coupon).toBeUndefined();
    expect(couponService.apply).not.toHaveBeenCalled();
  });

  it("decrements stock immediately for cash-on-delivery", async () => {
    setupCart([{ book: populatedBooks.b1, quantity: 2 }], undefined);

    const { order, isOnlinePayment } = await orderService.createOrder("u1", {
      paymentMethod: "cash_on_delivery",
    });

    expect(isOnlinePayment).toBe(false);
    expect(Book.updateOne).toHaveBeenCalledWith(
      { _id: "b1", stock: { $gte: 2 } },
      { $inc: { stock: -2, purchaseCount: 2 } }
    );
    expect(order.paymentStatus).toBe("pending");
  });

  it("defers stock decrement for online card payments", async () => {
    const cart = setupCart([{ book: populatedBooks.b1, quantity: 2 }], undefined);

    const { isOnlinePayment } = await orderService.createOrder("u1", { paymentMethod: "card" });

    expect(isOnlinePayment).toBe(true);
    expect(Book.updateOne).not.toHaveBeenCalled();
    expect(cart.save).not.toHaveBeenCalled(); // cart cleared later by webhook
  });

  it("treats bKash as an online payment and defers stock decrement", async () => {
    const cart = setupCart([{ book: populatedBooks.b1, quantity: 2 }], undefined);

    const { order, isOnlinePayment } = await orderService.createOrder("u1", {
      paymentMethod: "bkash",
    });

    expect(isOnlinePayment).toBe(true);
    expect(order.paymentMethod).toBe("bkash");
    expect(order.paymentStatus).toBe("pending");
    expect(Book.updateOne).not.toHaveBeenCalled();
    expect(cart.save).not.toHaveBeenCalled();
  });

  it("rejects checkout with an empty cart", async () => {
    Cart.findOne.mockReturnValue({ populate: jest.fn(async () => makeCart()) });
    await expect(orderService.createOrder("u1", {})).rejects.toMatchObject({
      statusCode: 400,
      code: "CART_EMPTY",
    });
  });

  it("rejects when a cart item exceeds stock", async () => {
    setupCart([{ book: populatedBooks.b2, quantity: 3 }], undefined); // stock 1
    await expect(orderService.createOrder("u1", {})).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
    });
  });

  it("falls back to the user default address when none provided", async () => {
    setupCart([{ book: populatedBooks.b1, quantity: 1 }], undefined);
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ name: "Test", email: "t@example.com" }),
      addresses: [
        {
          street: "1 Main",
          recipient: "Test",
          isDefault: false,
          toObject() {
            return { street: this.street, recipient: this.recipient, isDefault: this.isDefault };
          },
        },
      ],
    });
    Order.create.mockImplementation(async (data) => ({ _id: "o1", ...data }));

    const { order } = await orderService.createOrder("u1", {});
    expect(order.shippingAddress.street).toBe("1 Main");
    expect(order.shippingAddress._id).toBeUndefined();
  });
});

describe("orderService.cancelOrder", () => {
  it("returns 404 for another user's order", async () => {
    Order.findOne.mockResolvedValue(null);
    await expect(orderService.cancelOrder("u1", "o1", "changed mind")).rejects.toBeInstanceOf(
      AppError
    );
  });

  it("blocks cancellation after shipment", async () => {
    Order.findOne.mockResolvedValue({ _id: "o1", status: "shipped", items: [] });
    await expect(orderService.cancelOrder("u1", "o1")).rejects.toMatchObject({
      statusCode: 400,
      code: "ORDER_NOT_CANCELLABLE",
    });
  });

  it("restores stock when cancelling a pending order", async () => {
    Book.updateOne.mockResolvedValue({});
    const save = jest.fn().mockResolvedValue(undefined);
    Order.findOne.mockResolvedValue({
      _id: "o1",
      status: "pending",
      save,
      items: [{ book: "b1", quantity: 2 }],
    });

    const order = await orderService.cancelOrder("u1", "o1", "changed mind");

    expect(save).toHaveBeenCalled();
    expect(order.status).toBe("cancelled");
    expect(order.cancelledAt).toBeInstanceOf(Date);
    expect(Book.updateOne).toHaveBeenCalledWith({ _id: "b1" }, { $inc: { stock: 2 } });
  });
});

describe("orderService.confirmPayment (Stripe webhook path)", () => {
  it("is idempotent for already-paid orders", async () => {
    const paid = { _id: "o1", paymentStatus: "paid", items: [] };
    Order.findById.mockResolvedValue(paid);

    const result = await orderService.confirmPayment("o1", "sess", "pi_1");

    expect(result).toBe(paid);
    expect(Cart.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("marks paid, decrements stock and clears the cart", async () => {
    Book.updateOne.mockResolvedValue({});
    Book.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
    const order = {
      _id: "o1",
      user: "u1",
      orderNumber: "ORD-X",
      total: 41.79,
      paymentStatus: "pending",
      items: [{ book: "b1", quantity: 2 }],
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findById.mockResolvedValue(order);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const result = await orderService.confirmPayment("o1", "sess_1", "pi_1");

    expect(result.paymentStatus).toBe("paid");
    expect(result.paidAt).toBeInstanceOf(Date);
    expect(result.stripeSessionId).toBe("sess_1");
    expect(Book.updateOne).toHaveBeenCalledWith(
      { _id: "b1", stock: { $gte: 2 } },
      { $inc: { stock: -2, purchaseCount: 2 } }
    );
    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "u1" },
      expect.anything()
    );
  });

  it("stores bKash payment + transaction IDs when confirming a bKash order", async () => {
    Book.updateOne.mockResolvedValue({});
    Book.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
    const order = {
      _id: "o1",
      user: "u1",
      orderNumber: "ORD-BK",
      total: 41.79,
      paymentStatus: "pending",
      items: [{ book: "b1", quantity: 1 }],
      save: jest.fn().mockResolvedValue(undefined),
    };
    Order.findById.mockResolvedValue(order);
    Cart.findOneAndUpdate.mockResolvedValue({});

    const result = await orderService.confirmPayment("o1", null, null, {
      bkashPaymentId: "TR0011PAY123",
      bkashTrxId: "BKTX456",
    });

    expect(result.paymentStatus).toBe("paid");
    expect(result.bkashPaymentId).toBe("TR0011PAY123");
    expect(result.bkashTrxId).toBe("BKTX456");
    expect(Book.updateOne).toHaveBeenCalled();
    expect(Cart.findOneAndUpdate).toHaveBeenCalled();
  });
});

describe("orderService.updateStatus shipping tracking", () => {
  function makeOrder(overrides = {}) {
    const order = {
      _id: "o1",
      orderNumber: "ORD-20260830-ABC",
      user: "u1",
      status: "processing",
      trackingNumber: null,
      items: [],
      save: jest.fn(function save() {
        return Promise.resolve(order);
      }),
      ...overrides,
    };
    return order;
  }

  beforeEach(() => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "u1", name: "Ada", email: "ada@example.com" }),
    });
  });

  it("auto-generates a tracking number and stamps shippedAt when an order ships", async () => {
    const order = makeOrder();
    Order.findById.mockResolvedValue(order);

    const updated = await orderService.updateStatus("o1", { status: "shipped" });

    expect(updated.trackingNumber).toMatch(/^BV[A-Z2-9]{12}\d{2}$/);
    expect(updated.trackingProvider).toBe("Standard Post");
    expect(updated.shippedAt).toBeInstanceOf(Date);
    expect(order.save).toHaveBeenCalled();
    expect(notificationService.sendOrderStatusUpdate).toHaveBeenCalledWith(order, "processing");
  });

  it("never overwrites an existing tracking number or shippedAt date", async () => {
    const order = makeOrder({
      trackingNumber: "1Z999AA10123456784",
      shippedAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    Order.findById.mockResolvedValue(order);

    const updated = await orderService.updateStatus("o1", { status: "shipped" });

    expect(updated.trackingNumber).toBe("1Z999AA10123456784");
    expect(updated.shippedAt.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("keeps an admin-pasted courier number and its provider", async () => {
    const order = makeOrder();
    Order.findById.mockResolvedValue(order);

    const updated = await orderService.updateStatus("o1", {
      status: "shipped",
      trackingNumber: "EC-45678-123",
      trackingProvider: "eCourier Logistics",
    });

    expect(updated.trackingNumber).toBe("EC-45678-123");
    expect(updated.trackingProvider).toBe("eCourier Logistics");
    expect(updated.shippedAt).toBeInstanceOf(Date);
  });

  it("does not fabricate a tracking number before the order ships", async () => {
    const order = makeOrder();
    Order.findById.mockResolvedValue(order);

    const updated = await orderService.updateStatus("o1", { status: "confirmed" });

    expect(updated.trackingNumber).toBeNull();
    expect(updated.shippedAt).toBeUndefined();
  });
});
