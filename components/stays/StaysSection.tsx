"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpDown, ChevronDown, Info, Search, SlidersHorizontal, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useReveal } from "@/components/animation/useReveal";
import { stayAreas, type Stay } from "@/data/accommodations";
import { defaultContent } from "@/lib/cms/content";
import { Accent, fittedTitleClass } from "@/lib/cms/render";
import { useContent } from "@/lib/cms/store";
import { listen } from "@/lib/events";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { activeChips, applyFilters, defaultFilters, sortLabels, type SortKey, type StayFilters as Filters } from "./filters";
import { StayCard } from "./StayCard";
import { StayDetailsDialog } from "./StayDetailsDialog";
import { StayFilters } from "./StayFilters";

const INITIAL = 6;

export function StaysSection() {
  const root = useRef<HTMLElement>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showAll, setShowAll] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [details, setDetails] = useState<Stay | null>(null);
  useReveal(root);
  const copy = useContent("staysCopy");
  const list = useContent("stays");
  // List order in the editor is the "Recommended" order.
  const ranked = useMemo(() => list.map((s, i) => ({ ...s, rank: i + 1 })), [list]);

  const results = useMemo(() => applyFilters(filters, ranked), [filters, ranked]);
  const chips = activeChips(filters);
  const shown = showAll ? results : results.slice(0, INITIAL);

  useEffect(
    () =>
      listen("ww:search-stays", ({ query }) => {
        setFilters({ ...defaultFilters, query });
        setShowAll(true);
      }),
    [],
  );

  // "Book your stay" card on the events page: area and party size.
  useEffect(
    () =>
      listen("ww:filter-stays", ({ area, guests }) => {
        setFilters({ ...defaultFilters, area: (area in stayAreas ? area : "all") as Filters["area"], guests: Math.max(1, Math.min(16, guests)) });
        setShowAll(true);
      }),
    [],
  );

  // Opened from the wishlist.
  useEffect(
    () =>
      listen("ww:open-stay", ({ id }) => {
        const stay = ranked.find((s) => s.id === id);
        if (stay) setDetails(stay);
      }),
    [ranked],
  );

  const clearAll = () => setFilters(defaultFilters);

  return (
    <section id="stays" ref={root} aria-labelledby="stays-title" className="on-light relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader
            id="stays-title"
            titleClassName={fittedTitleClass(copy.title, defaultContent.staysCopy.title, "max-w-[16ch] text-[clamp(3rem,8.4vw,7.75rem)]")}
            title={<Accent text={copy.title} className="text-ocean-500" />}
            lede={copy.intro || undefined}
          />
          {copy.notice && (
            <p data-reveal className="flex max-w-sm gap-3 rounded-3xl bg-sun-50 p-4 text-sm leading-relaxed text-teal-700 ring-1 ring-sun-300">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {copy.notice}
            </p>
          )}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
          <aside aria-label="Filter places to stay" className="hidden lg:block">
            <div data-reveal className="sticky top-28 rounded-[2rem] bg-white p-6 ring-1 ring-teal-500/10">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-xl font-bold text-teal-600">Filters</p>
                {chips.length > 0 && (
                  <button type="button" onClick={clearAll} className="text-sm font-semibold text-coral-600 underline-offset-4 hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <StayFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div className="min-w-0">
            <div data-reveal className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search places to stay</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ocean-500" aria-hidden="true" />
                <input
                  type="search"
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Search by name, area or amenity"
                  className="h-13 w-full rounded-full bg-cream pl-12 pr-5 font-medium text-ink ring-1 ring-inset ring-teal-500/15 placeholder:text-ink/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDrawer(true)}
                  aria-haspopup="dialog"
                  className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-teal-500 px-5 font-semibold text-white lg:hidden"
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filters{chips.length ? ` (${chips.length})` : ""}
                </button>
                <label className="relative flex-1 sm:flex-none">
                  <span className="sr-only">Sort by</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
                    className="h-13 w-full appearance-none rounded-full bg-cream pl-11 pr-10 font-semibold text-ink ring-1 ring-inset ring-teal-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 sm:w-60"
                  >
                    {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                      <option key={k} value={k}>
                        {sortLabels[k]}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ocean-500" aria-hidden="true" />
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-teal-500" aria-hidden="true" />
                </label>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2" aria-live="polite">
              <p className="mr-2 font-semibold text-ink">
                <span className="font-display text-2xl font-extrabold text-teal-600">{results.length}</span>{" "}
                {results.length === 1 ? "place" : "places"} to stay
              </p>
              <AnimatePresence initial={false}>
                {chips.map((c) => (
                  <motion.button
                    key={c.key}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setFilters(c.clear(filters))}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sun-500 py-1.5 pl-3.5 pr-2.5 text-sm font-semibold text-teal-700 transition hover:bg-sun-300"
                  >
                    {c.label}
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </motion.button>
                ))}
              </AnimatePresence>
              {chips.length > 1 && (
                <button type="button" onClick={clearAll} className="text-sm font-semibold text-coral-600 underline-offset-4 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div data-reveal className="mt-8">
              {results.length === 0 ? (
                <EmptyState onClear={clearAll} />
              ) : (
                <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {shown.map((s) => (
                      <StayCard key={s.id} stay={s} onDetails={setDetails} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {results.length > INITIAL && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-teal-500 px-7 font-semibold text-white transition hover:bg-teal-600"
                >
                  {showAll ? "Show fewer" : `View All Places to Stay (${results.length})`}
                  <ChevronDown className={cn("size-5 transition-transform", showAll && "rotate-180")} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} count={results.length} onClear={clearAll} hasFilters={chips.length > 0}>
        <StayFilters filters={filters} onChange={setFilters} />
      </FilterDrawer>
      <StayDetailsDialog stay={details} onClose={() => setDetails(null)} />
    </section>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[2rem] bg-cream px-6 py-16 text-center ring-1 ring-teal-500/8">
      <svg viewBox="0 0 120 80" className="h-24 w-36" aria-hidden="true">
        <circle cx="86" cy="26" r="14" fill="#FFD400" />
        <path d="M60 20c-18 0-30 12-32 24h64c-2-12-14-24-32-24z" fill="#F15A24" />
        <path d="M60 44v26" stroke="#105665" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 66c12-6 22-6 34 0s22 6 34 0 22-6 34 0 14 6 18 3v11H0z" fill="#12B9D0" />
      </svg>
      <p className="mt-4 font-display text-2xl font-bold text-teal-600">No stays match those filters</p>
      <p className="mt-2 max-w-sm text-ink/65">Try widening the price range, removing an amenity or choosing another area.</p>
      <button type="button" onClick={onClear} className="mt-6 inline-flex h-12 items-center rounded-full bg-sun-500 px-6 font-semibold text-teal-700 transition hover:bg-sun-300">
        Clear all filters
      </button>
    </div>
  );
}

function FilterDrawer({
  open,
  onClose,
  count,
  onClear,
  hasFilters,
  children,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  onClear: () => void;
  hasFilters: boolean;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, open, onClose);
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close filters" onClick={onClose} className="absolute inset-0 bg-teal-900/70" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="on-light absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[2rem] bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-teal-500/10 px-6 py-4">
              <p className="font-display text-xl font-bold text-teal-600">Filters</p>
              <button type="button" onClick={onClose} aria-label="Close filters" className="grid size-10 place-items-center rounded-full bg-cream text-teal-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            <div className="flex gap-3 border-t border-teal-500/10 px-6 py-4">
              <button type="button" onClick={onClear} disabled={!hasFilters} className="h-13 rounded-full px-5 font-semibold text-coral-600 disabled:text-ink/30">
                Clear all
              </button>
              <button type="button" onClick={onClose} className="h-13 flex-1 rounded-full bg-teal-500 font-semibold text-white">
                Show {count} {count === 1 ? "result" : "results"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

