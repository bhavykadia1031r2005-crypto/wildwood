"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, MapPin, Moon, Pencil, RefreshCw, Share2, Shuffle, Sun, Sunrise } from "lucide-react";
import { getMedia } from "@/data/media";
import type { Slot } from "@/data/itinerary";
import { areaName, itineraryToText, type Itinerary } from "@/lib/itinerary";
import { cn } from "@/lib/utils";

const slotMeta: Record<Slot, { label: string; icon: typeof Sun; tone: string }> = {
  morning: { label: "Morning", icon: Sunrise, tone: "bg-sun-500 text-teal-700" },
  afternoon: { label: "Afternoon", icon: Sun, tone: "bg-orange-500 text-ink" },
  evening: { label: "Evening", icon: Moon, tone: "bg-teal-500 text-white" },
};

const ease = [0.16, 1, 0.3, 1] as const;

export function ItineraryResults({
  itinerary,
  outdated,
  loading,
  onShuffle,
  onUpdate,
  onEdit,
}: {
  itinerary: Itinerary;
  outdated: boolean;
  loading: boolean;
  onShuffle: () => void;
  onUpdate: () => void;
  onEdit: () => void;
}) {
  const [dayIndex, setDayIndex] = useState(0);
  const [copied, setCopied] = useState<"idle" | "copied" | "error">("idle");
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const safeIndex = Math.min(dayIndex, itinerary.days.length - 1);
  const day = itinerary.days[safeIndex];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(itineraryToText(itinerary));
      setCopied("copied");
    } catch {
      setCopied("error");
    }
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  const share = async () => {
    try {
      await navigator.share({ title: itinerary.title, text: itineraryToText(itinerary) });
    } catch {
      /* User dismissed the share sheet. */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.8, ease }}
      className="mt-16 overflow-hidden rounded-[2.5rem] bg-teal-500 text-white"
      aria-labelledby="itinerary-result-title"
    >
      <div className="relative overflow-hidden px-6 pb-8 pt-10 sm:px-10 sm:pt-12">
        <div aria-hidden="true" className="absolute -bottom-24 -right-16 size-72 rounded-full bg-turquoise-500/25" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-sun-400">Your plan is ready</p>
            <h3 id="itinerary-result-title" className="display mt-3 text-[clamp(2.4rem,5vw,4.5rem)]">
              {itinerary.title}
            </h3>
            <p className="mt-3 max-w-xl text-white/80">{itinerary.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={onShuffle} icon={Shuffle} disabled={loading}>
              Shuffle ideas
            </ActionButton>
            <ActionButton onClick={onEdit} icon={Pencil}>
              Edit choices
            </ActionButton>
            <ActionButton onClick={copy} icon={copied === "copied" ? Check : Copy} highlight={copied === "copied"}>
              {copied === "copied" ? "Copied!" : copied === "error" ? "Copy failed" : "Copy plan"}
            </ActionButton>
            {canShare && (
              <ActionButton onClick={share} icon={Share2}>
                Share
              </ActionButton>
            )}
          </div>
        </div>

        <AnimatePresence>
          {outdated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-hidden"
            >
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sun-500 px-5 py-3 text-teal-700">
                <p className="font-semibold">You changed your choices. Refresh the plan to match.</p>
                <button
                  type="button"
                  onClick={onUpdate}
                  className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  <RefreshCw className="size-4" aria-hidden="true" /> Update itinerary
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {itinerary.days.length > 1 && (
          <div role="tablist" aria-label="Itinerary days" className="scrollbar-none relative mt-8 flex gap-2 overflow-x-auto pb-1">
            {itinerary.days.map((d, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={d.day}
                  type="button"
                  role="tab"
                  id={`day-tab-${d.day}`}
                  aria-selected={active}
                  aria-controls="day-panel"
                  onClick={() => setDayIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") setDayIndex((i + 1) % itinerary.days.length);
                    if (e.key === "ArrowLeft") setDayIndex((i - 1 + itinerary.days.length) % itinerary.days.length);
                  }}
                  tabIndex={active ? 0 : -1}
                  className={cn(
                    "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                    active ? "text-teal-700" : "text-white/80 ring-1 ring-inset ring-white/20 hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="day-tab-pill"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative">Day {d.day}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        id="day-panel"
        role={itinerary.days.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={itinerary.days.length > 1 ? `day-tab-${day.day}` : undefined}
        className="bg-cream px-4 pb-10 pt-8 text-ink sm:px-10"
      >
        <p className="font-display text-xl font-bold text-teal-600">
          Day {day.day} <span className="text-ink/35">·</span> {day.theme}
        </p>
        <AnimatePresence mode="wait">
          <motion.ol
            key={`${itinerary.title}-${day.day}-${day.stops.map((s) => s.activity.id).join()}`}
            className="mt-6 grid gap-5 md:grid-cols-3"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{ show: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
          >
            {day.stops.map(({ slot, activity }) => {
              const meta = slotMeta[slot];
              const img = activity.imageId ? getMedia(activity.imageId) : null;
              return (
                <motion.li
                  key={slot}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                  }}
                  className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_1px_0_rgb(16_86_101/0.06)] ring-1 ring-teal-500/8"
                >
                  {img && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                      />
                      <span className={cn("absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider", meta.tone)}>
                        <meta.icon className="size-3.5" aria-hidden="true" />
                        {meta.label}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="font-display text-xl font-bold leading-tight text-teal-600">{activity.title}</h4>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/70">{activity.description}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600">
                      <MapPin className="size-4" aria-hidden="true" />
                      {areaName(activity.area)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        </AnimatePresence>
        <p className="mt-8 text-sm text-ink/55">
          Suggestions are generated in your browser from a curated sample of local ideas — check hours,
          seasons and tickets before you go.
        </p>
      </div>
    </motion.div>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  children,
  highlight,
  disabled,
}: {
  onClick: () => void;
  icon: typeof Sun;
  children: React.ReactNode;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
        highlight ? "bg-sun-500 text-teal-700" : "bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white hover:text-teal-600",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span aria-live="polite">{children}</span>
    </motion.button>
  );
}
