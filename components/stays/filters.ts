import {
  amenityLabels,
  priceBounds,
  stayAreas,
  stayTypes,
  type Amenity,
  type Stay,
  type StayArea,
  type StayType,
} from "@/data/accommodations";

export type SortKey = "recommended" | "price-asc" | "price-desc" | "rating";

export type StayFilters = {
  query: string;
  types: StayType[];
  area: StayArea | "all";
  price: [number, number];
  minRating: number;
  amenities: Amenity[];
  guests: number;
  sort: SortKey;
};

export const defaultFilters: StayFilters = {
  query: "",
  types: [],
  area: "all",
  price: [priceBounds.min, priceBounds.max],
  minRating: 0,
  amenities: [],
  guests: 1,
  sort: "recommended",
};

export const sortLabels: Record<SortKey, string> = {
  recommended: "Recommended",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Guest rating",
};

export const ratingOptions = [
  { value: 0, label: "Any" },
  { value: 3.5, label: "3.5+" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
];

export function applyFilters(f: StayFilters, stays: Stay[]): Stay[] {
  const q = f.query.trim().toLowerCase();
  const result = stays.filter((s) => {
    if (q) {
      const hay = `${s.name} ${s.description} ${stayAreas[s.area]} ${stayTypes[s.type]} ${s.amenities
        .map((a) => amenityLabels[a])
        .join(" ")}`.toLowerCase();
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    if (f.types.length && !f.types.includes(s.type)) return false;
    if (f.area !== "all" && s.area !== f.area) return false;
    if (s.priceFrom < f.price[0] || s.priceFrom > f.price[1]) return false;
    if (s.rating < f.minRating) return false;
    if (f.amenities.some((a) => !s.amenities.includes(a))) return false;
    if (s.maxGuests < f.guests) return false;
    return true;
  });

  const sorters: Record<SortKey, (a: Stay, b: Stay) => number> = {
    recommended: (a, b) => a.rank - b.rank,
    "price-asc": (a, b) => a.priceFrom - b.priceFrom,
    "price-desc": (a, b) => b.priceFrom - a.priceFrom,
    rating: (a, b) => b.rating - a.rating || a.rank - b.rank,
  };
  return [...result].sort(sorters[f.sort]);
}

export type ActiveChip = { key: string; label: string; clear: (f: StayFilters) => StayFilters };

export function activeChips(f: StayFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (f.query.trim()) chips.push({ key: "q", label: `“${f.query.trim()}”`, clear: (x) => ({ ...x, query: "" }) });
  f.types.forEach((t) =>
    chips.push({ key: `t-${t}`, label: stayTypes[t], clear: (x) => ({ ...x, types: x.types.filter((y) => y !== t) }) }),
  );
  if (f.area !== "all") chips.push({ key: "area", label: stayAreas[f.area], clear: (x) => ({ ...x, area: "all" }) });
  if (f.price[0] !== priceBounds.min || f.price[1] !== priceBounds.max)
    chips.push({
      key: "price",
      label: `$${f.price[0]}–$${f.price[1]}`,
      clear: (x) => ({ ...x, price: [priceBounds.min, priceBounds.max] }),
    });
  if (f.minRating) chips.push({ key: "rating", label: `${f.minRating.toFixed(1)}+ rating`, clear: (x) => ({ ...x, minRating: 0 }) });
  f.amenities.forEach((a) =>
    chips.push({
      key: `a-${a}`,
      label: amenityLabels[a],
      clear: (x) => ({ ...x, amenities: x.amenities.filter((y) => y !== a) }),
    }),
  );
  if (f.guests > 1) chips.push({ key: "guests", label: `Sleeps ${f.guests}+`, clear: (x) => ({ ...x, guests: 1 }) });
  return chips;
}
