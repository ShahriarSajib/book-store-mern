/**
 * components/chatbot/ChatWindow.jsx — chat panel with header, message list, composer.
 */
import { useEffect, useRef, useState } from "react";
import { FaHistory, FaPlus, FaRobot, FaTimes } from "react-icons/fa";
import { useChatbotContext } from "../../context/ChatbotContext";
import MessageBubble from "./MessageBubble";
import ChatComposer, { SUGGESTIONS } from "./ChatComposer";
import TypingIndicator from "./TypingIndicator";
import ConfirmationPrompt from "./ConfirmationPrompt";
import ChatHistory from "./ChatHistory";

function WelcomeState({ onPick }) {
  return (
    <div className="flex flex-col items-center px-4 pt-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <FaRobot className="h-7 w-7" />
      </span>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        Hi, I'm your bookstore assistant. Ask me about books, orders, or your cart.
      </p>
      <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const {
    messages,
    isTyping,
    isSending,
    pendingTool,
    send,
    resetConversation,
    setOpen,
  } = useChatbotContext();
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
            <FaRobot className="h-4 w-4" />
          </span>
          <h2 className="font-semibold text-ink-900">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistory((open) => !open)}
            aria-label="Chat history"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <FaHistory className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetConversation}
            aria-label="New chat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <FaPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {showHistory && (
          <div className="absolute inset-0 z-20 bg-white">
            <ChatHistory onClose={() => setShowHistory(false)} />
          </div>
        )}
        <div className="h-full space-y-4 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <WelcomeState onPick={send} />
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {pendingTool && (
        <div className="border-t border-ink-100 p-3">
          <ConfirmationPrompt />
        </div>
      )}

      <footer className="border-t border-ink-100 p-3">
        <ChatComposer onSend={send} isSending={isSending} />
      </footer>
    </div>
  );
}
