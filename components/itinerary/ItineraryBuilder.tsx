"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
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
import { cn, formatList } from "@/lib/utils";
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

const spring = { type: "spring", stiffness: 420, damping: 30 } as const;

export function ItineraryBuilder() {
  const root = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<TripPreferences>(emptyPreferences);
  const [variant, setVariant] = useState(0);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [builtFor, setBuiltFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ block: "start" }));
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

  const summary = useMemo(
    () => [
      { label: "Style", value: travelStyles.find((s) => s.id === prefs.style)?.label },
      { label: "Length", value: tripLengths.find((t) => t.id === prefs.length)?.label },
      {
        label: "Into",
        value: prefs.interests.length
          ? formatList(prefs.interests.map((i) => interests.find((x) => x.id === i)!.label))
          : undefined,
      },
      { label: "Group", value: travelGroups.find((g) => g.id === prefs.group)?.label },
      { label: "Budget", value: budgets.find((b) => b.id === prefs.budget)?.note, optional: true },
    ],
    [prefs],
  );

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
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader
            id="itinerary-title"
            index="01"
            eyebrow="Customize your itinerary"
            title={
              <>
                Your Wildwoods. <span className="display-accent text-coral-600">Your way.</span>
              </>
            }
            lede="Build a beach escape that feels like you."
          />
          <p data-reveal className="max-w-xs text-sm leading-relaxed text-ink/65 lg:mb-3 lg:text-right">
            Four quick choices, one tailored plan. Suggestions come from our curated local picks and
            are built right here in your browser.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div className="flex flex-col gap-6">
            <Step number={1} title="What kind of trip?" done={Boolean(prefs.style)}>
              <div role="radiogroup" aria-label="Travel style" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {travelStyles.map((s) => {
                  const Icon = styleIcons[s.id];
                  const selected = prefs.style === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => update("style", s.id)}
                      className={cn(
                        "group relative flex min-h-36 flex-col items-start justify-between gap-4 overflow-hidden rounded-3xl p-4 text-left transition-[background-color,color,box-shadow] duration-300",
                        selected
                          ? "bg-teal-500 text-white shadow-soft"
                          : "bg-cream text-ink ring-1 ring-inset ring-teal-500/12 hover:ring-teal-500/40",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-11 place-items-center rounded-2xl transition-colors",
                          selected ? "bg-sun-500 text-teal-700" : "bg-white text-ocean-600 group-hover:bg-turquoise-50",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={2.2} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-display text-lg font-bold leading-tight">{s.label}</span>
                        <span className={cn("mt-1 block text-[0.8rem] leading-snug", selected ? "text-white/75" : "text-ink/60")}>
                          {s.blurb}
                        </span>
                      </span>
                      <CheckBadge show={selected} />
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step number={2} title="How long are you staying?" done={Boolean(prefs.length)}>
              <div
                role="radiogroup"
                aria-label="Trip length"
                className="grid grid-cols-2 gap-1.5 rounded-[1.75rem] bg-cream p-1.5 ring-1 ring-inset ring-teal-500/10 sm:grid-cols-4"
              >
                {tripLengths.map((t) => {
                  const selected = prefs.length === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => update("length", t.id)}
                      className={cn(
                        "relative rounded-[1.4rem] px-4 py-3.5 text-center transition-colors",
                        selected ? "text-white" : "text-ink hover:bg-white",
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="length-pill"
                          transition={spring}
                          className="absolute inset-0 rounded-[1.4rem] bg-teal-500"
                        />
                      )}
                      <span className="relative block font-display text-lg font-bold">{t.label}</span>
                      <span className={cn("relative block text-xs", selected ? "text-sun-300" : "text-ink/55")}>{t.note}</span>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step
              number={3}
              title="What are you into?"
              hint="Pick as many as you like"
              done={prefs.interests.length > 0}
            >
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Interests">
                {interests.map((i) => {
                  const Icon = interestIcons[i.id];
                  const selected = prefs.interests.includes(i.id);
                  return (
                    <motion.button
                      key={i.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleInterest(i.id)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "inline-flex h-12 items-center gap-2 rounded-full pl-3 pr-4 font-semibold transition-colors duration-300",
                        selected
                          ? "bg-sun-500 text-teal-700"
                          : "bg-cream text-ink ring-1 ring-inset ring-teal-500/15 hover:ring-teal-500/45",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 place-items-center rounded-full",
                          selected ? "bg-teal-500 text-sun-400" : "bg-white text-ocean-600",
                        )}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          {selected ? (
                            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                            </motion.span>
                          ) : (
                            <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Icon className="size-4" aria-hidden="true" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      {i.label}
                    </motion.button>
                  );
                })}
              </div>
            </Step>

            <div className="grid gap-6 md:grid-cols-2">
              <Step number={4} title="Who's coming?" done={Boolean(prefs.group)}>
                <div role="radiogroup" aria-label="Travel group" className="grid grid-cols-2 gap-2.5">
                  {travelGroups.map((g) => {
                    const Icon = groupIcons[g.id];
                    const selected = prefs.group === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => update("group", g.id)}
                        className={cn(
                          "flex h-14 items-center gap-3 rounded-2xl px-4 font-semibold transition-colors duration-300",
                          selected
                            ? "bg-teal-500 text-white"
                            : "bg-cream text-ink ring-1 ring-inset ring-teal-500/12 hover:ring-teal-500/40",
                        )}
                      >
                        <Icon className={cn("size-5", selected ? "text-sun-400" : "text-ocean-600")} aria-hidden="true" />
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </Step>

              <Step number={5} title="Budget" hint="Optional" done={Boolean(prefs.budget)} optional>
                <div role="radiogroup" aria-label="Budget (optional)" className="grid grid-cols-3 gap-2.5">
                  {budgets.map((b) => {
                    const selected = prefs.budget === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => update("budget", selected ? null : b.id)}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl px-2 py-2.5 transition-colors duration-300",
                          selected
                            ? "bg-orange-500 text-ink"
                            : "bg-cream text-ink ring-1 ring-inset ring-teal-500/12 hover:ring-teal-500/40",
                        )}
                      >
                        <span className="font-display text-xl font-extrabold">{b.label}</span>
                        <span className="text-[0.7rem] leading-tight opacity-75">{b.note}</span>
                      </button>
                    );
                  })}
                </div>
              </Step>
            </div>
          </div>

          {/* Trip ticket — live summary */}
          <aside aria-label="Your trip so far" className="lg:sticky lg:top-28 lg:self-start" data-reveal="right">
            <div className="relative overflow-hidden rounded-[2rem] bg-teal-500 text-white shadow-lift">
              <div className="relative overflow-hidden px-7 pb-6 pt-7">
                <div aria-hidden="true" className="absolute -right-7 -top-7 size-24 rounded-full bg-linear-to-b from-sun-500 to-orange-500" />
                <svg aria-hidden="true" viewBox="0 0 200 40" preserveAspectRatio="none" className="absolute right-0 top-[52px] h-6 w-32 text-turquoise-500">
                  <path d="M0 20c25-14 45-14 70 0s45 14 70 0 40-14 60-4v24H0z" fill="currentColor" />
                </svg>
                <p className="eyebrow relative text-turquoise-300">Admit one · Wildwoods, NJ</p>
                <div className="relative mt-5 flex items-center gap-4">
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
              </div>

              {/* Perforation with ticket notches */}
              <div aria-hidden="true" className="relative">
                <span className="absolute -left-4 -top-4 size-8 rounded-full bg-cream" />
                <span className="absolute -right-4 -top-4 size-8 rounded-full bg-cream" />
                <div className="mx-7 border-t-2 border-dashed border-white/25" />
              </div>

              <dl className="flex flex-col gap-3 px-7 py-6">
                {summary.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4">
                    <dt className="eyebrow shrink-0 text-[0.65rem] text-white/55">{row.label}</dt>
                    <dd className="min-w-0 text-right font-semibold">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={row.value ?? "empty"}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className={cn("block", !row.value && "text-white/35")}
                        >
                          {row.value ?? (row.optional ? "Any" : "—")}
                        </motion.span>
                      </AnimatePresence>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={() => build()}
                  disabled={!complete || loading}
                  aria-describedby={!complete ? "itinerary-help" : undefined}
                  className={cn(
                    "group/cta relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-300",
                    complete
                      ? "bg-sun-500 text-teal-700 hover:bg-sun-300"
                      : "bg-white/10 text-white/60",
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
              </div>
            </div>
          </aside>
        </div>

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
                onEdit={() => root.current?.scrollIntoView({ block: "start" })}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  hint,
  done,
  optional,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  done: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset data-reveal className="min-w-0 rounded-[2rem] bg-white p-5 shadow-[0_1px_0_rgb(16_86_101/0.06)] ring-1 ring-teal-500/8 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-full font-display text-sm font-extrabold transition-colors duration-300",
            done ? "bg-sun-500 text-teal-700" : "bg-teal-50 text-teal-500",
          )}
        >
          {done ? <Check className="size-4" strokeWidth={3} /> : number}
        </span>
        <span className="font-display text-xl font-bold text-teal-600 sm:text-2xl">{title}</span>
        {hint && (
          <span className={cn("ml-auto text-xs font-semibold", optional ? "text-ink/45" : "text-ocean-600")}>{hint}</span>
        )}
      </div>
      {children}
    </fieldset>
  );
}

function CheckBadge({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={spring}
          className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-sun-500 text-teal-700"
          aria-hidden="true"
        >
          <Check className="size-3.5" strokeWidth={3.5} />
        </motion.span>
      )}
    </AnimatePresence>
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
