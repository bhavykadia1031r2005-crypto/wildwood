"use client";

import Image from "next/image";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info, MapPin, Star, Users, X } from "lucide-react";
import { amenityLabels, stayAreas, stayTypeSingular, type Stay } from "@/data/accommodations";
import { SaveButton } from "@/components/wishlist/SaveButton";
import { resolveImage } from "@/lib/cms/render";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { amenityIcons } from "./StayFilters";

export function StayDetailsDialog({ stay, onClose }: { stay: Stay | null; onClose: () => void }) {
  return <AnimatePresence>{stay && <Dialog stay={stay} onClose={onClose} />}</AnimatePresence>;
}

function Dialog({ stay, onClose }: { stay: Stay; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, true, onClose);
  useScrollLock(true);
  const img = resolveImage(stay.imageId, stay.name);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button type="button" tabIndex={-1} aria-label="Close details" onClick={onClose} className="absolute inset-0 cursor-default bg-teal-900/75 backdrop-blur-sm" />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stay-dialog-title"
        className="on-light relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-cream sm:rounded-[2rem]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative aspect-[16/8] bg-teal-100">
          {img && <Image src={img.src} alt={img.alt} fill sizes="672px" className="object-cover" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white text-teal-600 shadow-soft transition hover:bg-sun-500"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="eyebrow text-ocean-600">{stayTypeSingular[stay.type]} · {stayAreas[stay.area]}</p>
            <SaveButton type="stay" id={stay.id} title={stay.name} variant="pill" />
          </div>
          <h3 id="stay-dialog-title" className="display mt-2 text-5xl text-teal-500">
            {stay.name}
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-ink/75">{stay.description}</p>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Star, label: "Rating (sample)", value: `${stay.rating.toFixed(1)} / 5` },
              { icon: Users, label: "Sleeps", value: `Up to ${stay.maxGuests}` },
              { icon: MapPin, label: "From (sample)", value: `$${stay.priceFrom}/night` },
            ].map((d) => (
              <div key={d.label} className="rounded-2xl bg-white p-4 ring-1 ring-teal-500/8">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-ink/55">
                  <d.icon className="size-3.5 text-ocean-500" aria-hidden="true" />
                  {d.label}
                </dt>
                <dd className="mt-1 font-display text-lg font-bold text-teal-600">{d.value}</dd>
              </div>
            ))}
          </dl>

          <h4 className="eyebrow mt-6 text-teal-500">Amenities</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {stay.amenities.map((a) => {
              const Icon = amenityIcons[a];
              return (
                <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-turquoise-50 px-3 py-1.5 text-sm font-semibold text-teal-600">
                  <Icon className="size-4" aria-hidden="true" /> {amenityLabels[a]}
                </li>
              );
            })}
          </ul>

          <p className="mt-8 flex gap-3 rounded-2xl bg-sun-100 p-4 text-sm text-teal-700">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            This is a sample listing that shows how stays will appear. Availability, pricing and booking
            will be available once a partner booking feed is connected.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
