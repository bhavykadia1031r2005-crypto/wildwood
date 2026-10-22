"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { signatureEvents } from "@/data/events";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const INTERVAL = 6500;
const ease = [0.16, 1, 0.3, 1] as const;

/* Tear-off calendar: going forward, the current page flips up off its top edge. */
const page: Variants = {
  enter: (dir: number) => (dir > 0 ? { opacity: 0, y: 12, rotateX: 0, zIndex: 1 } : { opacity: 0, rotateX: -95, zIndex: 2 }),
  center: { opacity: 1, y: 0, rotateX: 0, zIndex: 2, transition: { duration: 0.6, ease } },
  exit: (dir: number) =>
    dir > 0
      ? { opacity: 0, rotateX: -100, zIndex: 3, transition: { duration: 0.55, ease: [0.55, 0, 0.75, 0.2] } }
      : { opacity: 0, y: 12, zIndex: 1, transition: { duration: 0.3 } },
};

/** Hero events widget: signature happenings by month, flipping like a desk calendar. */
export function EventCalendar({ paused }: { paused: boolean }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [hold, setHold] = useState(false);
  const reduced = useReducedMotion();
  const auto = !paused && !hold && !reduced;
  const count = signatureEvents.length;
  const event = signatureEvents[index];

  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % count);
    }, INTERVAL);
    return () => window.clearInterval(t);
  }, [auto, count, index]);

  const go = (next: number, direction: number) => {
    setDir(direction);
    setIndex((next + count) % count);
  };

  return (
    <aside
      aria-labelledby="hero-calendar-title"
      className="relative w-full max-w-[290px] pt-2.5"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      {/* Pages stacked behind */}
      <div aria-hidden="true" className="absolute inset-x-3 -bottom-2 top-5 rotate-[2.5deg] rounded-[1.35rem] bg-white/35" />
      <div aria-hidden="true" className="absolute inset-x-1.5 -bottom-1 top-4 -rotate-[1.5deg] rounded-[1.35rem] bg-white/60" />
      {/* Binding rings */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 flex justify-center gap-20">
        <span className="h-5 w-2.5 rounded-full bg-teal-900 ring-2 ring-sun-400" />
        <span className="h-5 w-2.5 rounded-full bg-teal-900 ring-2 ring-sun-400" />
      </div>

      <div className="on-light relative overflow-hidden rounded-[1.35rem] bg-white text-ink shadow-[0_24px_56px_-22px_rgb(4_23_28/0.7)]">
        <header className="relative flex items-center justify-between gap-2 bg-coral-500 px-4 pb-3 pt-4 text-white">
          <div>
            <p className="eyebrow flex items-center gap-1 text-[0.52rem] text-white/85">
              <CalendarDays className="size-3" aria-hidden="true" /> Events calendar
            </p>
            <h2 id="hero-calendar-title" className="mt-0.5 font-display text-[0.95rem] font-extrabold leading-tight">
              The Wildwoods season
            </h2>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => go(index - 1, -1)}
              aria-label="Previous event"
              className="grid size-7 place-items-center rounded-full bg-white/15 transition hover:bg-white hover:text-coral-600"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1, 1)}
              aria-label="Next event"
              className="grid size-7 place-items-center rounded-full bg-white/15 transition hover:bg-white hover:text-coral-600"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
          {/* Countdown to the next page while auto-advancing */}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-coral-700/40">
            {auto && (
              <span
                key={index}
                className="block h-full origin-left bg-sun-400"
                style={{ animation: `calendar-tick ${INTERVAL}ms linear forwards` }}
              />
            )}
          </span>
        </header>

        <div role="group" aria-label="Events by month" className="scrollbar-none flex gap-0.5 overflow-x-auto border-b border-teal-500/10 px-2 py-2">
          {signatureEvents.map((e, i) => {
            const active = i === index;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => go(i, i >= index ? 1 : -1)}
                aria-current={active ? "true" : undefined}
                aria-label={`${e.title} (${e.season})`}
                className={cn(
                  "relative shrink-0 rounded-full px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider transition-colors",
                  active ? "text-white" : "text-ink/55 hover:text-teal-600",
                )}
              >
                {active && (
                  <motion.span layoutId="calendar-month" className="absolute inset-0 rounded-full bg-teal-500" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{e.tab}</span>
              </button>
            );
          })}
        </div>

        <div className="relative h-[118px] [perspective:900px]" aria-live={auto ? "off" : "polite"}>
          <AnimatePresence initial={false} custom={dir}>
            <motion.article
              key={event.id}
              custom={dir}
              variants={page}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ transformOrigin: "50% 0%" }}
              className="absolute inset-0 grid grid-cols-[58px_minmax(0,1fr)] gap-3 bg-white p-3.5 [backface-visibility:hidden]"
            >
              <div className="self-start overflow-hidden rounded-xl text-center shadow-[0_6px_16px_-10px_rgb(16_86_101/0.45)] ring-1 ring-teal-500/12">
                <p className="bg-sun-500 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-teal-700">{event.band}</p>
                <p className={cn("display py-2 text-teal-600", event.month.length > 3 ? "text-[0.95rem]" : "text-[1.7rem]")}>
                  {event.month}
                </p>
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold leading-tight text-teal-600">{event.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[0.65rem] font-semibold text-ocean-600">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" /> {event.location}
                </p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink/65">{event.text}</p>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-teal-500/10 px-3.5 py-2">
          <p className="text-[0.62rem] leading-snug text-ink/55">Dates vary yearly</p>
          <Link href="/events" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-ocean-600 transition-colors hover:text-coral-600">
            All events <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </aside>
  );
}
