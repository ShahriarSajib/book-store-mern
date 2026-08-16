/**
 * pages/chatbot/ChatFullPage.jsx — full-page chatbot experience.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaPlus, FaRobot, FaTrash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { useChatbotContext } from "../../context/ChatbotContext";
import MessageBubble from "../../components/chatbot/MessageBubble";
import ChatComposer, { SUGGESTIONS } from "../../components/chatbot/ChatComposer";
import TypingIndicator from "../../components/chatbot/TypingIndicator";
import ConfirmationPrompt from "../../components/chatbot/ConfirmationPrompt";
import ChatHistory from "../../components/chatbot/ChatHistory";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

export default function ChatFullPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    messages,
    isTyping,
    isSending,
    pendingTool,
    send,
    resetConversation,
    clearHistory,
    loadHistory,
  } = useChatbotContext();
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <EmptyState
          icon={FaRobot}
          title="Please log in to chat"
          description="Sign in to talk with your AI bookstore assistant."
          actionLabel="Log in"
          onAction={() => navigate("/login")}
        />
      </div>
    );
  }

  const handleClear = () => {
    if (window.confirm("Clear all past conversations?")) {
      clearHistory();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <FaRobot className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-ink-900">AI Bookstore Assistant</h1>
            <p className="text-xs text-ink-500">Ask me about books, orders, or your cart</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowHistory((open) => !open)}>
            <FaHistory /> History
          </Button>
          <Button size="sm" variant="outline" onClick={resetConversation}>
            <FaPlus /> New chat
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear}>
            <FaTrash /> Clear
          </Button>
        </div>
      </header>

      {showHistory && (
        <div className="mt-4 h-60 rounded-2xl border border-ink-100 bg-ink-50">
          <ChatHistory onClose={() => setShowHistory(false)} />
        </div>
      )}

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center px-4 pt-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <FaRobot className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Hi, I'm your bookstore assistant. Ask me about books, orders, or your cart.
            </p>
            <div className="mt-5 flex w-full max-w-md flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {pendingTool && (
        <div className="mt-3">
          <ConfirmationPrompt />
        </div>
      )}

      <div className="mt-3">
        <ChatComposer onSend={send} isSending={isSending} />
      </div>
    </div>
  );
}
