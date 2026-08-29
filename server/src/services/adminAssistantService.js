/**
 * services/adminAssistantService.js — admin-panel AI assistant.
 * Answers admin queries with LIVE data (sales, analytics, inventory, catalog)
 * and can perform admin actions (add book, update stock, update order status)
 * behind a confirmation token.
 */
import AppError from "../utils/AppError.js";
import { Book, Order, Author, Publisher, Category, Conversation } from "../models/index.js";
import * as adminService from "./adminService.js";
import * as analyticsService from "./analyticsService.js";
import * as inventoryService from "./inventoryService.js";
import * as bookService from "./bookService.js";
import * as orderService from "./orderService.js";
import * as catalogService from "./catalogService.js";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function token() {
  return `BVX-${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function fmtMoney(n) {
  return (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function fmtNumber(n) {
  return (n ?? 0).toLocaleString();
}

async function getConversation(userId, conversationId) {
  if (conversationId) {
    const convo = await Conversation.findOne({ _id: conversationId, user: userId });
    if (convo) return convo;
  }
  const recent = await Conversation.findOne({ user: userId }).sort({ updatedAt: -1 });
  if (recent) return recent;
  return Conversation.create({ user: userId, title: "Admin assistant" });
}

// ---- Informational handlers ----

async function answerOverview() {
  const d = await adminService.getDashboard();
  const s = d.stats;
  return {
    reply: [
      "Here is the store at a glance:",
      `\u2022 Books: ${fmtNumber(s.books)} (${fmtNumber(s.authors)} authors, ${fmtNumber(s.categories)} categories, ${fmtNumber(s.publishers)} publishers)`,
      `\u2022 Users: ${fmtNumber(s.users)} total (${fmtNumber(s.activeUsers)} active)`,
      `\u2022 Orders: ${fmtNumber(s.orders)} (${fmtNumber(s.pendingOrders)} pending)`,
      `\u2022 Total revenue (non-cancelled): ${fmtMoney(s.revenue)}`,
      "\nAsk about sales, inventory, low stock, top sellers, or catalog counts.",
    ].join("\n"),
  };
}

async function answerSales(message) {
  const lower = normalize(message);
  const daysMatch = lower.match(/(\d+)\s*(?:days?|day)/);
  const groupBy = /monthly|per month|by month/.test(lower) ? "month" : "day";
  const days = daysMatch ? Number(daysMatch[1]) : 30;

  const report = await analyticsService.salesReport({ days, groupBy });
  const summary = report.summary;
  const series = report.series || [];

  const lines = [`Sales for the last ${days} days (grouped by ${groupBy}):`];
  lines.push(`\u2022 Revenue: ${fmtMoney(summary.revenue)} across ${fmtNumber(summary.orders)} orders (${fmtNumber(summary.items)} items)`);
  series.slice(-6).forEach((pt) => {
    const key = String(pt._id ?? "?");
    lines.push(`\u2022 ${key}: ${fmtMoney(pt.revenue)} (${fmtNumber(pt.orders)} orders)`);
  });
  if (report.topBooks?.length) {
    lines.push("\nTop sellers:");
    report.topBooks.slice(0, 5).forEach((b, i) => {
      lines.push(`${i + 1}. ${b._id} \u2014 ${fmtNumber(b.qty)} sold \u2014 ${fmtMoney(b.revenue)}`);
    });
  }
  return { reply: lines.join("\n") };
}

async function answerInventory(message) {
  const lower = normalize(message);
  const lowOnly = /low\s*stock|low/.test(lower);
  const outOnly = /out\s*of\s*stock/.test(lower);

  if (outOnly) {
    const [count, items] = await Promise.all([
      Book.countDocuments({ stock: { $lte: 0 } }),
      Book.find({ stock: { $lte: 0 } }).select("title stock price").sort({ stock: 1 }).limit(5).lean(),
    ]);
    const lines = [`${fmtNumber(count)} book(s) are out of stock (stock \u2264 0).`];
    items.forEach((b) => lines.push(`\u2022 ${b.title} \u2014 ${fmtNumber(b.stock)}`));
    if (count > items.length) lines.push(`\u2026 and ${fmtNumber(count - items.length)} more.`);
    return { reply: lines.join("\n") };
  }

  if (lowOnly) {
    const count = await Book.countDocuments({ stock: { $gt: 0, $lte: 10 } });
    const { items } = await inventoryService.list({ page: 1, limit: 8, lowOnly: "true" });
    const lines = [`${fmtNumber(count)} book(s) have low stock (1\u201310 units).`];
    items.forEach((b) => lines.push(`\u2022 ${b.title} \u2014 ${fmtNumber(b.stock)} in stock`));
    return { reply: lines.join("\n") };
  }

  const [books, totalValue, totalUnits] = await Promise.all([
    Book.countDocuments(),
    Book.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ["$stock", "$price"] } } } }]),
    Book.aggregate([{ $group: { _id: null, units: { $sum: "$stock" } } }]),
  ]);
  const low = await Book.countDocuments({ stock: { $gt: 0, $lte: 10 } });
  const out = await Book.countDocuments({ stock: { $lte: 0 } });
  return {
    reply: [
      "Inventory summary:",
      `\u2022 ${fmtNumber(books)} book titles`,
      `\u2022 ${fmtNumber(totalUnits[0]?.units || 0)} total units on hand`,
      `\u2022 Inventory value: ${fmtMoney(totalValue[0]?.value || 0)}`,
      `\u2022 ${fmtNumber(low)} low stock (1\u201310) \u2022 ${fmtNumber(out)} out of stock`,
      "\nTry \u201clow stock alert\u201d or \u201cbooks out of stock\u201d for details.",
    ].join("\n"),
  };
}

async function answerCatalog(message) {
  const lower = normalize(message);

  const [books, authors, publishers, categories] = await Promise.all([
    Book.countDocuments(),
    Author.countDocuments(),
    Publisher.countDocuments(),
    Category.countDocuments(),
  ]);

  const lines = ["Catalog summary:", `\u2022 ${fmtNumber(books)} books`];

  if (/author/i.test(lower)) {
    const { items } = await catalogService.authors.list({ page: 1, limit: 8 });
    lines.push(`\u2022 ${fmtNumber(authors)} authors. Sample:`);
    items.forEach((a) => lines.push(`  \u2013 ${a.name}`));
  }
  if (/publisher/i.test(lower)) {
    const pubs = await Publisher.find().sort({ name: 1 }).limit(8).lean();
    lines.push(`\u2022 ${fmtNumber(publishers)} publishers. Sample:`);
    pubs.forEach((p) => lines.push(`  \u2013 ${p.name}`));
  }
  if (/categor/i.test(lower)) {
    const cats = await Category.find({ isActive: true }).sort({ name: 1 }).limit(8).lean();
    lines.push(`\u2022 ${fmtNumber(categories)} categories. Sample:`);
    cats.forEach((c) => lines.push(`  \u2013 ${c.name}`));
  }
  if (!/author|publisher|categor/i.test(lower)) {
    lines.push(`\u2022 ${fmtNumber(authors)} authors, ${fmtNumber(publishers)} publishers, ${fmtNumber(categories)} categories`);
    lines.push("\nAsk \u201ctop authors\u201d, \u201cpublishers\u201d, or \u201ccategories\u201d for samples.");
  }
  return { reply: lines.join("\n") };
}

async function answerTopSellers() {
  const top = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.title",
        qty: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: 5 },
  ]);
  if (!top.length) return { reply: "No sales yet, so there are no top sellers to show." };
  const lines = ["Top selling books:"];
  top.forEach((b, i) => lines.push(`${i + 1}. ${b._id} \u2014 ${fmtNumber(b.qty)} sold \u2014 ${fmtMoney(b.revenue)}`));
  return { reply: lines.join("\n") };
}

async function answerRecentOrders(message) {
  const lower = normalize(message);
  const limit = lower.match(/(\d+)/) ? Number(lower.match(/(\d+)/)[1]) : 5;
  const orders = await Order.find().sort({ createdAt: -1 }).limit(Math.min(limit, 15)).populate("user", "name email").lean();
  if (!orders.length) return { reply: "No orders yet." };
  const lines = [`Latest ${orders.length} order(s):`];
  orders.forEach((o) => {
    const customer = o.user?.email || "customer";
    lines.push(`\u2022 #${o.orderNumber} \u2014 ${o.status} \u2014 ${fmtMoney(o.total)} \u2014 ${customer} (${new Date(o.createdAt).toLocaleDateString()})`);
  });
  lines.push("\nAsk \u201cmark order <number> shipped\u201d to update a status.");
  return { reply: lines.join("\n") };
}

async function searchBooks(message) {
  const lower = normalize(message);
  const query = lower
    .replace(/^(show|list|find|search|top)\s+/, "")
    .replace(/\b(?:books?|titles?)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

  const filter = { isActive: true };
  if (query) {
    filter.$text = { $search: query };
  }
  const books = await Book.find(filter)
    .select("title authors price stock")
    .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .limit(5)
    .lean();

  if (!books.length) return { reply: "I couldn't find any matching books." };
  const lines = ["Here are matching books:"];
  books.forEach((b) =>
    lines.push(`\u2022 ${b.title} \u2014 ${b.authors?.[0] || "unknown"} \u2014 ${fmtMoney(b.price)} (${fmtNumber(b.stock)} in stock)`)
  );
  return { reply: lines.join("\n"), books };
}

// ---- Admin actions (behind confirmation) ----

function detectAddBook(message) {
  const lower = normalize(message);
  if (!/(add|create|new)\s+(a\s+)?book/.test(lower)) return null;

  const titleMatch = message.match(/["“”']([^"“”']+)["“”']/) || message.match(/(?:book called|book named|book titled)\s+["“”']?([^.,;]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const priceMatch = message.match(/price\s*(?:of\s*)?\$?\s*([\d.]+)/i);
  const stockMatch = message.match(/stock\s*(?:of\s*)?\$?\s*([\d.]+)/i) || message.match(/qty\s*([\d.]+)/i);
  const price = priceMatch ? Number(priceMatch[1]) : undefined;

  return {
    title,
    price,
    stock: stockMatch ? Number(stockMatch[1]) : undefined,
  };
}

function detectStockUpdate(message) {
  const lower = normalize(message);
  if (!/(set|update|change)\s+(the\s+)?stock/.test(lower)) return null;
  const titleMatch = message.match(/["“”']([^"“”']+)["“”']/) || message.match(/(?:for|to)\s+["“”']?([A-Za-z0-9][^.,;]{2,60})/i);
  const qtyMatch = lower.match(/(?:to|of|:)s?\s*(\d+)/);
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    qty: qtyMatch ? Number(qtyMatch[1]) : undefined,
  };
}

function detectOrderStatus(message) {
  const lower = normalize(message);
  if (/mark\s+order\s+([A-Za-z0-9-]+)\s+(as\s+)?(\w+)/.test(lower)) {
    const m = lower.match(/mark\s+order\s+([A-Za-z0-9-]+)\s+(?:as\s+)?(\w+)/);
    const status = m[2].toLowerCase();
    if (ORDER_STATUSES.includes(status)) {
      return { orderNumber: m[1].toUpperCase(), status };
    }
  } else if (/update\s+order\s+([A-Za-z0-9-]+)\s+(?:status\s+)?(?:to\s+)?(\w+)/.test(lower)) {
    const m = lower.match(/update\s+order\s+([A-Za-z0-9-]+)\s+(?:status\s+)?(?:to\s+)?(\w+)/);
    const status = m[2].toLowerCase();
    if (ORDER_STATUSES.includes(status)) {
      return { orderNumber: m[1].toUpperCase(), status };
    }
  }
  return null;
}

async function buildAdminReply(userId, message) {
  const lower = normalize(message);

  if (/^(hi|hello|hey)\b/.test(lower)) {
    return {
      reply: "Hello! I'm your admin assistant. I can show live sales/analytics, inventory and low-stock alerts, catalog counts (books, authors, publishers), top sellers, and take actions like adding a book, updating stock, or changing an order status.",
    };
  }

  // ---- Admin actions take priority over read queries ----

  const statusAction = detectOrderStatus(message);
  if (statusAction) {
    const order = await Order.findOne({ orderNumber: statusAction.orderNumber });
    if (!order) return { reply: `I couldn't find order #${statusAction.orderNumber}.` };
    if (order.status === statusAction.status) {
      return { reply: `Order #${order.orderNumber} is already ${statusAction.status}.` };
    }
    const confirmationToken = token();
    return {
      reply: `To confirm: set order #${order.orderNumber} to \u201c${statusAction.status}\u201d? Reply with your confirmation token below.`,
      tool: { name: "updateOrderStatus", args: { orderId: String(order._id), status: statusAction.status }, confirmationToken, status: "pending" },
    };
  }

  const stockAction = detectStockUpdate(message);
  if (stockAction) {
    if (!stockAction.title || stockAction.qty == null) {
      return { reply: "To update stock, tell me the book and quantity, e.g. \u201cset stock for \u2018The Hobbit\u2019 to 25\u201d." };
    }
    const book = await Book.findOne({ title: new RegExp(stockAction.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
    if (!book) return { reply: `I couldn't find a book matching \u201c${stockAction.title}\u201d. Use the exact title.` };
    const confirmationToken = token();
    return {
      reply: `To confirm: set stock of \u201c${book.title}\u201d to ${stockAction.qty}? Reply with your confirmation token below.`,
      tool: { name: "updateStock", args: { bookId: String(book._id), stock: stockAction.qty }, confirmationToken, status: "pending" },
    };
  }

  const addBookAction = detectAddBook(message);
  if (addBookAction) {
    if (!addBookAction.title) {
      return { reply: "Tell me the book title to add, plus optional price and stock, e.g. \u201cadd a book \u2018Dune\u2019 with price 19.99 and stock 10\u201d." };
    }
    const confirmationToken = token();
    return {
      reply: `To confirm: add the book \u201c${addBookAction.title}\u201d${addBookAction.price != null ? ` at ${fmtMoney(addBookAction.price)}` : ""}${addBookAction.stock != null ? ` with ${addBookAction.stock} in stock` : ""}? Reply with your confirmation token below.`,
      tool: { name: "createBook", args: { title: addBookAction.title, price: addBookAction.price, stock: addBookAction.stock }, confirmationToken, status: "pending" },
    };
  }

  // Overview / dashboard / stats
  if (/(overview|dashboard|store\s*at\s*a\s*glance|stats|summary)/.test(lower)) {
    return answerOverview();
  }

  // Sales / analytics
  if (/sales|analytics|revenue|earnings|income|sell/i.test(lower) && !/top\s*sell|best\s*sell|sell(er|ing)/.test(lower)) {
    return answerSales(lower);
  }

  // Inventory / stock
  if (/inventory|stock/i.test(lower)) {
    return answerInventory(lower);
  }

  // Top sellers / best sellers
  if (/top\s*sell|best\s*sell|sell(er|ing)|most\s*purchased/.test(lower)) {
    return answerTopSellers();
  }

  // Recent / latest orders
  if (/recent\s*orders|latest\s*orders|new\s*orders|list\s*orders|all\s*orders/.test(lower)) {
    return answerRecentOrders(lower);
  }

  // Top rated
  if (/top\s*rated|best\s*rated|highest\s*rated/.test(lower)) {
    const books = await Book.find({ ratingsCount: { $gt: 0 } })
      .sort({ averageRating: -1, ratingsCount: -1 })
      .select("title averageRating ratingsCount")
      .limit(5)
      .lean();
    if (!books.length) return { reply: "No rated books yet." };
    const lines = ["Top rated books:"];
    books.forEach((b) => lines.push(`\u2022 ${b.title} \u2014 ${(b.averageRating || 0).toFixed(1)}/5 (${fmtNumber(b.ratingsCount)} ratings)`));
    return { reply: lines.join("\n") };
  }

  // Catalog counts / authors / publishers / categories
  if (/author|publisher|categor|how\s*many\s*books|total\s*books|count/i.test(lower)) {
    return answerCatalog(lower);
  }

  // Book search in admin context
  if (/show|list|find|search|available|lookup/i.test(lower)) {
    return searchBooks(lower);
  }

  return {
    reply: "I can help with admin tasks like:\n\u2022 \u201cstore overview\u201d, \u201csales for 30 days\u201d\n\u2022 \u201cinventory\u201d, \u201clow stock alert\u201d, \u201cout of stock\u201d\n\u2022 \u201ctop selling books\u201d, \u201crecent orders\u201d\n\u2022 \u201cauthors\u201d, \u201cpublishers\u201d, \u201ccategories\u201d\n\u2022 \u201cadd a book \u2018Dune\u2019 with price 19.99\u201d, \u201cset stock for \u2018Dune\u2019 to 25\u201d, \u201cmark order BVX123 shipped\u201d",
  };
}

async function executeAction(name, args) {
  switch (name) {
    case "updateOrderStatus": {
      const order = await orderService.updateStatus(args.orderId, { status: args.status });
      return `Order #${order.orderNumber} was updated to \u201c${order.status}\u201d.`;
    }
    case "updateStock": {
      const { book } = await inventoryService.updateStock(args.bookId, args.stock);
      return `Stock for \u201c${book.title}\u201d is now ${book.stock}.`;
    }
    case "createBook": {
      const book = await bookService.createBook({
        title: args.title,
        price: args.price,
        stock: args.stock,
        authors: args.authors || [],
        categories: args.categories || [],
      });
      return `Book \u201c${book.title}\u201d was created${book.price != null ? ` at ${fmtMoney(book.price)}` : ""}${book.stock != null ? ` with ${book.stock} in stock` : ""}.`;
    }
    default:
      throw new AppError("Unknown admin action", 400, "UNKNOWN_ACTION");
  }
}

async function sendAdminMessage(userId, { message, conversationId }) {
  const text = String(message || "").trim();
  if (!text) throw new AppError("Message is required", 400, "VALIDATION_ERROR");

  const conversation = await getConversation(userId, conversationId);
  conversation.messages.push({ role: "user", content: text });

  const result = await buildAdminReply(userId, text);

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
  if (conversation.messages.length === 2 && conversation.title === "Admin assistant") {
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

async function confirmAdminAction(userId, confirmationToken) {
  const conversation = await Conversation.findOne({ user: userId, "messages.tool.confirmationToken": confirmationToken });
  if (!conversation) throw new AppError("Confirmation token is invalid or has expired", 400, "INVALID_CONFIRMATION");

  const index = conversation.messages.findIndex((m) => m.tool?.confirmationToken === confirmationToken);
  const pending = conversation.messages[index];
  if (!pending || pending.tool.status !== "pending") {
    throw new AppError("This action was already resolved", 400, "ACTION_RESOLVED");
  }

  const reply = await executeAction(pending.tool.name, pending.tool.args);
  pending.tool.status = "done";
  conversation.messages.push({ role: "assistant", content: reply });
  await conversation.save();

  return { conversationId: conversation._id, reply };
}

export { sendAdminMessage, confirmAdminAction };
