/**
 * components/chatbot/ChatbotWidget.jsx — floating launcher button + chat window.
 */
import { useEffect } from "react";
import { FaCommentDots } from "react-icons/fa";
import { useChatbotContext } from "../../context/ChatbotContext";
import ChatWindow from "./ChatWindow";

export default function ChatbotWidget() {
  const { isOpen, toggle, loadHistory } = useChatbotContext();

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Open chat assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft transition hover:bg-brand-700"
      >
        <FaCommentDots className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 h-[560px] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl">
      <ChatWindow />
    </div>
  );
}
