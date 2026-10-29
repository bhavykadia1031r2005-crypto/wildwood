"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, ExternalLink, Heart, Info, Link2, Trash2, Undo2, X } from "lucide-react";
import { resolveImage } from "@/lib/cms/render";
import { useOrigin } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { addSaved, decodeShare, encodeShare, removeSaved, replaceWishlist, useWishlist, type SavedItem, type SavedType } from "@/lib/wishlist";
import { typeLabels, useOpenEntry, useResolvedRefs, useSavedEntries, type SavedEntry } from "./entries";
import { SaveButton } from "./SaveButton";
import { EmptyWishlist } from "./WishlistNav";

type Filter = "all" | SavedType;
const FILTERS: Filter[] = ["all", "stay", "place", "activity", "event", "calendar"];

const actionLabel: Record<SavedType, string> = {
  stay: "View details",
  place: "Show on map",
  activity: "Explore",
  event: "See event",
  calendar: "Open in calendar",
};

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/** The /wishlist page body: your saved items, or a list someone shared with you. */
export function WishlistView() {
  const params = useSearchParams();
  const shared = useMemo(() => decodeShare(params.get("items")), [params]);
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-[2rem] bg-white" />
        ))}
      </div>
    );
  }
  return shared.length ? <SharedList refs={shared} /> : <MyList />;
}

function MyList() {
  const items = useWishlist();
  const entries = useSavedEntries(items);
  const origin = useOrigin();
  const [filter, setFilter] = useState<Filter>("all");
  const [cleared, setCleared] = useState<SavedItem[] | null>(null);
  const [copied, setCopied] = useState<"ok" | "manual" | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: entries.length, stay: 0, place: 0, activity: 0, event: 0, calendar: 0 };
    entries.forEach((e) => c[e.ref.type]++);
    return c;
  }, [entries]);
  const active = counts[filter] ? filter : "all";
  const shown = active === "all" ? entries : entries.filter((e) => e.ref.type === active);
  const shareUrl = origin ? `${origin}/wishlist?items=${encodeShare(items)}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied("ok");
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied("manual");
    }
  };

  return (
    <div>
      <AnimatePresence>
        {cleared && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl bg-teal-500 px-4 py-3 text-sm text-white"
          >
            <span className="flex-1">Wishlist cleared.</span>
            <button
              type="button"
              onClick={() => {
                replaceWishlist(cleared);
                setCleared(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-sun-500 px-3 py-1 font-semibold text-teal-700 hover:bg-sun-300"
            >
              <Undo2 className="size-3.5" aria-hidden="true" /> Undo
            </button>
            <button type="button" onClick={() => setCleared(null)} aria-label="Dismiss" className="grid size-7 place-items-center rounded-full hover:bg-white/15">
              <X className="size-4" />
            </button>
          </motion.p>
        )}
      </AnimatePresence>

      {entries.length === 0 ? (
        <div className="rounded-[2rem] bg-white ring-1 ring-teal-500/8">
          <EmptyWishlist className="py-16" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
              {FILTERS.filter((f) => f === "all" || counts[f] > 0).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                    active === f ? "bg-teal-500 text-white" : "bg-white text-teal-600 ring-1 ring-inset ring-teal-500/15 hover:ring-teal-500/40",
                  )}
                >
                  {f === "all" ? "All" : typeLabels[f].many}
                  <span className={cn("rounded-full px-1.5 text-xs", active === f ? "bg-white/20" : "bg-teal-50")}>{counts[f]}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                disabled={!shareUrl}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-sun-500 px-4 text-sm font-semibold text-teal-700 transition hover:bg-sun-300"
              >
                {copied === "ok" ? <Check className="size-4" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
                {copied === "ok" ? "Link copied" : "Copy share link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCleared(items);
                  replaceWishlist([]);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-coral-700 ring-1 ring-inset ring-coral-500/30 transition hover:bg-coral-100/50"
              >
                <Trash2 className="size-4" aria-hidden="true" /> Clear all
              </button>
            </div>
          </div>
          {copied === "manual" && (
            <label className="mt-4 block text-sm text-ink/70">
              Copy this link to share your list:
              <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} className="mt-1.5 h-11 w-full rounded-xl bg-white px-3 text-sm text-teal-700 ring-1 ring-teal-500/20" />
            </label>
          )}

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {shown.map((entry) => (
                <EntryCard key={`${entry.ref.type}:${entry.ref.id}`} entry={entry} />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}

      <p className="mt-10 flex gap-3 rounded-3xl bg-sun-50 p-5 text-sm leading-relaxed text-teal-700 ring-1 ring-sun-300">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Your wishlist is saved in this browser only — no account needed, and nothing is sent to us. Clearing your browsing data removes it. Places to
        stay are sample listings until a booking partner is connected.
      </p>
    </div>
  );
}

function SharedList({ refs }: { refs: ReturnType<typeof decodeShare> }) {
  const resolved = useResolvedRefs(refs);
  const entries = useSavedEntries(resolved);
  const mine = useWishlist();
  const available = entries.filter((e) => e.available);
  const missing = available.filter((e) => !mine.some((m) => m.type === e.ref.type && m.id === e.ref.id));

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 ring-1 ring-teal-500/8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[0.65rem] text-coral-600">Shared with you</p>
          <p className="mt-1 font-display text-2xl font-bold text-teal-600">
            {available.length} saved {available.length === 1 ? "idea" : "ideas"} for the Wildwoods
          </p>
          <p className="mt-1 text-sm text-ink/65">Save the ones you like to your own wishlist, or all of them at once.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={missing.length === 0}
            onClick={() => addSaved(missing.map((e) => ({ ...e.ref, title: e.title, savedAt: Date.now() })))}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-teal-700 transition hover:bg-sun-300 disabled:opacity-60"
          >
            <Heart className={cn("size-4", missing.length === 0 && "fill-current")} aria-hidden="true" />
            {missing.length === 0 ? "All saved to your wishlist" : `Save all ${missing.length} to my wishlist`}
          </button>
          <Link href="/wishlist" className="inline-flex h-11 items-center gap-2 rounded-full bg-teal-500 px-5 text-sm font-semibold text-white hover:bg-teal-600">
            My wishlist <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((entry) => (
          <EntryCard key={`${entry.ref.type}:${entry.ref.id}`} entry={entry} shared />
        ))}
      </ul>
      {available.length < entries.length && (
        <p className="mt-6 text-sm text-ink/60">
          {entries.length - available.length} shared {entries.length - available.length === 1 ? "item is" : "items are"} no longer listed on the site.
        </p>
      )}
    </div>
  );
}

function EntryCard({ entry, shared = false }: { entry: SavedEntry; shared?: boolean }) {
  const openEntry = useOpenEntry();
  const img = resolveImage(entry.image, entry.title);
  const { type } = entry.ref;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      className={cn("flex flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-teal-500/8", !entry.available && "opacity-70")}
    >
      <div className="relative aspect-[4/3] bg-teal-100">
        {img && <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw" className="object-cover" />}
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-600">
          {typeLabels[type].one}
          {entry.sample && " · Sample"}
        </span>
        {entry.available ? (
          <SaveButton type={type} id={entry.ref.id} title={entry.title} className="absolute right-3 top-3" />
        ) : (
          !shared && (
            <button
              type="button"
              onClick={() => removeSaved(entry.ref)}
              aria-label={`Remove ${entry.title} from your wishlist`}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-coral-600 shadow-soft"
            >
              <X className="size-4" />
            </button>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold leading-tight text-teal-600">{entry.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/65">{entry.subtitle}</p>
        {entry.available && (
          <button
            type="button"
            onClick={() => openEntry(entry)}
            className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm font-semibold text-ocean-600 underline-offset-4 hover:text-coral-600 hover:underline"
          >
            {actionLabel[type]}
            {entry.external ? <ExternalLink className="size-3.5" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
            <span className="sr-only">
              : {entry.title}
              {entry.external && " (opens in a new tab)"}
            </span>
          </button>
        )}
      </div>
    </motion.li>
  );
}
