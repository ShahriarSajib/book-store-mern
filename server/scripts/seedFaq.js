/**
 * scripts/seedFaq.js
 * Responsibility: ingest the initial FAQ/policy KB.
 * Run with: node scripts/seedFaq.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { FaqDocument } = require("../src/models");

const DEFAULT_FAQS = [
  {
    question: "How fast is shipping?",
    answer: "Orders placed before 4pm are usually dispatched the same day. Deliveries within the capital take 2–3 business days; nationwide delivery takes 4–7 business days.",
    category: "shipping",
    keywords: ["shipping", "delivery", "deliver", "how long", "dispatch", "courier"],
  },
  {
    question: "How much does shipping cost?",
    answer: "Shipping is free for orders over $25. A flat rate applies to smaller orders and is shown at checkout before you confirm.",
    category: "shipping",
    keywords: ["cost", "fee", "charge", "shipping cost", "price"],
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash on delivery, credit/debit cards, and bKash. Pay securely at checkout.",
    category: "payment",
    keywords: ["payment", "pay", "card", "bkash", "cash", "method"],
  },
  {
    question: "What is your return policy?",
    answer: "Unused books in their original condition can be returned within 14 days of delivery. Pre-orders and personalized items are excluded. Start a return from your order page.",
    category: "returns",
    keywords: ["return", "refund", "exchange", "replace", "money back"],
  },
  {
    question: "When will I get my refund?",
    answer: "Refunds are processed within 5–7 business days of the returned item reaching our warehouse, to your original payment method.",
    category: "returns",
    keywords: ["refund", "return", "money back", "reimbursed"],
  },
  {
    question: "How do I cancel an order?",
    answer: "You can cancel an order from your order history as long as it is still pending or processing. Cancelled orders restore stock automatically.",
    category: "orders",
    keywords: ["cancel", "order", "cancellation", "abort"],
  },
  {
    question: "How do I track my order?",
    answer: "Open your order from Order history — the status shows pending, processing, shipped, or delivered, along with any tracking number.",
    category: "orders",
    keywords: ["track", "tracking", "status", "where is my order", "arrive"],
  },
  {
    question: "How do I reset my password?",
    answer: "Use the “Forgot password” link on the login page. We will email you a secure link to set a new password.",
    category: "account",
    keywords: ["password", "forgot", "reset", "login", "sign in"],
  },
  {
    question: "How do I create an account?",
    answer: "Click “Sign up”, enter your name, email, and a password of at least 8 characters, then verify your email via the link we send you.",
    category: "account",
    keywords: ["account", "register", "sign up", "create"],
  },
  {
    question: "Do you offer discounts or coupons?",
    answer: "Yes! We regularly publish coupon codes. Apply a code at checkout or on your cart page to see the discount applied instantly.",
    category: "promotions",
    keywords: ["coupon", "discount", "offer", "voucher", "promo", "code"],
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("[seed:faq] connected to MongoDB");

  for (const doc of DEFAULT_FAQS) {
    await FaqDocument.updateOne({ question: doc.question }, { $set: doc }, { upsert: true });
  }
  const total = await FaqDocument.countDocuments();
  console.log(`[seed:faq] done — ${total} FAQ documents`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed:faq] failed:", err.message);
  process.exit(1);
});
