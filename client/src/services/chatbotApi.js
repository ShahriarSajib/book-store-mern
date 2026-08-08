/**
 * services/chatbotApi.js
 *   POST /chat         send user message, receive assistant reply + structured book cards
 *   GET  /chat/history
 *   DELETE /chat/history
 *   POST /chat/confirm confirm sensitive tool call
 */
import api from "./axios";

export const chatbotApi = {
  send: (message, conversationId) =>
    api.post("/chat", { message, conversationId }).then((r) => r.data),
  history: () => api.get("/chat/history").then((r) => r.data),
  clearHistory: () => api.delete("/chat/history").then((r) => r.data),
  confirm: (confirmationToken) =>
    api.post("/chat/confirm", { confirmationToken }).then((r) => r.data),
};

export default chatbotApi;