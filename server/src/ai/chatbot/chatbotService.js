/**
 * ai/chatbot/chatbotService.js
 * Responsibility: orchestrates a single chat turn.
 *
 * Flow:
 *   1. Build messages (system prompt + history + user input)
 *   2. Call LLM with read-only tools
 *   3. If LLM requests tool(s):
 *        - guardrails enforce role + arg validation
 *        - delegate to tool implementations (which hit services/repos)
 *        - append tool results to messages
 *        - repeat until LLM returns a final answer
 *   4. For write tools, require explicit confirmation token from user
 *   5. Persist conversation
 *
 * LLM NEVER touches MongoDB. LLM NEVER receives credentials.
 */
// TODO
module.exports = {};