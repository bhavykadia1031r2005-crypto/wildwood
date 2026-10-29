"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { CalendarDays, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { stayAreas } from "@/data/accommodations";
import { emit, listen } from "@/lib/events";
import { cn } from "@/lib/utils";

/**
 * "Book your stay now": dates, party size and area. Search opens the homepage's
 * places-to-stay section filtered by area and guests. Listings there are samples
 * and availability isn't connected, so dates are for planning only (and say so).
 */
export function BookStayCard({ className }: { className?: string }) {
  const router = useRouter();
  const id = useId();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [area, setArea] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // "Stay for this event" in an event's details fills in its dates.
  useEffect(
    () =>
      listen("ww:prefill-dates", ({ checkIn: a, checkOut: b }) => {
        setCheckIn(a);
        setCheckOut(b);
        setError(null);
      }),
    [],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out needs to be after check-in.");
      return;
    }
    setError(null);
    router.push("/#stays");
    // Wait for the stays section to mount on the homepage, then apply the filters.
    const started = Date.now();
    const apply = () => {
      if (document.getElementById("stays")) window.setTimeout(() => emit("ww:filter-stays", { area, guests }), 150);
      else if (Date.now() - started < 5000) requestAnimationFrame(apply);
    };
    requestAnimationFrame(apply);
  };

  const field = "flex h-12 w-full items-center gap-2.5 rounded-xl bg-white px-3.5 text-[0.95rem] text-ink ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-sun-400";

  return (
    <section id="book-stay" aria-labelledby={`${id}-title`} className={cn("@container scroll-mt-28 rounded-[1.75rem] bg-teal-600 p-4 text-white shadow-soft sm:p-6", className)}>
      <h2 id={`${id}-title`} className="font-display text-xl font-extrabold uppercase tracking-wide text-orange-300">
        Book your stay now
      </h2>
      <p className="mt-1 text-sm text-white/75">Plan your nights around the events you love.</p>

      <form onSubmit={submit} noValidate className="mt-5 grid gap-3 @min-[40rem]:grid-cols-[1.4fr_1fr_1fr_auto]">
        <fieldset className="grid gap-2 @min-[24rem]:grid-cols-2 @min-[40rem]:col-span-1">
          <legend className="sr-only">Choose dates</legend>
          {(
            [
              ["Check-in", checkIn, setCheckIn, undefined],
              ["Check-out", checkOut, setCheckOut, checkIn || undefined],
            ] as const
          ).map(([label, value, set, min]) => (
            <label key={label} className={cn(field, "h-auto py-1.5 pl-3 pr-2.5")}>
              <CalendarDays className="hidden size-4 shrink-0 text-teal-600 @min-[20rem]:block" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[0.62rem] font-bold uppercase tracking-wider text-ink/50">{label}</span>
                <input
                  type="date"
                  value={value}
                  min={min}
                  onChange={(e) => set(e.target.value)}
                  aria-describedby={`${id}-note`}
                  className="w-full min-w-0 bg-transparent text-sm focus:outline-none"
                />
              </span>
            </label>
          ))}
        </fieldset>

        <div className={cn(field, "justify-between")} role="group" aria-label="Guests">
          <Users className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="Fewer guests" className="grid size-7 place-items-center rounded-full bg-cream text-teal-600 disabled:opacity-40">
            <Minus className="size-3.5" />
          </button>
          <output aria-live="polite" className="whitespace-nowrap text-sm font-semibold tabular-nums">
            {guests} {guests === 1 ? "person" : "people"}
          </output>
          <button type="button" onClick={() => setGuests((g) => Math.min(16, g + 1))} disabled={guests >= 16} aria-label="More guests" className="grid size-7 place-items-center rounded-full bg-cream text-teal-600 disabled:opacity-40">
            <Plus className="size-3.5" />
          </button>
        </div>

        <label className={cn(field, "relative")}>
          <MapPin className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
          <span className="sr-only">Area</span>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent pr-6 text-sm focus:outline-none">
            <option value="all">All areas</option>
            {Object.entries(stayAreas).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute right-3.5 size-3.5 text-ink/50">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </label>

        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 font-semibold text-teal-950 transition hover:bg-sun-500">
          <Search className="size-4" aria-hidden="true" /> Search
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-sun-300">
          {error}
        </p>
      )}
      <p id={`${id}-note`} className="mt-3 text-xs leading-relaxed text-white/65">
        Shows our places-to-stay listings for that area and group size. They&rsquo;re sample listings until a booking partner is connected, so dates are for
        planning only.
      </p>
    </section>
  );
}
