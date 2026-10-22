"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CircleAlert, LoaderCircle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

type Status =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; stored: boolean }
  | { state: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const invalid = touched && !EMAIL.test(email.trim());

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!EMAIL.test(email.trim())) {
      setStatus({ state: "error", message: "Please enter a valid email address, like name@example.com." });
      return;
    }
    setStatus({ state: "loading" });
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company: form.get("company") }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; stored?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus({ state: "success", stored: Boolean(data.stored) });
      setEmail("");
      setTouched(false);
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    }
  };

  if (status.state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-sun-500 p-5 text-teal-700"
        role="status"
      >
        <p className="flex items-center gap-2 font-display text-xl font-bold">
          <PartyPopper className="size-5" aria-hidden="true" /> You&rsquo;re on the list!
        </p>
        <p className="mt-1 text-sm">
          {status.stored
            ? "Watch your inbox for sunny news from the Wildwoods."
            : "Thanks! (Preview mode: no newsletter provider is connected yet, so your email wasn't stored.)"}
        </p>
        <button type="button" onClick={() => setStatus({ state: "idle" })} className="mt-3 text-sm font-semibold underline underline-offset-4">
          Sign up another email
        </button>
      </motion.div>
    );
  }

  const describedBy = status.state === "error" ? `${id}-error` : `${id}-hint`;

  return (
    <form onSubmit={submit} noValidate className="relative">
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 ring-2 transition-colors",
          invalid || status.state === "error" ? "ring-coral-500" : "ring-transparent focus-within:ring-sun-500",
        )}
      >
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.state === "error") setStatus({ state: "idle" });
          }}
          onBlur={() => email && setTouched(true)}
          aria-invalid={invalid || status.state === "error"}
          aria-describedby={describedBy}
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 bg-transparent font-medium text-ink placeholder:text-ink/40 focus:outline-none"
        />
        {/* Honeypot for bots — hidden from people and assistive tech. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />
        <button
          type="submit"
          disabled={status.state === "loading"}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-teal-500 px-5 font-semibold text-white transition hover:bg-coral-500 disabled:opacity-70"
        >
          {status.state === "loading" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          Subscribe
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {status.state === "error" ? (
          <motion.p
            key="err"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-coral-300"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" /> {status.message}
          </motion.p>
        ) : (
          <motion.p key="hint" id={`${id}-hint`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-white/60">
            Seasonal tips and events. Unsubscribe anytime.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
