"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BedDouble, Compass, CornerDownLeft, FileText, Hash, MapPin, Search, X } from "lucide-react";
import { searchSite, suggestedSearches, type SearchEntry, type SearchKind } from "@/data/search";
import { emit } from "@/lib/events";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const kindIcon: Record<SearchKind, typeof MapPin> = {
  Section: Hash,
  Page: FileText,
  Place: MapPin,
  Stay: BedDouble,
  Category: Compass,
};

const ease = [0.16, 1, 0.3, 1] as const;

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>{open && <SearchDialog onClose={onClose} />}</AnimatePresence>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const results = useMemo(() => searchSite(query), [query]);

  useFocusTrap(panel, true, onClose, input);
  useScrollLock(true);

  const choose = (entry: SearchEntry) => {
    onClose();
    const onHome = window.location.pathname === "/";
    if (/^https?:/.test(entry.href)) {
      window.open(entry.href, "_blank", "noopener");
    } else if (onHome && entry.href.startsWith("/#")) {
      const id = entry.href.slice(2);
      document.getElementById(id)?.scrollIntoView({ block: "start" });
      history.replaceState(null, "", `#${id}`);
    } else {
      router.push(entry.href);
    }
    if (entry.event) {
      const { name, detail } = entry.event;
      // Let the scroll settle so the receiving section is mounted and visible.
      window.setTimeout(() => emit(name, detail as never), 350);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[Math.min(activeIndex, results.length - 1)]);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto px-4 pb-10 pt-24 sm:pt-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-teal-900/80 backdrop-blur-sm"
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search the Wildwoods"
        className="on-light relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-cream shadow-lift"
        initial={{ y: 40, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.98, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.55, ease }}
      >
        <div className="flex items-center gap-3 border-b border-teal-500/10 px-5 py-4 sm:px-6">
          <Search className="size-6 shrink-0 text-ocean-500" strokeWidth={2.4} aria-hidden="true" />
          <label htmlFor={`${listId}-input`} className="sr-only">
            Search beaches, rides, places to stay and photo spots
          </label>
          <input
            ref={input}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={`${listId}-list`}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? `${listId}-opt-${activeIndex}` : undefined}
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search beaches, rides, stays, photo spots…"
            className="h-12 w-full bg-transparent font-display text-xl font-semibold text-teal-600 placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:text-ink/45 focus:outline-none sm:text-2xl"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-500/8 text-teal-600 transition hover:bg-teal-500 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-3 py-4 sm:px-4">
          {!query && (
            <div className="px-2 pb-2">
              <p className="eyebrow mb-3 text-ink/55">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuery(s);
                      setActiveIndex(0);
                      input.current?.focus();
                    }}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-600 ring-1 ring-teal-500/15 transition hover:bg-sun-500 hover:ring-sun-500"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <p className="px-3 py-8 text-center text-ink/65" role="status">
              No matches for “{query}”. Try “beach”, “pier” or “motel”.
            </p>
          )}

          <ul id={`${listId}-list`} role="listbox" aria-label="Search results" className="flex flex-col gap-1">
            {results.map((r, i) => {
              const Icon = kindIcon[r.kind];
              const active = i === activeIndex;
              return (
                <li
                  key={r.id}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(r)}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-2xl px-3 py-3 transition-colors",
                    active ? "bg-teal-500 text-white" : "text-ink hover:bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      active ? "bg-white/15 text-sun-400" : "bg-turquoise-50 text-ocean-600",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{r.label}</span>
                    <span className={cn("block truncate text-sm", active ? "text-white/75" : "text-ink/60")}>
                      {r.kind} · {r.description}
                    </span>
                  </span>
                  {active ? (
                    <CornerDownLeft className="size-4 shrink-0 text-sun-400" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="size-4 shrink-0 text-ink/30" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="border-t border-teal-500/10 px-6 py-3 text-xs text-ink/55">
          <kbd className="rounded bg-white px-1.5 py-0.5 font-sans ring-1 ring-teal-500/15">↑</kbd>{" "}
          <kbd className="rounded bg-white px-1.5 py-0.5 font-sans ring-1 ring-teal-500/15">↓</kbd> to browse ·{" "}
          <kbd className="rounded bg-white px-1.5 py-0.5 font-sans ring-1 ring-teal-500/15">Enter</kbd> to open ·{" "}
          <kbd className="rounded bg-white px-1.5 py-0.5 font-sans ring-1 ring-teal-500/15">Esc</kbd> to close
        </p>
      </motion.div>
    </motion.div>
  );
}
