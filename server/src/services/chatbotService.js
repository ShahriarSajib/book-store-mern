/**
 * services/chatbotService.js — rule-based assistant.
 *
 * Without an LLM_API_KEY this service runs a deterministic assistant that:
 *   - answers from the FAQ knowledge base (FaqDocument),
 *   - finds books by keyword,
 *   - performs safe actions (add to cart, list orders, show cart),
 *   - asks for confirmation before sensitive actions (cancel order).
 *
 * If LLM_API_KEY is configured the service could be upgraded to call the
 * model with the same tool contract — this implementation stays fully
 * functional offline.
 */
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import { Conversation, FaqDocument, Book, Order, Cart } from "../models/index.js";
import { addItem } from "./cartService.js";
import { cancelOrder } from "./orderService.js";

function token() {
  return crypto.randomBytes(16).toString("hex");
}

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function strip(value) {
  return normalize(value).replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  return strip(text).split(" ").filter(Boolean);
}

async function findFaqAnswer(message) {
  const docs = await FaqDocument.find({ isActive: true }).select("question answer keywords category");
  if (!docs.length) return null;
  const STOP = new Set([
    "what", "is", "are", "your", "my", "the", "a", "an", "how", "do", "does",
    "i", "me", "can", "we", "and", "for", "of", "to", "you", "about", "it",
  ]);
  const tokens = tokenize(message).filter((word) => !STOP.has(word));
  if (!tokens.length) return null;
  let best = null;
  let bestScore = 0;
  for (const doc of docs) {
    const keywordSet = new Set((doc.keywords || []).flatMap((k) => tokenize(k)));
    const questionTokens = tokenize(doc.question).filter((word) => !STOP.has(word));
    let score = 0;
    tokens.forEach((word) => {
      if (keywordSet.has(word)) score += 3;
      if (questionTokens.includes(word)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      best = doc;
    }
  }
  if (best && bestScore >= 2) {
    return {
      reply: best.answer,
      source: { id: best._id, question: best.question, category: best.category },
    };
  }
  return null;
}

async function findBooks(message, limit = 5) {
  const words = tokenize(message);
  if (!words.length) return [];
  const stop = new Set([
    "show", "me", "my", "the", "a", "an", "of", "to", "and", "with", "for",
    "books", "book", "recommend", "recommendation", "find", "looking", "some",
    "any", "please", "about", "like", "want", "i'd", "id", "novel", "read",
  ]);
  const keys = words.filter((word) => !stop.has(word));
  const base = Book.find({ isActive: true })
    .select("title authors categories price coverImage stock averageRating")
    .sort({ averageRating: -1 })
    .limit(limit);
  if (!keys.length) return base;
  const ors = keys.flatMap((word) => [
    { title: new RegExp(word, "i") },
    { authors: new RegExp(word, "i") },
    { categories: new RegExp(word, "i") },
    { tags: new RegExp(word, "i") },
  ]);
  return Book.find({ isActive: true, $or: ors })
    .select("title authors categories price coverImage stock averageRating")
    .sort({ averageRating: -1 })
    .limit(limit);
}

async function addToCart(userId, bookId, quantity = 1) {
  return addItem(userId, bookId, quantity);
}

function detectBookAdd(message) {
  const addRegex = /add.*(?:book|to.*cart)|buy|purchase/i;
  if (!addRegex.test(message)) return null;
  const bookName = message.replace(/(?:add|buy|purchase).*(?:book)?\s+to\s+(?:my\s+)?cart|add|buy|purchase|please|book/i, "").trim();
  return bookName;
}

async function buildReply(userId, message) {
  const lower = normalize(message);

  // Greeting
  if (/^(hi|hello|hey|assalam|salam)\b/.test(lower)) {
    return {
      reply: "Hello! I can help you find books, answer store questions, and manage your cart or orders. Try \u201cshow me fantasy books\u201d or \u201cwhat is your return policy?\u201d.",
    };
  }

  // Order lookup
  if (/my\s+orders|order\s+status|track.*order|where is my order/i.test(lower)) {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    if (!orders.length) {
      return { reply: "You don't have any orders yet. Browse the catalog and place your first order!" };
    }
    const lines = orders.map((o) => `\u2022 ${o.orderNumber} \u2014 ${o.status} (${new Date(o.createdAt).toLocaleDateString()}) \u2014 $${o.total.toFixed(2)}`).join("\n");
    return { reply: `Here are your recent orders:\n${lines}\n\nAsk me to cancel a pending one if needed.` };
  }

  // Show cart
  if (/my\s+cart|show.*cart|what.*in.*cart/i.test(lower)) {
    const cart = await Cart.findOne({ user: userId }).populate("items.book", "title price");
    if (!cart || !cart.items.length) {
      return { reply: "Your cart is empty. Try \u201cadd The Hobbit to my cart\u201d." };
    }
    const lines = cart.items.map((i) => `\u2022 ${i.book.title} \u00d7 ${i.quantity} \u2014 $${(i.book.price * i.quantity).toFixed(2)}`).join("\n");
    return { reply: `Your cart:\n${lines}` };
  }

  // Cancel order (sensitive -> confirmation token)
  const cancelMatch = lower.match(/cancel\s+(?:order\s+)?([A-Za-z0-9-]+)/);
  if (cancelMatch && /cancel/i.test(lower)) {
    const ref = cancelMatch[1].toUpperCase();
    const order = await Order.findOne({ user: userId, orderNumber: ref });
    if (!order) return { reply: `I couldn't find an order with number ${ref}. Check your order history to confirm the number.` };
    if (!["pending", "processing"].includes(order.status)) {
      return { reply: `Order ${ref} is already ${order.status} and cannot be cancelled.` };
    }
    const confirmationToken = token();
    return {
      reply: `To confirm: do you want to cancel order ${ref}? Reply with the confirmation below, or say \u201cyes\u201d.`,
      tool: { name: "cancelOrder", args: { orderId: String(order._id) }, confirmationToken, status: "pending" },
    };
  }

  // Add to cart (safe action) — look for an explicit book title match
  const title = detectBookAdd(message);
  if (title) {
    const books = await findBooks(title, 3);
    if (books.length) {
      const book = books[0];
      await addToCart(userId, book._id, 1);
      return {
        reply: `Added \u201c${book.title}\u201d to your cart.`,
        books: [book],
      };
    }
    return { reply: `I couldn't find a book matching \u201c${title}\u201d. Try a different title.` };
  }

  // Book discovery
  const bookWords = ["book", "books", "read", "recommend", "find", "looking", "show", "sci-fi", "fantasy", "novel", "python", "fiction"];
  if (bookWords.some((word) => strip(lower).includes(word))) {
    const books = await findBooks(message, 5);
    if (books.length) {
      const lines = books.map((b) => `\u2022 ${b.title} \u2014 by ${b.authors?.[0] || "unknown"} \u2014 $${b.price.toFixed(2)}`).join("\n");
      return {
        reply: `Here's what I found:\n${lines}\n\nTap any book above to open it, or ask me to add one to your cart.`,
        books,
      };
    }
    return { reply: "I couldn't find any matching books. Try a different title, author, or topic." };
  }

  // FAQ knowledge base
  const faq = await findFaqAnswer(message);
  if (faq) return { reply: faq.reply, source: faq.source };

  return {
    reply: "I can help you find books, check your cart and orders, and answer questions about shipping, payments, and returns. Try \u201crecommend a fantasy novel\u201d or \u201cwhat is your refund policy?\u201d.",
  };
}

async function getConversation(userId, conversationId) {
  if (conversationId) {
    const convo = await Conversation.findOne({ _id: conversationId, user: userId });
    if (convo) return convo;
  }
  const recent = await Conversation.findOne({ user: userId }).sort({ updatedAt: -1 });
  if (recent) return recent;
  return Conversation.create({ user: userId, title: "New chat" });
}

async function sendMessage(userId, { message, conversationId }) {
  const text = String(message || "").trim();
  if (!text) throw new AppError("Message is required", 400, "VALIDATION_ERROR");

  const conversation = await getConversation(userId, conversationId);
  conversation.messages.push({ role: "user", content: text });

  const result = await buildReply(userId, text);

  conversation.messages.push({
    role: "assistant",
    content: result.reply,
    books: (result.books || []).map((b) => ({ book: b._id })),
    tool: result.tool
      ? {
          name: result.tool.name,
          args: result.tool.args,
          status: result.tool.status,
          confirmationToken: result.tool.confirmationToken,
        }
      : undefined,
  });
  if (conversation.messages.length === 2 && conversation.title === "New chat") {
    conversation.title = text.slice(0, 60);
  }
  await conversation.save();

  return {
    conversationId: conversation._id,
    reply: result.reply,
    books: result.books || [],
    source: result.source,
    tool: result.tool
      ? { name: result.tool.name, args: result.tool.args, confirmationToken: result.tool.confirmationToken, status: result.tool.status }
      : null,
  };
}

async function confirmAction(userId, confirmationToken) {
  const conversation = await Conversation.findOne({ user: userId, "messages.tool.confirmationToken": confirmationToken });
  if (!conversation) throw new AppError("Confirmation token is invalid or has expired", 400, "INVALID_CONFIRMATION");

  const index = conversation.messages.findIndex((m) => m.tool?.confirmationToken === confirmationToken);
  const pending = conversation.messages[index];
  if (!pending || pending.tool.status !== "pending") {
    throw new AppError("This action was already resolved", 400, "ACTION_RESOLVED");
  }

  const { name, args } = pending.tool;
  let reply;
  if (name === "cancelOrder") {
    const order = await cancelOrder(userId, args.orderId, "Cancelled via AI assistant");
    reply = `Order ${order.orderNumber} has been cancelled and your refund/stock is restored.`;
  } else {
    throw new AppError("Unknown action", 400, "UNKNOWN_ACTION");
  }

  pending.tool.status = "done";
  conversation.messages.push({ role: "assistant", content: reply });
  await conversation.save();

  return { conversationId: conversation._id, reply };
}

async function history(userId) {
  const conversations = await Conversation.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(30)
    .select("title updatedAt createdAt");
  return { conversations };
}

async function clearHistory(userId) {
  await Conversation.deleteMany({ user: userId });
  return { success: true };
}

export { sendMessage, confirmAction, history, clearHistory };
