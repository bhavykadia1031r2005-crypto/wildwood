import { categoryMeta, pointsOfInterest } from "./attractions";
import { stays, stayAreas, stayTypeSingular } from "./accommodations";
import { galleryItems } from "./gallery";
import type { SiteEvents } from "@/lib/events";

export type SearchKind = "Section" | "Place" | "Stay" | "Photo" | "Page";

export type SearchEntry = {
  id: string;
  kind: SearchKind;
  label: string;
  description: string;
  href: string;
  keywords: string;
  event?: { [K in keyof SiteEvents]: { name: K; detail: SiteEvents[K] } }[keyof SiteEvents];
};

const sections: SearchEntry[] = [
  {
    id: "s-itinerary",
    kind: "Section",
    label: "Build your itinerary",
    description: "Create a day-by-day trip plan",
    href: "/#itinerary",
    keywords: "plan trip itinerary schedule build customize days weekend",
  },
  {
    id: "s-explore",
    kind: "Section",
    label: "Explore by area",
    description: "Interactive map, 2D island guide and panoramas",
    href: "/#explore",
    keywords: "map areas towns north wildwood crest west 360 vr panorama",
  },
  {
    id: "s-stays",
    kind: "Section",
    label: "Places to stay",
    description: "Hotels, motels, resorts, rentals & campgrounds",
    href: "/#stays",
    keywords: "hotel motel resort rental campground accommodation lodging stay sleep",
  },
  {
    id: "s-gallery",
    kind: "Section",
    label: "Photo spots",
    description: "The most photogenic places on the island",
    href: "/#things-to-do",
    keywords: "photos gallery pictures instagram views things to do sunrise sunset",
  },
  {
    id: "p-guide",
    kind: "Page",
    label: "Pocket visitor guide",
    description: "Mobile-friendly essentials for your trip",
    href: "/guide",
    keywords: "guide visitor information travel parking getting here tips",
  },
  {
    id: "p-events",
    kind: "Page",
    label: "Events & festivals",
    description: "Signature seasonal happenings",
    href: "/events",
    keywords: "events festival fireworks kite concerts calendar",
  },
];

export const searchIndex: SearchEntry[] = [
  ...sections,
  ...pointsOfInterest.map<SearchEntry>((p) => ({
    id: `poi-${p.id}`,
    kind: "Place",
    label: p.name,
    description: categoryMeta[p.category].label,
    href: "/#explore",
    keywords: `${p.blurb} ${p.area} ${categoryMeta[p.category].label}`,
    event: { name: "ww:focus-place", detail: { id: p.id } },
  })),
  ...stays.map<SearchEntry>((s) => ({
    id: `stay-${s.id}`,
    kind: "Stay",
    label: s.name,
    description: `${stayTypeSingular[s.type]} · ${stayAreas[s.area]} · sample listing`,
    href: "/#stays",
    keywords: `${s.description} ${s.amenities.join(" ")} ${s.type}`,
    event: { name: "ww:search-stays", detail: { query: s.name } },
  })),
  ...galleryItems.map<SearchEntry>((g) => ({
    id: `photo-${g.id}`,
    kind: "Photo",
    label: g.title,
    description: g.location,
    href: "/#things-to-do",
    keywords: `${g.tip} ${g.category}`,
    event: { name: "ww:open-photo", detail: { id: g.id } },
  })),
];

export const suggestedSearches = [
  "Free beaches",
  "Ferris wheel",
  "Doo Wop",
  "Lighthouse",
  "Pet-friendly",
  "Sunrise",
  "Seafood",
  "Kayak",
];

export function searchSite(query: string, limit = 9) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return searchIndex
    .map((entry) => {
      const label = entry.label.toLowerCase();
      const hay = `${label} ${entry.description.toLowerCase()} ${entry.keywords.toLowerCase()}`;
      const matched = terms.filter((t) => hay.includes(t) || hay.includes(t.replace(/-/g, " "))).length;
      if (!matched || matched < Math.ceil(terms.length / 2)) return null;
      let score = matched * 2;
      if (label.startsWith(q)) score += 3;
      if (label.includes(q)) score += 4;
      terms.forEach((t) => label.includes(t) && (score += 2));
      // Real places and site sections outrank sample listings.
      if (entry.kind === "Place") score += 1.5;
      if (entry.kind === "Section" || entry.kind === "Page") score += 1;
      if (entry.kind === "Stay") score -= 3;
      return { entry, score };
    })
    .filter((x): x is { entry: SearchEntry; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}
