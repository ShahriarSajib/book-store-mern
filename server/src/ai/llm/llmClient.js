/**
 * ai/llm/llmClient.js
 * Thin wrapper around OpenAI-compatible API via axios.
 * Supports tool/function calling.
 */
import axios from "axios";
import aiConfig from "../../config/ai.js";
import logger from "../../utils/logger.js";

const OPENAI_COMPATIBLE_URLS = {
  openai: "https://api.openai.com/v1",
};

function baseUrl() {
  const provider = aiConfig.llm.provider;
  return process.env.LLM_BASE_URL || OPENAI_COMPATIBLE_URLS[provider] || "https://api.openai.com/v1";
}

/**
 * Send a chat completion request.
 * @param {Object} opts
 * @param {Array} opts.messages - [{role, content}]
 * @param {Array} [opts.tools] - OpenAI-style tool definitions
 * @param {string} [opts.toolChoice] - "auto" | "none" | { type: "function", function: { name } }
 * @returns {Object} { text, toolCalls, usage }
 */
async function chat({ messages, tools, toolChoice }) {
  if (!aiConfig.llm.apiKey) {
    throw new Error("LLM_API_KEY not configured");
  }

  const body = {
    model: aiConfig.llm.model,
    messages,
    temperature: aiConfig.llm.temperature,
    max_tokens: aiConfig.llm.maxTokens,
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = toolChoice || "auto";
  }

  try {
    const res = await axios.post(`${baseUrl()}/chat/completions`, body, {
      headers: {
        Authorization: `Bearer ${aiConfig.llm.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    const choice = res.data?.choices?.[0];
    const msg = choice?.message;

    return {
      text: msg?.content || "",
      toolCalls: (msg?.tool_calls || []).map((tc) => ({
        id: tc.id,
        name: tc.function?.name,
        arguments: safeParse(tc.function?.arguments),
      })),
      finishReason: choice?.finish_reason,
      usage: res.data?.usage,
    };
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data?.error?.message || err.message;
    logger.error("LLM API error", { status, detail });
    throw new Error(`LLM request failed: ${detail}`);
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str || "{}");
  } catch {
    return {};
  }
}

export { chat };
