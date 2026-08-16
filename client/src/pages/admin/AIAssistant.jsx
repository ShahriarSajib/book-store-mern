/**
 * pages/admin/AIAssistant.jsx — Admin AI Assistant chat page (uses adminApi.ai.chat).
 */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { FaRobot, FaBook, FaPaperPlane, FaRedo } from "react-icons/fa";

const SUGGESTIONS = [
  "Show me fantasy books",
  "What is the return policy?",
  "My orders",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const message = (text ?? input).trim();
    if (!message || isSending) return;
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setIsSending(true);
    try {
      const data = await adminApi.ai.chat(message, conversationId);
      setConversationId(data.conversationId);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, books: data.books || [] },
      ]);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
          <p className="text-sm text-slate-500">Ask questions about your store, orders and catalog.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <FaRedo /> New conversation
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isSending}
            onClick={() => handleSend(s)}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div ref={scrollRef} className="h-[420px] space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <FaRobot className="mb-2 h-10 w-10" />
              <p className="text-sm">Ask about your store, orders, books or customers.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" && m.books?.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-slate-300/60 pt-2">
                    {m.books.map((b) => (
                      <Link
                        key={b.id || b._id}
                        to={`/books/${b.id || b._id}`}
                        className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:underline"
                      >
                        <FaBook /> {b.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-400">
                <Spinner className="h-4 w-4" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <form
          className="flex items-center gap-2 border-t border-slate-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={isSending}
          />
          <Button type="submit" loading={isSending} aria-label="Send message">
            <FaPaperPlane />
          </Button>
        </form>
      </div>
    </div>
  );
}
