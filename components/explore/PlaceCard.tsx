"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Bed, Bird, ExternalLink, FerrisWheel, ShoppingBag, Umbrella, Users, UtensilsCrossed, X } from "lucide-react";
import { areas, categoryMeta, type PoiCategory, type PointOfInterest } from "@/data/attractions";
import { resolveImage } from "@/lib/cms/render";
import { googleMapsLink } from "@/lib/utils";

export const categoryIcons: Record<PoiCategory, typeof Umbrella> = {
  beaches: Umbrella,
  boardwalk: FerrisWheel,
  dining: UtensilsCrossed,
  shopping: ShoppingBag,
  family: Users,
  stay: Bed,
  nature: Bird,
};

export function placeAreaName(p: PointOfInterest) {
  return p.area === "nearby" ? "Nearby" : areas.find((a) => a.id === p.area)?.name;
}

/** Detail card for a selected place, shared by the interactive and illustrated maps. */
export function PlaceCard({ place, onClose }: { place: PointOfInterest; onClose: () => void }) {
  const meta = categoryMeta[place.category];
  const Icon = categoryIcons[place.category];
  const img = resolveImage(place.imageId, place.name);

  return (
    <motion.article
      key={place.id}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="on-light pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-lift"
      aria-live="polite"
    >
      {img && (
        <div className="relative aspect-[16/9]">
          <Image src={img.src} alt={img.alt} fill sizes="384px" className="object-cover" />
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: meta.color, color: meta.text }}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {meta.label}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close place details"
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-teal-600 shadow-soft transition hover:bg-sun-500"
      >
        <X className="size-4" />
      </button>
      <div className="p-5">
        <p className="eyebrow text-[0.65rem] text-ocean-600">{placeAreaName(place)}</p>
        <h3 className="mt-1.5 font-display text-xl font-bold leading-tight text-teal-600">{place.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{place.blurb}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <a
            href={googleMapsLink(place.lat, place.lng)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600 underline-offset-4 hover:underline"
          >
            Directions <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens Google Maps in a new tab)</span>
          </a>
          <span className="text-[0.7rem] text-ink/45">Approximate location</span>
        </div>
      </div>
    </motion.article>
  );
}
