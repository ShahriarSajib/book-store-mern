/**
 * models/Conversation.js
 * Responsibility: persistent chat history per user.
 * Stores role/content messages with timestamps.
 * The LLM NEVER writes here directly — only the chatbot service does.
 */
const mongoose = require("mongoose");

const bookRefSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "tool", "system"],
      required: true,
    },
    content: { type: String, default: "" },
    books: [bookRefSchema],
    tool: {
      name: { type: String },
      args: { type: mongoose.Schema.Types.Mixed },
      status: { type: String, enum: ["pending", "confirmed", "done", "failed"] },
      result: { type: mongoose.Schema.Types.Mixed },
      confirmationToken: { type: String },
    },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, trim: true, maxlength: 120, default: "New chat" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
