/**
 * components/chatbot/MessageBubble.jsx
 *   Renders user/assistant text + inline book cards + FAQ source footer.
 */
import ChatBookCard from "./ChatBookCard";

export default function MessageBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-white shadow-soft">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const bubbleClass = message.error
    ? "border border-red-200 bg-red-50"
    : "border border-ink-100 bg-white";

  return (
    <div className="flex justify-start">
      <div className={`max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2.5 shadow-soft ${bubbleClass}`}>
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed ${
            message.error ? "text-red-700" : "text-ink-800"
          }`}
        >
          {message.content}
        </p>
        {message.books?.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.books.map((book) => (
              <ChatBookCard key={book.id || book._id} book={book} />
            ))}
          </div>
        )}
        {message.source && (
          <p className="mt-2 text-xs text-ink-400">From FAQ: {message.source.question}</p>
        )}
      </div>
    </div>
  );
}
