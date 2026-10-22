"use client";

import { useId } from "react";
import { Car, Minus, PawPrint, Plus, Umbrella, WavesLadder, Wifi } from "lucide-react";
import {
  amenityLabels,
  priceBounds,
  stayAreas,
  stayTypes,
  type Amenity,
  type StayArea,
  type StayType,
} from "@/data/accommodations";
import { cn } from "@/lib/utils";
import { ratingOptions, type StayFilters as Filters } from "./filters";

export const amenityIcons: Record<Amenity, typeof Wifi> = {
  pool: WavesLadder,
  "beach-access": Umbrella,
  parking: Car,
  wifi: Wifi,
  "pet-friendly": PawPrint,
};

function Group({ title, children, htmlFor }: { title: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="border-b border-teal-500/10 pb-6 last:border-0 last:pb-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="eyebrow mb-3 block text-[0.68rem] text-teal-500">
          {title}
        </label>
      ) : (
        <p className="eyebrow mb-3 text-[0.68rem] text-teal-500">{title}</p>
      )}
      {children}
    </div>
  );
}

const chip = (on: boolean) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
    on ? "bg-teal-500 text-white" : "bg-cream text-ink ring-1 ring-inset ring-teal-500/15 hover:ring-teal-500/45",
  );

export function StayFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const id = useId();
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const [lo, hi] = filters.price;
  const span = priceBounds.max - priceBounds.min;

  return (
    <div className="flex flex-col gap-6">
      <Group title="Type of stay">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Type of stay">
          {(Object.keys(stayTypes) as StayType[]).map((t) => (
            <button key={t} type="button" aria-pressed={filters.types.includes(t)} onClick={() => set("types", toggle(filters.types, t))} className={chip(filters.types.includes(t))}>
              {stayTypes[t]}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Area" htmlFor={`${id}-area`}>
        <div className="relative">
          <select
            id={`${id}-area`}
            value={filters.area}
            onChange={(e) => set("area", e.target.value as StayArea | "all")}
            className="h-12 w-full appearance-none rounded-2xl bg-cream px-4 pr-10 font-semibold text-ink ring-1 ring-inset ring-teal-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
          >
            <option value="all">All areas</option>
            {(Object.keys(stayAreas) as StayArea[]).map((a) => (
              <option key={a} value={a}>
                {stayAreas[a]}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-teal-500">
            ▾
          </span>
        </div>
      </Group>

      <Group title="Nightly price (sample)">
        <div className="mb-4 flex items-center justify-between font-display text-lg font-bold text-teal-600">
          <span>${lo}</span>
          <span className="text-ink/30">—</span>
          <span>
            ${hi}
            {hi === priceBounds.max ? "+" : ""}
          </span>
        </div>
        <div className="relative h-7">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-teal-500/12" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-teal-500"
            style={{ left: `${((lo - priceBounds.min) / span) * 100}%`, right: `${100 - ((hi - priceBounds.min) / span) * 100}%` }}
          />
          <input
            type="range"
            className="range-dual"
            min={priceBounds.min}
            max={priceBounds.max}
            step={10}
            value={lo}
            aria-label="Minimum nightly price"
            aria-valuetext={`$${lo}`}
            onChange={(e) => set("price", [Math.min(Number(e.target.value), hi - 10), hi])}
          />
          <input
            type="range"
            className="range-dual"
            min={priceBounds.min}
            max={priceBounds.max}
            step={10}
            value={hi}
            aria-label="Maximum nightly price"
            aria-valuetext={`$${hi}`}
            onChange={(e) => set("price", [lo, Math.max(Number(e.target.value), lo + 10)])}
          />
        </div>
      </Group>

      <Group title="Guest rating (sample)">
        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Minimum guest rating">
          {ratingOptions.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={filters.minRating === r.value}
              onClick={() => set("minRating", r.value)}
              className={cn(chip(filters.minRating === r.value), "justify-center px-2")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Amenities">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Amenities">
          {(Object.keys(amenityLabels) as Amenity[]).map((a) => {
            const Icon = amenityIcons[a];
            const on = filters.amenities.includes(a);
            return (
              <button key={a} type="button" aria-pressed={on} onClick={() => set("amenities", toggle(filters.amenities, a))} className={chip(on)}>
                <Icon className="size-4" aria-hidden="true" />
                {amenityLabels[a]}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Guests">
        <div className="flex items-center justify-between rounded-2xl bg-cream p-1.5 ring-1 ring-inset ring-teal-500/15">
          <button
            type="button"
            onClick={() => set("guests", Math.max(1, filters.guests - 1))}
            disabled={filters.guests <= 1}
            aria-label="Fewer guests"
            className="grid size-10 place-items-center rounded-xl bg-white text-teal-600 transition hover:bg-sun-500 disabled:opacity-40 disabled:hover:bg-white"
          >
            <Minus className="size-4" />
          </button>
          <output aria-live="polite" className="font-display text-lg font-bold text-teal-600">
            {filters.guests} {filters.guests === 1 ? "guest" : "guests"}
          </output>
          <button
            type="button"
            onClick={() => set("guests", Math.min(12, filters.guests + 1))}
            disabled={filters.guests >= 12}
            aria-label="More guests"
            className="grid size-10 place-items-center rounded-xl bg-white text-teal-600 transition hover:bg-sun-500 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </Group>
    </div>
  );
}
