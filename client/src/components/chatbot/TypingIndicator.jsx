/**
 * components/chatbot/TypingIndicator.jsx — "assistant is typing" dots bubble.
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
