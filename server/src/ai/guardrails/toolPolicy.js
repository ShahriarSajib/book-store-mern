/**
 * ai/guardrails/toolPolicy.js
 * Responsibility:
 *   - Enforce which tools a role can call.
 *   - Enforce arg schemas/types before tools run.
 *   - Require explicit `confirm: true` for sensitive write tools.
 *   - Block attempts to escalate privileges via tool args.
 */
// TODO
module.exports = {};