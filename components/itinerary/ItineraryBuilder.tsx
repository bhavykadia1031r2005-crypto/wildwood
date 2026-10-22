"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Baby,
  Bird,
  Check,
  FerrisWheel,
  Footprints,
  Heart,
  IceCreamCone,
  PartyPopper,
  RotateCcw,
  X,
  ShoppingBag,
  Sparkles,
  TreePalm,
  Umbrella,
  User,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MagneticButton } from "@/components/ui/Button";
import { useReveal } from "@/components/animation/useReveal";
import {
  budgets,
  interests,
  travelGroups,
  travelStyles,
  tripLengths,
  type Interest,
  type TravelGroup,
  type TravelStyle,
} from "@/data/itinerary";
import {
  completedSteps,
  emptyPreferences,
  generateItinerary,
  isComplete,
  type Itinerary,
  type TripPreferences,
} from "@/lib/itinerary";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn, seededRandom } from "@/lib/utils";
import { ItineraryResults } from "./ItineraryResults";

const styleIcons: Record<TravelStyle, typeof Users> = {
  family: Users,
  adventure: Waves,
  relax: TreePalm,
  romantic: Heart,
  foodie: IceCreamCone,
};

const interestIcons: Record<Interest, typeof Users> = {
  beaches: Umbrella,
  boardwalk: Footprints,
  amusement: FerrisWheel,
  dining: UtensilsCrossed,
  shopping: ShoppingBag,
  nature: Bird,
  events: PartyPopper,
};

const groupIcons: Record<TravelGroup, typeof Users> = {
  solo: User,
  couple: Heart,
  family: Baby,
  friends: Users,
};

export function ItineraryBuilder() {
  const root = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<TripPreferences>(emptyPreferences);
  const [variant, setVariant] = useState(0);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [builtFor, setBuiltFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(panel, open, close);
  useScrollLock(open);
  useReveal(root);

  const done = completedSteps(prefs);
  const complete = isComplete(prefs);
  const prefsKey = JSON.stringify(prefs);
  const outdated = Boolean(itinerary && builtFor !== prefsKey);

  const update = <K extends keyof TripPreferences>(key: K, value: TripPreferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const toggleInterest = (id: Interest) =>
    setPrefs((p) => ({
      ...p,
      interests: p.interests.includes(id) ? p.interests.filter((i) => i !== id) : [...p.interests, id],
    }));

  const build = (nextVariant = variant) => {
    if (!isComplete(prefs)) return;
    setLoading(true);
    // A short beat so the change registers visually; generation itself is instant and local.
    window.setTimeout(() => {
      setItinerary(generateItinerary(prefs, nextVariant));
      setBuiltFor(JSON.stringify(prefs));
      setLoading(false);
      setOpen(false);
      // Let the popup animate away before bringing the plan into view.
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ block: "start" }), 350);
    }, 450);
  };

  const shuffle = () => {
    const next = variant + 1;
    setVariant(next);
    if (isComplete(prefs)) {
      setItinerary(generateItinerary(prefs, next));
      setBuiltFor(JSON.stringify(prefs));
    }
  };

  const reset = () => {
    setPrefs(emptyPreferences);
    setItinerary(null);
    setBuiltFor(null);
  };

  const picks = useMemo(() => {
    const n = prefs.interests.length;
    return [
      travelStyles.find((st) => st.id === prefs.style)?.label,
      tripLengths.find((t) => t.id === prefs.length)?.label,
      travelGroups.find((g) => g.id === prefs.group)?.label,
      n ? `${n} ${n === 1 ? "interest" : "interests"}` : undefined,
      budgets.find((b) => b.id === prefs.budget)?.label,
    ].filter(Boolean) as string[];
  }, [prefs]);
  const picked = picks.length > 0;
  const summaryLine = picked ? picks.join(" · ") : "Your picks will appear here.";

  return (
    <section
      id="itinerary"
      ref={root}
      aria-labelledby="itinerary-title"
      className="on-light relative overflow-x-clip bg-cream pb-24 pt-20 md:pb-32 md:pt-28"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -top-[39px] h-10 w-full text-cream"
      >
        <path d="M0 40c160-30 320-40 480-20s320 40 480 20 320-40 480-10v30H0z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHeader
          id="itinerary-title"
          titleClassName="whitespace-nowrap text-[clamp(1.25rem,calc((100vw_-_4.5rem)/10.6),7.85rem)]"
          title={
            <>
              Your Wildwoods. <span className="display-accent text-coral-600">Your way.</span>
            </>
          }
        />

        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <p data-reveal className="max-w-xl text-lg leading-relaxed text-ink/75 md:text-xl">
            Build a beach escape that feels like you. Pick your style, trip length and interests, and
            we&rsquo;ll map out your days.
          </p>
          <div data-reveal className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <MagneticButton
              variant="sun"
              size="lg"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              icon={<Sparkles className="size-5" aria-hidden="true" />}
            >
              Create My Itinerary
            </MagneticButton>
            <p className="text-sm text-ink/60">Four quick picks · a day-by-day plan in seconds</p>
          </div>
        </div>

        {/* Trip planner popup: one boarding-pass ticket with choices and a tear-off stub. */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="planner"
              className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label="Close trip planner"
                onClick={close}
                className="fixed inset-0 cursor-default bg-teal-950/80 backdrop-blur-sm"
              />
              <div className="pointer-events-none relative flex min-h-full items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
                <motion.div
                  ref={panel}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="planner-title"
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="on-dark ticket-notched pointer-events-auto relative grid w-full max-w-[1240px] overflow-hidden rounded-[2.25rem] bg-teal-500 text-white shadow-lift lg:grid-cols-[minmax(0,1fr)_340px]"
                >
                  <div className="px-6 pb-8 pt-8 sm:px-9 sm:pt-9 lg:px-11 lg:pb-11 lg:pt-10">
                    <p className="eyebrow pr-12 text-turquoise-300 lg:pr-0">Trip planner · Wildwoods, NJ</p>
                    <h3 id="planner-title" className="mt-2 pr-12 font-display text-2xl font-extrabold leading-tight sm:text-[1.7rem] lg:pr-0">
                      Tap your picks. Your ticket fills in as you go.
                    </h3>

                    <div className="mt-8">
                      <TicketRow labelId="row-style" label="Style" step={1} done={Boolean(prefs.style)}>
                        <div role="radiogroup" aria-labelledby="row-style" className="flex flex-wrap gap-2">
                          {travelStyles.map((st) => {
                            const Icon = styleIcons[st.id];
                            const selected = prefs.style === st.id;
                            return (
                              <motion.button
                                key={st.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                title={st.blurb}
                                onClick={() => update("style", st.id)}
                                whileTap={{ scale: 0.95 }}
                                className={chip(selected)}
                              >
                                <Icon className="size-4" aria-hidden="true" />
                                {st.label}
                              </motion.button>
                            );
                          })}
                        </div>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.p
                            key={prefs.style ?? "none"}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2.5 text-sm text-white/60"
                          >
                            {travelStyles.find((st) => st.id === prefs.style)?.blurb ?? "Pick the mood of your trip."}
                          </motion.p>
                        </AnimatePresence>
                      </TicketRow>

                      <TicketRow labelId="row-length" label="Length" step={2} done={Boolean(prefs.length)}>
                        <div role="radiogroup" aria-labelledby="row-length" className="flex flex-wrap gap-2">
                          {tripLengths.map((t) => {
                            const selected = prefs.length === t.id;
                            return (
                              <motion.button
                                key={t.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => update("length", t.id)}
                                whileTap={{ scale: 0.95 }}
                                className={chip(selected)}
                              >
                                {t.label}
                                <span className={cn("font-medium", selected ? "text-teal-700/70" : "text-white/50")}>{t.note}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </TicketRow>

                      <TicketRow labelId="row-into" label="Into" hint="Pick any" step={3} done={prefs.interests.length > 0}>
                        <div role="group" aria-labelledby="row-into" className="flex flex-wrap gap-2">
                          {interests.map((i) => {
                            const Icon = interestIcons[i.id];
                            const selected = prefs.interests.includes(i.id);
                            return (
                              <motion.button
                                key={i.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleInterest(i.id)}
                                whileTap={{ scale: 0.95 }}
                                className={chip(selected)}
                              >
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={selected ? "on" : "off"}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="grid place-items-center"
                                  >
                                    {selected ? (
                                      <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                                    ) : (
                                      <Icon className="size-4" aria-hidden="true" />
                                    )}
                                  </motion.span>
                                </AnimatePresence>
                                {i.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </TicketRow>

                      <TicketRow labelId="row-group" label="Group" step={4} done={Boolean(prefs.group)}>
                        <div role="radiogroup" aria-labelledby="row-group" className="flex flex-wrap gap-2">
                          {travelGroups.map((g) => {
                            const Icon = groupIcons[g.id];
                            const selected = prefs.group === g.id;
                            return (
                              <motion.button
                                key={g.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => update("group", g.id)}
                                whileTap={{ scale: 0.95 }}
                                className={chip(selected)}
                              >
                                <Icon className="size-4" aria-hidden="true" />
                                {g.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </TicketRow>

                      <TicketRow labelId="row-budget" label="Budget" hint="Optional" done={Boolean(prefs.budget)}>
                        <div role="radiogroup" aria-labelledby="row-budget" className="flex flex-wrap gap-2">
                          {budgets.map((b) => {
                            const selected = prefs.budget === b.id;
                            return (
                              <motion.button
                                key={b.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => update("budget", selected ? null : b.id)}
                                whileTap={{ scale: 0.95 }}
                                className={chip(selected)}
                              >
                                <span className="font-display font-extrabold">{b.label}</span>
                                <span className={cn("font-medium", selected ? "text-teal-700/70" : "text-white/50")}>{b.note}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </TicketRow>
                    </div>
                  </div>

                  {/* Tear-off stub */}
                  <aside aria-label="Your trip ticket" className="relative flex flex-col bg-teal-600 px-6 pb-7 pt-9 sm:px-9 lg:px-8 lg:pt-10">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-8 top-0 border-t-2 border-dashed border-white/25 lg:inset-x-auto lg:inset-y-8 lg:left-0 lg:border-l-2 lg:border-t-0"
                    />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-linear-to-b from-sun-500 to-orange-500" />
                      <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="absolute right-0 top-[66px] h-6 w-36 text-turquoise-500">
                        <path d="M0 20c25-14 45-14 70 0s45 14 70 0 40-14 60-4v24H0z" fill="currentColor" />
                      </svg>
                    </div>

                    <div className="relative flex flex-1 flex-col">
                      <p className="eyebrow text-turquoise-300">Admit one</p>
                      <div className="mt-5 flex items-center gap-4">
                        <ProgressRing value={done} total={4} />
                        <div>
                          <p className="font-display text-2xl font-extrabold leading-tight">
                            {complete ? "Ready to roll" : "Your trip ticket"}
                          </p>
                          <p className="text-sm text-white/70" aria-live="polite">
                            {done} of 4 steps complete
                          </p>
                        </div>
                      </div>

                      <div className="mt-7 rounded-2xl bg-white/6 p-4 ring-1 ring-inset ring-white/10">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="eyebrow text-[0.6rem] text-white/50">From</p>
                            <p className="whitespace-nowrap font-display text-lg font-bold">You</p>
                          </div>
                          <svg aria-hidden="true" viewBox="0 0 60 12" preserveAspectRatio="none" className="mb-2 h-3 min-w-6 flex-1 text-sun-400">
                            <path d="M0 6h52" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                            <path d="M50 1l7 5-7 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="text-right">
                            <p className="eyebrow text-[0.6rem] text-white/50">To</p>
                            <p className="whitespace-nowrap font-display text-lg font-bold text-sun-400">The Wildwoods</p>
                          </div>
                        </div>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.p
                            key={summaryLine}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className={cn("mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed", picked ? "text-white/85" : "text-white/45")}
                          >
                            {summaryLine}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <button
                        type="button"
                        onClick={() => build()}
                        disabled={!complete || loading}
                        aria-describedby={!complete ? "itinerary-help" : undefined}
                        className={cn(
                          "relative mt-6 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-300",
                          complete ? "bg-sun-500 text-teal-700 hover:bg-sun-300" : "bg-white/10 text-white/60",
                        )}
                      >
                        <Sparkles className={cn("size-5", loading && "animate-spin")} aria-hidden="true" />
                        {loading ? "Mapping your days…" : outdated ? "Update My Itinerary" : "Create My Itinerary"}
                      </button>
                      {!complete && (
                        <p id="itinerary-help" className="mt-3 text-center text-xs text-white/60">
                          Choose a style, trip length, at least one interest and your group.
                        </p>
                      )}
                      {done > 0 && (
                        <button
                          type="button"
                          onClick={reset}
                          className="mx-auto mt-3 flex items-center gap-1.5 text-xs font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
                        >
                          <RotateCcw className="size-3.5" aria-hidden="true" /> Start over
                        </button>
                      )}

                      <div aria-hidden="true" className="min-h-7 flex-1" />
                      <div aria-hidden="true" className="border-t border-dashed border-white/15 pt-5">
                        <svg viewBox="0 0 240 36" preserveAspectRatio="none" className="h-9 w-full text-white/70">
                          {BARCODE.map((b) => (
                            <rect key={b.x} x={b.x} y="0" width={b.w} height="36" fill="currentColor" />
                          ))}
                        </svg>
                        <p className="mt-2 flex justify-between text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/45">
                          <span>WW · NJ</span>
                          <span>Curated local picks</span>
                        </p>
                      </div>
                    </div>
                  </aside>

                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close trip planner"
                    className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-white text-teal-700 shadow-soft transition hover:bg-sun-500"
                  >
                    <X className="size-5" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={resultsRef} className="scroll-mt-28">
          <AnimatePresence mode="wait">
            {loading && !itinerary && <ResultsSkeleton key="skeleton" />}
            {itinerary && (
              <ItineraryResults
                key="results"
                itinerary={itinerary}
                outdated={outdated}
                loading={loading}
                onShuffle={shuffle}
                onUpdate={() => build()}
                onEdit={() => setOpen(true)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const chip = (selected: boolean) =>
  cn(
    "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200",
    selected
      ? "bg-sun-500 text-teal-700 shadow-[0_8px_20px_-10px_rgb(255_212_0/0.8)]"
      : "bg-white/8 text-white/90 ring-1 ring-inset ring-white/15 hover:bg-white/15 hover:text-white",
  );

/** Deterministic barcode so server and client render the same bars. */
const BARCODE = (() => {
  const rand = seededRandom(20260611);
  const bars: { x: number; w: number }[] = [];
  for (let x = 0; x < 236; ) {
    const w = 1 + Math.floor(rand() * 3);
    bars.push({ x, w });
    x += w + 1 + Math.floor(rand() * 3);
  }
  return bars;
})();

function TicketRow({
  labelId,
  label,
  hint,
  step,
  done,
  children,
}: {
  labelId: string;
  label: string;
  hint?: string;
  step?: number;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 border-t border-white/10 py-5 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[150px_minmax(0,1fr)] md:gap-6">
      <div className="flex items-center gap-2.5 md:items-start md:pt-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-extrabold transition-colors duration-300",
            done ? "bg-sun-500 text-teal-700" : "text-white/60 ring-1 ring-inset ring-white/25",
          )}
        >
          {done ? <Check className="size-3.5" strokeWidth={3.5} /> : (step ?? "+")}
        </span>
        <span>
          <span id={labelId} className="eyebrow block text-[0.7rem] text-turquoise-200">
            {label}
          </span>
          {hint && <span className="mt-0.5 block text-xs text-white/50">{hint}</span>}
        </span>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-16 shrink-0" role="img" aria-label={`${value} of ${total} steps complete`}>
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#FFD400"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c - (value / total) * c }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-lg font-extrabold">
        {value}/{total}
      </span>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-16 grid gap-5 md:grid-cols-3"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-teal-500/8">
          <div className="aspect-[4/3] animate-pulse bg-teal-50" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-20 animate-pulse rounded-full bg-teal-50" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-teal-50" />
            <div className="h-3 w-full animate-pulse rounded-full bg-teal-50" />
          </div>
        </div>
      ))}
    </motion.div>
  );
}
