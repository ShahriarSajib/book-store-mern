/**
 * ai/admin/adminAssistantService.js
 * Responsibility: same orchestrator pattern as chatbotService, but:
 *   - Only callable by admins (gated at controller level).
 *   - Tool set restricted to analytics + management read tools.
 *   - Never exposes customer PII unless explicitly authorized.
 */
// TODO
module.exports = {};