/**
 * components/chatbot/ChatHistory.jsx — list of past conversations.
 */
import { useEffect } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useChatbotContext } from "../../context/ChatbotContext";
import { formatDate } from "../../utils/format";
import Button from "../ui/Button";

export default function ChatHistory({ onClose }) {
  const { conversations, conversationId, loadHistory, clearHistory, resetConversation } =
    useChatbotContext();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClear = () => {
    if (window.confirm("Clear all past conversations?")) {
      clearHistory();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h3 className="font-semibold text-ink-900">History</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-600"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-ink-400">No past conversations</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => {
              const active = conversationId === conversation._id;
              return (
                <li key={conversation._id}>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      active ? "bg-brand-50" : "hover:bg-ink-100"
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-ink-800">
                      {conversation.title || "Untitled conversation"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {formatDate(conversation.updatedAt || conversation.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex gap-2 border-t border-ink-100 p-3">
        <Button size="sm" fullWidth onClick={resetConversation}>
          <FaPlus /> New chat
        </Button>
        <Button size="sm" variant="outline" fullWidth onClick={handleClear}>
          <FaTrash /> Clear history
        </Button>
      </div>
    </div>
  );
}
