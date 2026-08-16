/**
 * hooks/useChatbot.js — convenience hook over ChatbotContext.
 */
import { useChatbotContext } from "../context/ChatbotContext";

export default function useChatbot() {
  return useChatbotContext();
}
