/**
 * components/chatbot/ChatComposer.jsx — input box, send button, suggestion chips.
 */
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import Button from "../ui/Button";

export const SUGGESTIONS = [
  "Show me fantasy books",
  "What is your return policy?",
  "My orders",
  "My cart",
];

export default function ChatComposer({ onSend, isSending = false, disabled = false }) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !isSending && !disabled;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled || isSending}
            onClick={() => onSend(suggestion)}
            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={disabled}
          className="max-h-32 flex-1 resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-ink-50"
        />
        <Button type="submit" disabled={!canSend} aria-label="Send message" className="shrink-0">
          <FaPaperPlane />
        </Button>
      </form>
    </div>
  );
}
