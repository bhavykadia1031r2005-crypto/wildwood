"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; state?: "streaming" | "error" };
type Problem = "not_configured" | "busy" | "error" | null;

const STORAGE_KEY = "ww-chat-v1";
const ease = [0.16, 1, 0.3, 1] as const;

const suggestions = [
  "Plan a rainy-day afternoon",
  "Best beach for little kids?",
  "Where should I watch the sunset?",
  "What's on in the summer?",
];

const problemCopy: Record<Exclude<Problem, null>, string> = {
  not_configured:
    "The AI guide isn't connected yet. Once the site's Anthropic API key is added it will answer here. Meanwhile, press / to search the site or try the trip planner.",
  busy: "Lots of visitors are asking questions right now. Please try again in a minute.",
  error: "Sorry, something went wrong. Please try again.",
};

let counter = 0;
const newId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

function loadHistory(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Message[]) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => m.content && !m.state) : [];
  } catch {
    return [];
  }
}

/** Sticky "Ask our AI guide" button and chat panel, shown on every page. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  // The panel starts closed, so restoring history on the client can't cause a hydration mismatch.
  const [messages, setMessages] = useState<Message[]>(() => (typeof window === "undefined" ? [] : loadHistory()));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  const reduced = useReducedMotion();
  const titleId = useId();
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  // Remember this tab's conversation (per-visitor convenience only).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter((m) => !m.state)));
    } catch {
      /* Storage unavailable (private mode); the chat still works. */
    }
  }, [messages]);

  useEffect(() => () => abort.current?.abort(), []);

  // Keep the newest message in view while the visitor is near the bottom.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  }, [messages, problem, open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => field.current?.focus());
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    launcher.current?.focus();
  }, []);

  const patchLast = (fn: (m: Message) => Message) =>
    setMessages((list) => (list.length ? [...list.slice(0, -1), fn(list[list.length - 1])] : list));

  const send = async (text: string, base: Message[] = messages) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setProblem(null);
    const history = [...base, { id: newId(), role: "user" as const, content: question }];
    setMessages([...history, { id: newId(), role: "assistant", content: "", state: "streaming" }]);
    setBusy(true);

    const controller = new AbortController();
    abort.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessages(history);
        setProblem(data.error === "not_configured" ? "not_configured" : res.status === 429 ? "busy" : "error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let failed = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as { t: string; v?: string };
          if (event.t === "text" && event.v) text += event.v;
          else if (event.t === "reset") text = "";
          else if (event.t === "refusal")
            text = "Sorry, I can't help with that one. Ask me anything about planning a Wildwoods trip!";
          else if (event.t === "error") failed = true;
        }
        const snapshot = text;
        patchLast((m) => ({ ...m, content: snapshot }));
      }
      if (failed && !text) {
        setMessages(history);
        setProblem("error");
      } else {
        patchLast((m) => ({ ...m, content: text || "Sorry, I don't have an answer for that.", state: undefined }));
      }
    } catch {
      if (controller.signal.aborted) {
        // Visitor pressed stop: keep whatever arrived.
        setMessages((list) => {
          const last = list[list.length - 1];
          return last?.content ? [...list.slice(0, -1), { ...last, state: undefined }] : list.slice(0, -1);
        });
      } else {
        setMessages(history);
        setProblem("error");
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  const reset = () => {
    abort.current?.abort();
    setMessages([]);
    setProblem(null);
    field.current?.focus();
  };

  const pathname = usePathname();
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const transition = reduced ? { duration: 0 } : { duration: 0.4, ease };

  // The visitor-facing guide doesn't belong in the admin dashboard.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            id="ww-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={transition}
            style={{ transformOrigin: "bottom right" }}
            className="on-light fixed inset-x-3 bottom-24 z-[60] flex h-[min(72svh,600px)] flex-col overflow-hidden rounded-[1.75rem] bg-cream shadow-[0_30px_80px_-20px_rgb(4_23_28/0.55)] ring-1 ring-teal-500/10 sm:inset-x-auto sm:right-6 sm:w-[390px]"
          >
            <header className="flex items-center gap-3 bg-teal-500 px-4 py-3.5 text-white">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white p-1">
                <LogoMark className="size-full" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="font-display text-base font-bold leading-tight">
                  Wildwoods Guide
                </h2>
                <p className="flex items-center gap-1 text-xs text-white/70">
                  <Sparkles className="size-3 text-sun-400" aria-hidden="true" /> AI assistant
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Start a new chat"
                  className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Close chat"
                className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </header>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite" aria-busy={busy}>
              <Bubble role="assistant">
                Hi! I&rsquo;m the Wildwoods Guide. Ask me about beaches, the boardwalk, events or where to stay, or
                tell me your dates and I&rsquo;ll sketch a plan.
              </Bubble>

              {messages.length === 0 && !problem && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full bg-white px-3.5 py-2 text-left text-sm font-semibold text-teal-600 ring-1 ring-teal-500/15 transition hover:bg-sun-500 hover:ring-sun-500"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m) =>
                m.role === "assistant" && m.state === "streaming" && !m.content ? (
                  <TypingDots key={m.id} />
                ) : (
                  <Bubble key={m.id} role={m.role}>
                    {m.content}
                  </Bubble>
                ),
              )}

              {problem && (
                <div className="rounded-2xl bg-sun-100 p-3.5 text-sm leading-relaxed text-teal-700" role="status">
                  {problemCopy[problem]}
                  {problem !== "not_configured" && lastUser && (
                    <button
                      type="button"
                      onClick={() => send(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)))}
                      className="mt-2 block font-semibold underline underline-offset-4"
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-teal-500/10 bg-white px-3 pb-3 pt-2.5"
            >
              <div className="flex items-end gap-2 rounded-2xl bg-cream p-1.5 ring-1 ring-teal-500/15 focus-within:ring-2 focus-within:ring-ocean-500">
                <label htmlFor={`${titleId}-input`} className="sr-only">
                  Ask the Wildwoods Guide a question
                </label>
                <textarea
                  id={`${titleId}-input`}
                  ref={field}
                  rows={1}
                  value={input}
                  maxLength={1500}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Ask about beaches, events, stays…"
                  className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-[0.95rem] text-ink placeholder:text-ink/45 focus:outline-none"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => abort.current?.abort()}
                    aria-label="Stop answering"
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-500 text-white transition hover:bg-teal-600"
                  >
                    <Square className="size-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-sun-500 text-teal-700 transition hover:bg-sun-300 disabled:bg-teal-500/10 disabled:text-ink/30"
                  >
                    <ArrowUp className="size-5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <p className="mt-2 px-1 text-[0.68rem] leading-snug text-ink/50">
                AI answers can be wrong. Confirm dates, hours and prices before you go.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcher}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="ww-chat-panel"
        aria-label={open ? "Close the AI guide" : "Ask our AI guide"}
        initial={reduced ? false : { opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 1.2, ease }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        className={cn(
          "group fixed bottom-5 right-5 z-[60] grid size-14 place-items-center rounded-full shadow-[0_16px_40px_-12px_rgb(4_23_28/0.6)] ring-4 ring-white/70 transition-colors sm:bottom-6 sm:right-6",
          open ? "bg-teal-500 text-white" : "bg-sun-500 text-teal-700 hover:bg-sun-300",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid place-items-center"
          >
            {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <>
            <span
              aria-hidden="true"
              className="absolute -left-1.5 -top-1.5 rounded-full bg-coral-500 px-1.5 py-0.5 text-[0.6rem] font-extrabold leading-none tracking-wide text-white ring-2 ring-white"
            >
              AI
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-full mr-3 hidden translate-x-1 whitespace-nowrap rounded-full bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white opacity-0 shadow-soft transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block"
            >
              Ask our AI guide
            </span>
          </>
        )}
      </motion.button>
    </>
  );
}

function Bubble({ role, children }: { role: Role; children: React.ReactNode }) {
  const user = role === "user";
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <p
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[0.95rem] leading-relaxed",
          user ? "rounded-br-md bg-teal-500 text-white" : "rounded-bl-md bg-white text-ink ring-1 ring-teal-500/10",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start" aria-label="The guide is typing">
      <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 ring-1 ring-teal-500/10">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-ocean-500/70"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}
