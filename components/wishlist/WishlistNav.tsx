"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ExternalLink, Heart, X } from "lucide-react";
import { Thumb } from "@/components/ui/Thumb";
import { listen } from "@/lib/events";
import { useFocusTrap, useReducedMotion, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { removeSaved, useWishlist, type SavedType } from "@/lib/wishlist";
import { typeLabels, useOpenEntry, useSavedEntries, type SavedEntry } from "./entries";

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/** Heart button with a count for the floating nav, plus the wishlist drawer and "saved" toast. */
export function WishlistNav({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const items = useWishlist();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; key: number } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const count = items.length;

  const setDrawer = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const close = useCallback(() => setDrawer(false), [setDrawer]);

  useEffect(() => listen("ww:wishlist-saved", ({ title }) => setToast({ title, key: Date.now() })), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setDrawer(true)}
        aria-haspopup="dialog"
        aria-label={count ? `Wishlist, ${count} saved` : "Wishlist"}
        className="relative grid size-11 place-items-center rounded-full text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-coral-600"
      >
        <Heart className={cn("size-[1.15rem]", count > 0 && "fill-current")} strokeWidth={2.4} />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={reduced ? false : { scale: 0.4 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 16 }}
              aria-hidden="true"
              className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[0.65rem] font-bold leading-none text-white ring-2 ring-teal-600"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {mounted &&
        createPortal(
          <>
            <AnimatePresence>{open && <Drawer onClose={close} />}</AnimatePresence>
            <AnimatePresence>
              {toast && !open && (
                <motion.div
                  key={toast.key}
                  role="status"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
                  className="on-dark fixed bottom-24 left-4 right-4 z-[65] flex items-center gap-3 rounded-2xl bg-teal-700 px-4 py-3 text-sm text-white shadow-lift sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-max sm:max-w-md sm:-translate-x-1/2"
                >
                  <Heart className="size-4 shrink-0 fill-coral-500 text-coral-500" aria-hidden="true" />
                  <p className="min-w-0 flex-1 leading-snug">
                    Saved <span className="font-semibold">{toast.title}</span> to your wishlist.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setToast(null);
                      setDrawer(true);
                    }}
                    className="shrink-0 rounded-full bg-sun-500 px-3 py-1 text-xs font-bold text-teal-700 hover:bg-sun-300"
                  >
                    View
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </>
  );
}

const ORDER: SavedType[] = ["stay", "place", "activity", "event"];

function Drawer({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, true, onClose);
  useScrollLock(true);
  const items = useWishlist();
  const entries = useSavedEntries(items);
  const openEntry = useOpenEntry();

  return (
    <motion.div className="fixed inset-0 z-[75]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" tabIndex={-1} aria-label="Close wishlist" onClick={onClose} className="absolute inset-0 cursor-default bg-teal-900/60 backdrop-blur-sm" />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-title"
        className="on-light absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream text-ink shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
      >
        <header className="relative overflow-hidden bg-teal-500 px-6 pb-6 pt-7 text-white">
          <div aria-hidden="true" className="absolute -right-12 -top-16 size-40 rounded-full bg-linear-to-b from-sun-500 to-orange-500 opacity-90" />
          <p className="eyebrow relative flex items-center gap-2 text-[0.65rem] text-sun-400">
            <Heart className="size-3.5 fill-current" aria-hidden="true" /> Saved in this browser
          </p>
          <h2 id="wishlist-title" className="display relative mt-2 text-4xl">
            Your wishlist
          </h2>
          <p className="relative mt-1 text-sm text-white/80">
            {items.length ? `${items.length} saved ${items.length === 1 ? "item" : "items"}` : "Nothing saved yet"}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white text-teal-600 shadow-soft transition hover:bg-sun-500"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          {entries.length === 0 ? (
            <EmptyWishlist onNavigate={onClose} />
          ) : (
            ORDER.map((type) => {
              const group = entries.filter((e) => e.ref.type === type);
              if (!group.length) return null;
              return (
                <section key={type} className="mb-6 last:mb-0" aria-label={typeLabels[type].many}>
                  <h3 className="eyebrow mb-2 px-2 text-[0.65rem] text-ocean-600">
                    {typeLabels[type].many} · {group.length}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {group.map((entry) => (
                      <SavedRow
                        key={`${entry.ref.type}:${entry.ref.id}`}
                        entry={entry}
                        onOpen={() => {
                          onClose();
                          openEntry(entry);
                        }}
                      />
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        <footer className="border-t border-teal-500/10 bg-white px-5 py-4">
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-teal-500 font-semibold text-white transition hover:bg-sun-500 hover:text-teal-700"
          >
            Open full wishlist <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-2.5 text-center text-xs text-ink/55">No account needed. Share your list from the wishlist page.</p>
        </footer>
      </motion.div>
    </motion.div>
  );
}

function SavedRow({ entry, onOpen }: { entry: SavedEntry; onOpen: () => void }) {
  return (
    <motion.li layout exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-teal-500/8">
      <Thumb refValue={entry.image} alt="" className="h-14 w-16 rounded-xl" />
      <div className="min-w-0 flex-1">
        {entry.available ? (
          <button type="button" onClick={onOpen} className="group block w-full text-left">
            <span className="flex items-center gap-1 font-display text-[0.95rem] font-bold leading-tight text-teal-600 group-hover:text-coral-600">
              <span className="line-clamp-1">{entry.title}</span>
              {entry.external && <ExternalLink className="size-3 shrink-0" aria-hidden="true" />}
            </span>
            <span className="mt-0.5 line-clamp-1 block text-xs text-ink/60">{entry.subtitle}</span>
            {entry.external && <span className="sr-only">(opens in a new tab)</span>}
          </button>
        ) : (
          <>
            <p className="line-clamp-1 font-display text-[0.95rem] font-bold leading-tight text-ink/50">{entry.title}</p>
            <p className="mt-0.5 text-xs text-ink/50">{entry.subtitle}</p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeSaved(entry.ref)}
        aria-label={`Remove ${entry.title} from your wishlist`}
        title="Remove"
        className="grid size-9 shrink-0 place-items-center rounded-full text-coral-500 transition hover:bg-coral-100"
      >
        <Heart className="size-4 fill-current" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

export function EmptyWishlist({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-10 text-center", className)}>
      <span className="grid size-16 place-items-center rounded-full bg-coral-100 text-coral-500">
        <Heart className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-xl font-bold text-teal-600">Nothing saved yet</p>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink/65">
        Tap the heart on any place to stay, map spot, activity or event to keep it here for later.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/#stays" onClick={onNavigate} className="inline-flex h-10 items-center rounded-full bg-sun-500 px-4 text-sm font-semibold text-teal-700 hover:bg-sun-300">
          Browse places to stay
        </Link>
        <Link href="/#explore" onClick={onNavigate} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/20 hover:ring-teal-500/50">
          Explore the map
        </Link>
      </div>
    </div>
  );
}
