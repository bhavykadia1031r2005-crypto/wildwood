"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, MapPin, Star, Users } from "lucide-react";
import { amenityLabels, stayAreas, stayTypeSingular, type Stay } from "@/data/accommodations";
import { resolveImage } from "@/lib/cms/render";
import { amenityIcons } from "./StayFilters";

export const StayCard = forwardRef<HTMLElement, { stay: Stay; onDetails: (s: Stay) => void }>(function StayCard(
  { stay, onDetails },
  ref,
) {
  const img = resolveImage(stay.imageId, stay.name);
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-teal-500/8 transition-shadow duration-500 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-teal-100">
        {img && (
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-teal-900/45 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-600">
          {stayTypeSingular[stay.type]}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-sun-500 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-teal-700">
          Sample
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-teal-900/60 px-2.5 py-1 text-[0.65rem] font-semibold text-white/90 backdrop-blur-sm">
          Area photo
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold leading-tight text-teal-600">{stay.name}</h3>
          <p className="flex shrink-0 items-center gap-1 rounded-full bg-sun-100 px-2 py-0.5 text-sm font-bold text-teal-700" title="Sample rating for demonstration">
            <Star className="size-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
            {stay.rating.toFixed(1)}
            <span className="sr-only"> out of 5, sample rating</span>
          </p>
        </div>
        <p className="mt-1.5 flex items-center gap-3 text-sm text-ink/65">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-ocean-500" aria-hidden="true" />
            {stayAreas[stay.area]}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 text-ocean-500" aria-hidden="true" />
            Sleeps {stay.maxGuests}
          </span>
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Amenities">
          {stay.amenities.map((a) => {
            const Icon = amenityIcons[a];
            return (
              <li key={a} className="inline-flex items-center gap-1 rounded-full bg-turquoise-50 px-2.5 py-1 text-xs font-semibold text-teal-600">
                <Icon className="size-3.5" aria-hidden="true" />
                {amenityLabels[a]}
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="leading-tight">
            <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-ink/45">From · sample</span>
            <span className="font-display text-2xl font-extrabold text-teal-600">${stay.priceFrom}</span>
            <span className="text-sm text-ink/55"> /night</span>
          </p>
          <button
            type="button"
            onClick={() => onDetails(stay)}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-teal-500 px-4 text-sm font-semibold text-white transition hover:bg-sun-500 hover:text-teal-700"
          >
            View Details
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            <span className="sr-only">for {stay.name}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
});
