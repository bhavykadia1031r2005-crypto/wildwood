"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ExternalLink, Lightbulb, MapPin, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { getMedia } from "@/data/media";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function GalleryLightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  return (
    <AnimatePresence>
      {index !== null && items[index] && (
        <Lightbox items={items} index={index} onClose={onClose} onIndex={onIndex} />
      )}
    </AnimatePresence>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, true, onClose);
  useScrollLock(true);

  const item = items[index];
  const media = getMedia(item.mediaId);
  const go = useCallback((dir: number) => onIndex((index + dir + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    thumbs.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [index]);

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer: ${item.title}`}
      className="fixed inset-0 z-[80] flex flex-col bg-teal-950/96 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-display text-sm font-bold tracking-wider text-white/70" aria-live="polite">
          {index + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-sun-500 hover:text-teal-700"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={item.id}
            className="absolute inset-0 px-4 sm:px-20"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
          >
            <div className="relative size-full">
              <Image src={media.src} alt={media.alt} fill sizes="100vw" className="pointer-events-none object-contain" draggable={false} />
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-sun-500 hover:text-teal-700 sm:grid"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-sun-500 hover:text-teal-700 sm:grid"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-4 px-5 pt-5 sm:grid-cols-[1fr_auto] sm:px-6">
        <div>
          <h3 className="font-display text-2xl font-bold">{item.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-turquoise-200">
            <MapPin className="size-4" aria-hidden="true" /> {item.location}
          </p>
          <p className="mt-2 flex gap-2 text-sm text-white/75">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-sun-400" aria-hidden="true" />
            {item.tip}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-white/55 sm:max-w-xs sm:text-right">
          Photo: {media.credit.author} ·{" "}
          {media.credit.licenseUrl ? (
            <a href={media.credit.licenseUrl} target="_blank" rel="noreferrer license" className="underline underline-offset-2 hover:text-white">
              {media.credit.license}
            </a>
          ) : (
            media.credit.license
          )}{" "}
          ·{" "}
          <a href={media.credit.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-white">
            Source <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </p>
      </div>

      <div ref={thumbs} className="scrollbar-none mt-4 flex gap-2 overflow-x-auto px-5 pb-5 sm:justify-center sm:px-6" aria-label="All photos" role="group">
        {items.map((it, i) => {
          const m = getMedia(it.mediaId);
          return (
            <button
              key={it.id}
              type="button"
              data-i={i}
              onClick={() => onIndex(i)}
              aria-label={`Show ${it.title}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl transition",
                i === index ? "ring-3 ring-sun-500" : "opacity-55 hover:opacity-100",
              )}
            >
              <Image src={m.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
