"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Expand, MapPin } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useReveal } from "@/components/animation/useReveal";
import { galleryCategories, galleryItems, type GalleryCategory } from "@/data/gallery";
import { getMedia } from "@/data/media";
import { gsap, MOTION_OK, useGSAP } from "@/lib/animation";
import { listen } from "@/lib/events";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "./GalleryLightbox";
import { TravelQRCode } from "./TravelQRCode";

/*
 * Asymmetric editorial rhythm on a 12-column grid (6 on tablets, 2 on phones).
 * The pattern repeats every 12 tiles; `grid-flow-dense` back-fills any gaps.
 */
const tilePattern = [
  "col-span-2 row-span-2 md:col-span-4 md:row-span-3 lg:col-span-7 lg:row-span-4",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-5 lg:row-span-2",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:col-span-5 lg:row-span-2",
  "col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3",
  "col-span-2 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3",
  "col-span-1 row-span-1 md:col-span-3 md:row-span-2 lg:col-span-5 lg:row-span-2",
  "col-span-1 row-span-2 md:col-span-3 md:row-span-3 lg:col-span-7 lg:row-span-4",
  "col-span-2 row-span-1 md:col-span-3 md:row-span-1 lg:col-span-5 lg:row-span-2",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3",
  "col-span-2 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3",
];

const filmstrip = [
  "wildwoods-sign-kites",
  "carousel-ferris-wheel-night",
  "sunrise-northeast",
  "doo-wop-motel-doors",
  "boardwalk-tramcar",
  "beach-lifeguard-rainbow",
  "macks-neon",
  "hereford-lighthouse",
  "kite-festival",
  "lollipop-motel-sign",
];

const INITIAL = 12;

export function PhotographyGallery() {
  const root = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<GalleryCategory | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  useReveal(root);

  const filtered = useMemo(
    () => (category === "all" ? galleryItems : galleryItems.filter((g) => g.category === category)),
    [category],
  );
  const visible = expanded || category !== "all" ? filtered : filtered.slice(0, INITIAL);

  useEffect(
    () =>
      listen("ww:open-photo", ({ id }) => {
        setCategory("all");
        setExpanded(true);
        const i = galleryItems.findIndex((g) => g.id === id);
        if (i >= 0) setOpen(i);
      }),
    [],
  );

  // Horizontal storytelling: the filmstrip glides sideways as the page scrolls.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = strip.current;
        if (!el) return;
        gsap.fromTo(
          el,
          { x: () => -Math.max(0, el.scrollWidth - window.innerWidth) * 0.1 },
          {
            x: () => -Math.max(0, el.scrollWidth - window.innerWidth) * 0.9,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="things-to-do"
      ref={root}
      aria-labelledby="gallery-title"
      className="on-light relative overflow-hidden bg-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHeader
          id="gallery-title"
          index="04"
          eyebrow="Photo spots & things to see"
          title={
            <>
              Wildwoods, <span className="display-accent text-coral-600">through your lens.</span>
            </>
          }
          lede="Find the places worth remembering."
        />
      </div>

      <div aria-hidden="true" className="mt-14 overflow-hidden">
        <div ref={strip} className="flex w-max gap-4 pl-5 will-change-transform sm:pl-8">
          {filmstrip.map((id, i) => {
            const m = getMedia(id);
            return (
              <div
                key={id}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-[1.75rem]",
                  i % 3 === 0 ? "h-56 w-80 md:h-72 md:w-[26rem]" : i % 3 === 1 ? "h-56 w-44 md:h-72 md:w-56" : "h-56 w-64 md:h-72 md:w-80",
                )}
              >
                <Image src={m.src} alt="" fill sizes="(min-width: 768px) 420px, 320px" className="object-cover" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-[1320px] px-5 sm:px-8">
        <div data-reveal className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter photos by category">
          {[{ id: "all" as const, label: "All photos" }, ...galleryCategories].map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCategory(c.id);
                  setExpanded(false);
                }}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                  active ? "text-white" : "text-ink ring-1 ring-inset ring-teal-500/15 hover:ring-teal-500/45",
                )}
              >
                {active && (
                  <motion.span layoutId="gallery-filter" className="absolute inset-0 rounded-full bg-teal-500" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{c.label}</span>
              </button>
            );
          })}
        </div>

        <motion.ul
          layout
          className="mt-8 grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[170px] md:grid-cols-6 md:gap-4 lg:auto-rows-[118px] lg:grid-cols-12"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => {
              const m = getMedia(item.mediaId);
              const label = galleryCategories.find((c) => c.id === item.category)?.label;
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("relative", tilePattern[i % tilePattern.length])}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(galleryItems.indexOf(item))}
                    className="group relative block size-full overflow-hidden rounded-[1.5rem] bg-teal-100 text-left md:rounded-[2rem]"
                    aria-label={`Open photo: ${item.title}, ${item.location}`}
                  >
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, (min-width: 768px) 60vw, 100vw"
                      className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-teal-950/80 via-teal-950/10 to-transparent opacity-90 transition-opacity duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white transition-all duration-500 md:p-5 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:translate-y-0 [@media(hover:hover)]:group-focus-visible:opacity-100">
                      <span className="min-w-0">
                        <span className="eyebrow block text-[0.6rem] text-sun-400">{label}</span>
                        <span className="mt-1 block truncate font-display text-lg font-bold leading-tight md:text-xl">{item.title}</span>
                        <span className="mt-0.5 hidden items-center gap-1 text-xs text-white/80 sm:flex">
                          <MapPin className="size-3" aria-hidden="true" /> {item.location}
                        </span>
                      </span>
                      <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-sun-500 text-teal-700 sm:grid">
                        <Expand className="size-4" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {category === "all" && filtered.length > INITIAL && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/30 transition hover:bg-teal-500 hover:text-white"
            >
              {expanded ? "Show fewer photos" : `See all ${filtered.length} photo spots`}
              <ChevronDown className={cn("size-5 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
            </button>
          </div>
        )}

        <TravelQRCode />
      </div>

      <GalleryLightbox items={galleryItems} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
