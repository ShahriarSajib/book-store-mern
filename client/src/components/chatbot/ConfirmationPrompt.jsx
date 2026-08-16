/**
 * components/chatbot/ConfirmationPrompt.jsx — confirm or dismiss a pending tool call.
 */
import { FaExclamationTriangle } from "react-icons/fa";
import { useChatbotContext } from "../../context/ChatbotContext";
import Button from "../ui/Button";

export default function ConfirmationPrompt() {
  const { pendingTool, confirm, dismissTool, isSending } = useChatbotContext();

  if (!pendingTool) return null;

  const args =
    pendingTool.args && Object.keys(pendingTool.args).length > 0
      ? JSON.stringify(pendingTool.args, null, 2)
      : null;

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start gap-2">
        <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">This action needs your confirmation</p>
          <p className="mt-0.5 text-xs text-amber-700">{pendingTool.name}</p>
          {args && (
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-white/70 p-2 text-xs text-amber-800">
              {args}
            </pre>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" loading={isSending} disabled={isSending} onClick={confirm}>
          Confirm
        </Button>
        <Button size="sm" variant="ghost" disabled={isSending} onClick={dismissTool}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
