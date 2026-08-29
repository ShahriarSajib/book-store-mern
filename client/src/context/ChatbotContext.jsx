/**
 * context/ChatbotContext.jsx
 * Responsibility:
 *   Open/close state, current conversation messages, in-flight sending flag,
 *   pending tool confirmations, and conversation history/clear.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import chatbotApi from "../services/chatbotApi";
import adminApi from "../services/adminApi";
import useAuth from "../hooks/useAuth";

const ChatbotContext = createContext(null);

let messageId = 0;
function nextId() {
  messageId += 1;
  return `msg_${Date.now()}_${messageId}`;
}

function getErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || "Something went wrong";
}

export function ChatbotProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingTool, setPendingTool] = useState(null);
  const [lastError, setLastError] = useState(null);
  const sendRef = useRef(false);

  const send = useCallback(
    async (text) => {
      const clean = String(text || "").trim();
      if (!clean || sendRef.current) return null;
      if (!isAuthenticated) {
        toast.error("Please log in to chat with the assistant");
        return null;
      }

      const userMsg = { id: nextId(), role: "user", content: clean };
      setMessages((prev) => [...prev, userMsg]);
      setLastError(null);
      sendRef.current = true;
      setIsSending(true);
      setIsTyping(true);

      try {
        const data = isAdmin
          ? await adminApi.ai.chat(clean, conversationId)
          : await chatbotApi.send(clean, conversationId);
        setConversationId(data.conversationId);
        const assistantMsg = {
          id: nextId(),
          role: "assistant",
          content: data.reply,
          books: data.books || [],
          source: data.source || null,
          tool: data.tool || null,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setPendingTool(data.tool || null);
        return assistantMsg;
      } catch (err) {
        const message = getErrorMessage(err);
        setLastError(message);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "assistant", content: "Sorry, I couldn't process that. Please try again.", error: true },
        ]);
        return null;
      } finally {
        sendRef.current = false;
        setIsSending(false);
        setIsTyping(false);
      }
    },
    [conversationId, isAuthenticated, isAdmin]
  );

  const confirm = useCallback(async () => {
    if (!pendingTool?.confirmationToken) return null;
    setIsSending(true);
    setIsTyping(true);
    try {
      const data = isAdmin
        ? await adminApi.ai.confirm(pendingTool.confirmationToken)
        : await chatbotApi.confirm(pendingTool.confirmationToken);
      setPendingTool(null);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: data.reply },
      ]);
      return data;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [pendingTool, isAdmin]);

  const dismissTool = useCallback(() => {
    setPendingTool(null);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await chatbotApi.history();
      setConversations(data.conversations || []);
    } catch (_err) {
      // ignore
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await chatbotApi.clearHistory();
      setConversations([]);
      setMessages([]);
      setConversationId(null);
      setPendingTool(null);
      toast.success("Chat history cleared");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setPendingTool(null);
  }, []);

  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  const value = useMemo(
    () => ({
      messages,
      isOpen,
      toggle,
      setOpen: setIsOpen,
      send,
      confirm,
      dismissTool,
      isSending,
      isTyping,
      pendingTool,
      conversations,
      loadHistory,
      clearHistory,
      resetConversation,
      conversationId,
      lastError,
    }),
    [
      messages,
      isOpen,
      toggle,
      send,
      confirm,
      dismissTool,
      isSending,
      isTyping,
      pendingTool,
      conversations,
      loadHistory,
      clearHistory,
      resetConversation,
      conversationId,
      lastError,
    ]
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbotContext() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbotContext must be used within ChatbotProvider");
  return ctx;
}

export default ChatbotProvider;
