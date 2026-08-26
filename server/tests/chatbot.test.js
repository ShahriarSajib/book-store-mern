/**
 * tests/chatbot.test.js — rule-based assistant: greetings, order lookup,
 * cart display, book discovery, FAQ grounding, and the cancel-order
 * confirmation guardrail.
 */
jest.mock("../src/models", () => ({
  Conversation: { findOne: jest.fn(), create: jest.fn(), find: jest.fn(), deleteMany: jest.fn() },
  FaqDocument: { find: jest.fn() },
  Book: { find: jest.fn(), findById: jest.fn() },
  Order: { find: jest.fn(), findOne: jest.fn() },
  Cart: { findOne: jest.fn(), create: jest.fn() },
}));
const { Conversation, FaqDocument, Book, Order, Cart } = require("../src/models");

jest.mock("../src/services/orderService");
const orderService = require("../src/services/orderService");

const chatbotService = require("../src/services/chatbotService");

function makeConvo(messages = [], title = "New chat") {
  return {
    _id: "conv1",
    user: "u1",
    title,
    messages,
    save: jest.fn().mockResolvedValue(undefined),
  };
}

// Conversation.findOne is called with two shapes:
//   getConversation: { user } → chainable .sort()   |   {_id, user} → direct
//   confirmAction:   { "messages.tool.confirmationToken": token } → direct
let directResult = null;
let recentResult = null;

beforeEach(() => {
  jest.clearAllMocks();
  directResult = null;
  recentResult = null;
  Conversation.findOne.mockImplementation((query = {}) => {
    // Mongoose queries are thenable AND chainable: findOne(...) returns an
    // object with .sort() synchronously; only the final link is awaited.
    const isDirect =
      query["messages.tool.confirmationToken"] !== undefined || query._id !== undefined;
    if (isDirect) return directResult;
    return { sort: async () => recentResult };
  });
  // Default FAQ KB: empty (tests override when needed).
  FaqDocument.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
});

describe("sendMessage", () => {
  it("rejects an empty message", async () => {
    await expect(chatbotService.sendMessage("u1", { message: "   " })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("greets and persists both sides of the exchange", async () => {
    const fresh = makeConvo();
    Conversation.create.mockResolvedValue(fresh);

    const result = await chatbotService.sendMessage("u1", { message: "Hello!" });

    expect(result.reply).toMatch(/^Hello!/);
    expect(result.tool).toBeNull();
    expect(fresh.messages).toHaveLength(2);
    expect(fresh.messages[0].role).toBe("user");
    expect(fresh.messages[1].role).toBe("assistant");
    expect(fresh.title).toBe("Hello!"); // auto-titled from first message
    expect(fresh.save).toHaveBeenCalled();
  });

  it("reuses the most recent conversation when present", async () => {
    recentResult = makeConvo();

    const result = await chatbotService.sendMessage("u1", { message: "hi" });

    expect(result.conversationId).toBe("conv1");
    expect(Conversation.create).not.toHaveBeenCalled();
  });

  it("reports when the user has no orders", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    Order.find.mockReturnValue({
      sort: () => ({ limit: jest.fn().mockResolvedValue([]) }),
    });

    const result = await chatbotService.sendMessage("u1", { message: "show my orders" });

    expect(result.reply).toContain("don't have any orders");
  });

  it("lists recent orders when they exist", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    Order.find.mockReturnValue({
      sort: () => ({
        limit: jest.fn().mockResolvedValue([
          { orderNumber: "ORD-1", status: "shipped", createdAt: new Date(), total: 41.79 },
        ]),
      }),
    });

    const result = await chatbotService.sendMessage("u1", { message: "my orders status" });

    expect(result.reply).toContain("ORD-1");
    expect(result.reply).toContain("$41.79");
  });

  it("shows an empty cart", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    Cart.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    const result = await chatbotService.sendMessage("u1", { message: "what is in my cart?" });

    expect(result.reply).toContain("cart is empty");
  });

  it("finds books by keyword", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    const dune = {
      _id: "b1",
      title: "Dune",
      authors: ["Frank Herbert"],
      price: 20,
      averageRating: 4.5,
    };
    Book.find.mockReturnValue({
      select: () => ({
        sort: () => ({ limit: jest.fn().mockResolvedValue([dune]) }),
      }),
    });

    const result = await chatbotService.sendMessage("u1", {
      message: "recommend a fantasy novel",
    });

    expect(result.books).toHaveLength(1);
    expect(result.books[0].title).toBe("Dune");
    expect(result.reply).toContain("$20.00");
  });

  it("adds a book to the cart on a buy request (safe action)", async () => {
    const dune = { _id: "b1", title: "Dune", authors: ["Frank Herbert"], price: 20 };
    const fresh = makeConvo();
    Conversation.create.mockResolvedValue(fresh);
    Book.find.mockReturnValue({
      select: () => ({
        sort: () => ({ limit: jest.fn().mockResolvedValue([dune]) }),
      }),
    });
    Book.findById.mockResolvedValue({ _id: "b1", price: 20, stock: 5, isActive: true });
    Cart.findOne.mockResolvedValue(null);
    Cart.create.mockResolvedValue(makeCartLike());

    const result = await chatbotService.sendMessage("u1", { message: "buy Dune" });

    expect(result.reply).toMatch(/Added .Dune. to your cart/);
    expect(Cart.create).toHaveBeenCalled();
  });

  function makeCartLike() {
    return {
      items: [],
      coupon: undefined,
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
  }

  it("answers from the FAQ knowledge base", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    FaqDocument.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        {
          _id: "f1",
          question: "What is your return policy?",
          answer: "You can return any book within 30 days of delivery.",
          category: "returns",
          keywords: ["return", "refund", "policy"],
        },
      ]),
    });

    const result = await chatbotService.sendMessage("u1", {
      message: "what is your return policy?",
    });

    expect(result.reply).toContain("within 30 days");
    expect(result.source).toMatchObject({ id: "f1", category: "returns" });
  });

  it("prefers FAQ grounding over the generic fallback", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    FaqDocument.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        {
          _id: "f2",
          question: "Do you ship internationally?",
          answer: "Yes, we ship to 40+ countries.",
          category: "shipping",
          keywords: ["ship", "international"],
        },
      ]),
    });

    const result = await chatbotService.sendMessage("u1", {
      message: "do you ship internationally?",
    });

    expect(result.reply).toContain("40+ countries");
  });

  it("falls back to a help prompt when nothing matches", async () => {
    Conversation.create.mockResolvedValue(makeConvo());

    const result = await chatbotService.sendMessage("u1", { message: "zzz qqq xxx" });

    expect(result.reply).toContain("I can help you find books");
  });
});

describe("cancel-order confirmation guardrail", () => {
  it("requires confirmation before cancelling and stores a pending tool call", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    Order.findOne.mockResolvedValue({
      _id: "oid1",
      orderNumber: "ORD-123",
      status: "pending",
    });

    const result = await chatbotService.sendMessage("u1", { message: "cancel order ORD-123" });

    expect(result.reply).toContain("To confirm");
    expect(result.tool).toMatchObject({
      name: "cancelOrder",
      args: { orderId: "oid1" },
      status: "pending",
    });
    expect(result.tool.confirmationToken).toHaveLength(32);
    // Nothing was cancelled yet — guardrail held.
    expect(orderService.cancelOrder).not.toHaveBeenCalled();
  });

  it("refuses to cancel a shipped order", async () => {
    Conversation.create.mockResolvedValue(makeConvo());
    Order.findOne.mockResolvedValue({ _id: "oid1", orderNumber: "ORD-9", status: "shipped" });

    const result = await chatbotService.sendMessage("u1", { message: "cancel order ORD-9" });

    expect(result.reply).toContain("cannot be cancelled");
    expect(result.tool).toBeNull();
  });

  it("executes cancellation only after a valid confirmation token", async () => {
    const token = "a".repeat(32);
    const pendingMessage = {
      role: "assistant",
      content: "To confirm...",
      tool: {
        name: "cancelOrder",
        args: { orderId: "oid1" },
        status: "pending",
        confirmationToken: token,
      },
    };
    const convo = makeConvo([pendingMessage]);
    directResult = convo; // found via confirmation-token lookup
    orderService.cancelOrder.mockResolvedValue({ orderNumber: "ORD-123" });

    const result = await chatbotService.confirmAction("u1", token);

    expect(orderService.cancelOrder).toHaveBeenCalledWith(
      "u1",
      "oid1",
      expect.stringContaining("AI assistant")
    );
    expect(pendingMessage.tool.status).toBe("done");
    expect(result.reply).toContain("ORD-123 has been cancelled");
    expect(convo.messages[convo.messages.length - 1].content).toContain("cancelled");
    expect(convo.save).toHaveBeenCalled();
  });

  it("rejects an unknown confirmation token", async () => {
    await expect(chatbotService.confirmAction("u1", "bad-token")).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_CONFIRMATION",
    });
  });

  it("prevents double-execution of an already-resolved action", async () => {
    const token = "b".repeat(32);
    directResult = makeConvo([
      {
        role: "assistant",
        tool: {
          name: "cancelOrder",
          args: { orderId: "oid1" },
          status: "done",
          confirmationToken: token,
        },
      },
    ]);

    await expect(chatbotService.confirmAction("u1", token)).rejects.toMatchObject({
      code: "ACTION_RESOLVED",
    });
    expect(orderService.cancelOrder).not.toHaveBeenCalled();
  });
});

describe("chat history", () => {
  it("lists recent conversations newest-first", async () => {
    Conversation.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          select: () => [{ title: "chat A" }, { title: "chat B" }],
        }),
      }),
    });
    const { conversations } = await chatbotService.history("u1");
    expect(conversations).toHaveLength(2);
  });

  it("clears all conversations for the user", async () => {
    Conversation.deleteMany.mockResolvedValue({ deletedCount: 3 });
    const result = await chatbotService.clearHistory("u1");
    expect(Conversation.deleteMany).toHaveBeenCalledWith({ user: "u1" });
    expect(result.success).toBe(true);
  });
});
