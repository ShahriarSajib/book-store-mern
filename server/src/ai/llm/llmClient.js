/**
 * ai/llm/llmClient.js
 * Responsibility: thin wrapper around the LLM provider
 * (OpenAI, Anthropic, etc.). Exposes:
 *   - chat({ messages, tools, toolChoice }) -> reply (text or tool calls)
 *   - streamChat(...) for streaming tokens
 *
 * Provider chosen via config/ai.js.
 */
// TODO
module.exports = {};