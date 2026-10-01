import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUpRight,
  MessageSquare,
  ShieldCheck,
  X,
  Loader2,
  Send,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Case } from "./data";
import { database } from "./store";
export default function Chat({
  close,
  user,
  cases,
}: {
  close: () => void;
  user: User | null;
  cases: Case[];
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    const next = [
      ...messages,
      { role: "user" as const, content: question.trim() },
    ];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const endpoint = import.meta.env.VITE_CHATBOT_URL;
      if (!endpoint)
        throw new Error(
          "The command assistant endpoint has not been configured.",
        );
      let token: string | undefined;
      if (user && database) {
        const { data } = await database.auth.getSession();
        token = data.session?.access_token;
      }
      const response = await fetch(`${endpoint.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: next.slice(-10),
          caseId: window.location.hash.startsWith("#/case/")
            ? decodeURIComponent(window.location.hash.slice(7))
            : undefined,
        }),
        signal: AbortSignal.timeout(35000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Assistant unavailable. Try again.");
      setMessages([...next, { role: "assistant", content: result.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="chat-backdrop" onClick={close}>
      <section
        className="chat-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Command assistant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-header">
          <div className="case-icon">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2>Command assistant</h2>
            <span>OPERATOR SUPPORT</span>
          </div>
          <button
            className="icon-button"
            aria-label="Close assistant"
            onClick={close}
          >
            <X size={21} />
          </button>
        </div>
        <div className="chat-body">
          <div className="notice">
            <ShieldCheck size={17} />
            AI drafts require human review.{" "}
            {user
              ? "Uses only cases accessible to your account."
              : "Training workspace context."}
          </div>
          {!messages.length && (
            <div className="chat-welcome">
              <MessageSquare size={39} />
              <h3>Command Assistant</h3>
              <p>
                Explore a mission, prepare a coordination draft or review what
                to verify next.
              </p>
              {[
                "Explain the financial fraud response workflow",
                "What should I verify in a welfare referral?",
                "Draft an evidence-preservation checklist",
              ].map((q) => (
                <button key={q} onClick={() => void ask(q)}>
                  {q}
                  <ArrowUpRight size={15} />
                </button>
              ))}
              <small>{cases.length} cases in current workspace</small>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <span>{m.role === "user" ? "YOU" : "COMMAND ASSISTANT"}</span>
              <div className="markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {busy && (
            <div className="chat-loading" role="status">
              <Loader2 size={16} className="spin" />
              Preparing a response…
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
        >
          <textarea
            aria-label="Message command assistant"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a case or mission…"
            maxLength={3000}
            rows={2}
          />
          <button
            className="button primary"
            aria-label="Send message"
            disabled={busy || !input.trim()}
          >
            <Send size={18} />
          </button>
          <small>
            10 requests / minute per operator or training visitor · bounded
            output
          </small>
        </form>
      </section>
    </div>
  );
}
