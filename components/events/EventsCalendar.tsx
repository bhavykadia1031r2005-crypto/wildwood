"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BedDouble, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, LayoutGrid, List, Search, Sparkles, X } from "lucide-react";
import { SaveButton } from "@/components/wishlist/SaveButton";
import { useA11y } from "@/lib/a11y";
import { CALENDAR_AS_OF, CALENDAR_RANGE, calendarEvents, type CalendarEvent } from "@/data/eventsCalendar";
import { emit } from "@/lib/events";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" });
const MONTH_TITLE = fmt({ month: "long", year: "numeric" });
const WEEKDAY_LONG = fmt({ weekday: "long", month: "long", day: "numeric" });
const WEEKDAY_LONG_ONLY = fmt({ weekday: "long" });
const DAY_SHORT = fmt({ month: "short", day: "numeric" });
const LONG = fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" });

/** Months the calendar covers, as "YYYY-MM". */
const MONTHS = (() => {
  const out: string[] = [];
  const d = utc(`${CALENDAR_RANGE.first}-01`);
  while (isoOf(d).slice(0, 7) <= CALENDAR_RANGE.last) {
    out.push(isoOf(d).slice(0, 7));
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return out;
})();
const DEFAULT_MONTH = Math.max(0, MONTHS.indexOf(CALENDAR_AS_OF.slice(0, 7)));

/** The event id in the URL hash (#ev-<id>), so events can be linked and the back button closes them. */
function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const useOpenEventId = () =>
  useSyncExternalStore(
    subscribeHash,
    () => (window.location.hash.startsWith("#ev-") ? decodeURIComponent(window.location.hash.slice(4)) : null),
    () => null,
  );
const openEvent = (id: string) => {
  window.location.hash = `ev-${encodeURIComponent(id)}`;
};
const closeEvent = () => {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};

export function dateRange(e: CalendarEvent, long = false) {
  const f = long ? LONG : DAY_SHORT;
  return e.start === e.end ? f.format(utc(e.start)) : `${f.format(utc(e.start))} – ${f.format(utc(e.end))}`;
}

/** Month grid (or day-by-day list) of Wildwoods events, with search, a free-only filter and event details. */
export function EventsCalendar() {
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [chosenView, setView] = useState<"month" | "list">("month");
  // Seven day columns are too tight for larger or wider text, so the list view takes over.
  const a11y = useA11y();
  const roomyText = a11y.letterSpacing > 0 || a11y.fontScale > 100 || a11y.dyslexiaFont || a11y.boldText;
  const view = roomyText ? "list" : chosenView;
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const openId = useOpenEventId();
  const open = calendarEvents.find((e) => e.id === openId) ?? null;

  const ym = MONTHS[month];
  const byDay = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, CalendarEvent[]>();
    for (const e of calendarEvents) {
      if (freeOnly && !e.free) continue;
      if (q && !`${e.title} ${e.summary}`.toLowerCase().includes(q)) continue;
      for (const d of e.days) map.set(d, [...(map.get(d) ?? []), e]);
    }
    return map;
  }, [query, freeOnly]);

  /** Every date in the month, YYYY-MM-DD. */
  const monthDays = useMemo(() => {
    const days: string[] = [];
    for (const d = utc(`${ym}-01`); isoOf(d).startsWith(ym); d.setUTCDate(d.getUTCDate() + 1)) days.push(isoOf(d));
    return days;
  }, [ym]);
  const busyDays = monthDays.filter((d) => (byDay.get(d) ?? []).length);
  const monthEvents = new Set(monthDays.flatMap((d) => (byDay.get(d) ?? []).map((e) => e.id)));

  return (
    <div className="min-w-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] bg-white p-4 ring-1 ring-teal-500/8 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth((m) => m - 1)}
              disabled={month === 0}
              aria-label="Previous month"
              className="grid size-10 place-items-center rounded-full bg-cream text-teal-600 transition hover:bg-sun-500 disabled:opacity-35"
            >
              <ChevronLeft className="size-5" />
            </button>
            <label className="relative min-w-0">
              <span className="sr-only">Month</span>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="h-10 max-w-full appearance-none rounded-full bg-teal-500 pl-4 pr-9 font-display text-base font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sun-400"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {MONTH_TITLE.format(utc(`${m}-01`))}
                  </option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-white" aria-hidden="true" />
            </label>
            <button
              type="button"
              onClick={() => setMonth((m) => m + 1)}
              disabled={month === MONTHS.length - 1}
              aria-label="Next month"
              className="grid size-10 place-items-center rounded-full bg-cream text-teal-600 transition hover:bg-sun-500 disabled:opacity-35"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          {roomyText ? (
            <p className="hidden max-w-xs text-xs leading-snug text-ink/60 md:block">Showing the list view because larger or wider text is on in the accessibility menu.</p>
          ) : (
            <div role="radiogroup" aria-label="Calendar view" className="hidden rounded-full bg-cream p-1 md:inline-flex">
              {(
                [
                  ["month", "Month", LayoutGrid],
                  ["list", "List", List],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={view === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
                    view === id ? "bg-white text-teal-700 shadow-soft" : "text-ink/60 hover:text-teal-700",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search events</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events (e.g. bonfire, Christmas, 5K)"
              className="h-11 w-full rounded-full bg-cream pl-10 pr-4 text-sm text-ink placeholder:text-ink/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
            />
          </label>
          <button
            type="button"
            aria-pressed={freeOnly}
            onClick={() => setFreeOnly((f) => !f)}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
              freeOnly ? "bg-sun-500 text-teal-700" : "bg-cream text-teal-600 hover:bg-sun-100",
            )}
          >
            <Sparkles className="size-4" aria-hidden="true" /> Free events
          </button>
        </div>
        <p className="text-sm text-ink/60" aria-live="polite">
          {monthEvents.size} event{monthEvents.size === 1 ? "" : "s"} in {MONTH_TITLE.format(utc(`${ym}-01`))}
          {(query || freeOnly) && " matching your filters"}
        </p>
      </div>

      {/* Month view (desktop): the days that have events, four to a row. */}
      {view === "month" && (
        <div className="mt-4 hidden md:block">
          {busyDays.length ? (
            <ol className="grid grid-cols-3 items-start gap-3 lg:grid-cols-4">
              {busyDays.map((d) => (
                <DayCell key={d} day={d} events={byDay.get(d) ?? []} />
              ))}
            </ol>
          ) : (
            <NoEvents />
          )}
        </div>
      )}

      {/* Day-by-day list (phones, or "List" view) */}
      <div className={cn("mt-4", view === "month" && "md:hidden")}>
        <DayList days={monthDays} byDay={byDay} />
      </div>

      <p className="mt-4 text-xs text-ink/55">
        Events as listed on wildwoodsnj.com on {LONG.format(utc(CALENDAR_AS_OF))}. Dates and details can change, so confirm with the organiser before you
        travel.
      </p>

      <EventDialog event={open} />
    </div>
  );
}

function DayCell({ day, events }: { day: string; events: CalendarEvent[] }) {
  const d = utc(day);
  const today = day === CALENDAR_AS_OF;
  return (
    <li className="overflow-hidden rounded-2xl bg-white ring-1 ring-teal-500/8">
      <h3 className={cn("flex items-baseline gap-2 px-3.5 py-2.5", today ? "bg-sun-500 text-teal-700" : "bg-teal-500 text-white")}>
        <span className="display text-2xl tabular-nums">{d.getUTCDate()}</span>
        <span className="text-[0.72rem] font-bold uppercase tracking-wider opacity-90">{today ? "Today" : WEEKDAY_LONG_ONLY.format(d)}</span>
      </h3>
      <ul className="flex flex-col divide-y divide-teal-500/8 px-2 pb-1.5" aria-label={`Events on ${WEEKDAY_LONG.format(d)}`}>
        {events.map((e) => (
          <li key={e.id} className="group flex items-start gap-2 rounded-lg px-1.5 py-2 transition-colors hover:bg-cream">
            <button type="button" onClick={() => openEvent(e.id)} className="min-w-0 flex-1 text-left" lang="en">
              <span
                className={cn(
                  "block hyphens-auto break-words text-[0.86rem] font-medium leading-snug text-teal-800 group-hover:text-coral-600",
                  e.cancelled && "line-through decoration-ink/40",
                )}
              >
                {e.title}
              </span>
              {(e.free || e.isNew || e.cancelled) && (
                <span className="mt-1 flex flex-wrap gap-1">
                  <Badges event={e} small />
                </span>
              )}
            </button>
            <SaveButton type="calendar" id={e.id} title={e.title} variant="mini" className="size-7 shrink-0" />
          </li>
        ))}
      </ul>
    </li>
  );
}

function NoEvents() {
  return (
    <div className="rounded-[1.75rem] bg-white px-6 py-12 text-center ring-1 ring-teal-500/8">
      <CalendarDays className="mx-auto size-8 text-teal-500/50" aria-hidden="true" />
      <p className="mt-3 font-display text-lg font-bold text-teal-600">No events match this month</p>
      <p className="mt-1 text-sm text-ink/60">Try another month, or clear the search and free-only filter.</p>
    </div>
  );
}

function DayList({ days, byDay }: { days: string[]; byDay: Map<string, CalendarEvent[]> }) {
  const withEvents = days.filter((d) => (byDay.get(d) ?? []).length);
  if (!withEvents.length) return <NoEvents />;
  return (
    <ol className="flex flex-col gap-5">
      {withEvents.map((d) => {
        const date = utc(d);
        return (
          <li key={d}>
            <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-teal-600">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-500 text-base text-white tabular-nums">{date.getUTCDate()}</span>
              {WEEKDAY_LONG.format(date)}
              {d === CALENDAR_AS_OF && <span className="rounded-full bg-sun-500 px-2 py-0.5 text-xs text-teal-700">Today</span>}
            </h3>
            <ul className="flex flex-col gap-2">
              {(byDay.get(d) ?? []).map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-teal-500/8">
                  <button type="button" onClick={() => openEvent(e.id)} className="group flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-teal-100 sm:h-20 sm:w-28">
                      <Image src={e.image} alt="" fill sizes="112px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block font-display font-bold leading-tight text-teal-600 group-hover:text-coral-600", e.cancelled && "line-through decoration-ink/40")}>
                        {e.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink/60">
                        {dateRange(e)}
                        <Badges event={e} small />
                      </span>
                      <span className="mt-1 line-clamp-2 hidden text-sm leading-snug text-ink/70 sm:block">{e.summary}</span>
                    </span>
                  </button>
                  <SaveButton type="calendar" id={e.id} title={e.title} variant="mini" />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

function Badges({ event: e, small = false }: { event: CalendarEvent; small?: boolean }) {
  const cls = cn("rounded-full font-bold uppercase tracking-wide", small ? "px-1.5 py-px text-[0.58rem]" : "px-2.5 py-1 text-xs");
  return (
    <>
      {e.cancelled && <span className={cn(cls, "bg-gray-100 text-ink/70")}>Cancelled</span>}
      {e.free && <span className={cn(cls, "bg-sun-100 text-teal-700")}>Free</span>}
      {e.isNew && <span className={cn(cls, "bg-turquoise-50 text-teal-700")}>New</span>}
    </>
  );
}

function EventDialog({ event }: { event: CalendarEvent | null }) {
  return <AnimatePresence>{event && <DialogBody key={event.id} event={event} />}</AnimatePresence>;
}

function DialogBody({ event: e }: { event: CalendarEvent }) {
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, true, closeEvent);
  useScrollLock(true);
  const listedDays = e.days.map((d) => DAY_SHORT.format(utc(d)));
  // Relative to the date the calendar was read, so it matches the listings.
  const over = e.end < CALENDAR_AS_OF;
  const contiguous = e.days.length === Math.round((utc(e.end).getTime() - utc(e.start).getTime()) / 86_400_000) + 1;

  const planStay = () => {
    const checkout = utc(e.end);
    checkout.setUTCDate(checkout.getUTCDate() + 1);
    // Already under way: plan from the listing date onwards.
    emit("ww:prefill-dates", { checkIn: e.start < CALENDAR_AS_OF ? CALENDAR_AS_OF : e.start, checkOut: isoOf(checkout) });
    closeEvent();
    requestAnimationFrame(() => document.getElementById("book-stay")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" tabIndex={-1} aria-label="Close event details" onClick={closeEvent} className="absolute inset-0 cursor-default bg-teal-900/75 backdrop-blur-sm" />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        className="on-light relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-cream sm:rounded-[2rem]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative aspect-[16/9] bg-teal-100">
          <Image src={e.image} alt={e.title} fill sizes="672px" className="object-cover" />
          <button
            type="button"
            onClick={closeEvent}
            aria-label="Close event details"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white text-teal-600 shadow-soft transition hover:bg-sun-500"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex flex-wrap items-center gap-2">
              <span className="eyebrow text-ocean-600">{dateRange(e)}</span>
              <Badges event={e} />
            </p>
            <SaveButton type="calendar" id={e.id} title={e.title} variant="pill" />
          </div>
          <h2 id="event-dialog-title" className={cn("display mt-3 text-[clamp(2rem,6vw,3.25rem)] text-teal-500", e.cancelled && "line-through decoration-ink/30")}>
            {e.title}
          </h2>
          <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-teal-700">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-ocean-600" aria-hidden="true" />
            <span>
              {dateRange(e, true)}
              {!contiguous && <span className="block font-normal text-ink/65">On the calendar: {listedDays.join(", ")}</span>}
            </span>
          </p>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-ink/75">{e.description}</p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {e.website && (
              <a
                href={e.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-teal-500 px-5 text-sm font-semibold text-white transition hover:bg-teal-600"
              >
                Event website <ExternalLink className="size-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <a
              href={e.page}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/25 transition hover:ring-teal-500/60"
            >
              View on wildwoodsnj.com <ExternalLink className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {!e.cancelled && !over && (
              <button
                type="button"
                onClick={planStay}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-teal-700 transition hover:bg-sun-300"
              >
                <BedDouble className="size-4" aria-hidden="true" /> Stay for this event
              </button>
            )}
          </div>
          {over && !e.cancelled && (
            <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-ink/70 ring-1 ring-teal-500/10">
              This event had already taken place when the calendar was last updated ({DAY_SHORT.format(utc(CALENDAR_AS_OF))}).
            </p>
          )}
          <p className="mt-5 text-xs text-ink/55">Details from wildwoodsnj.com. Times, tickets and locations are set by the organiser.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
