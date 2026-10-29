import { categoryMeta, pointsOfInterest } from "./attractions";
import { stays, stayAreas, stayTypeSingular } from "./accommodations";
import { moreToExplore } from "./moreToExplore";
import type { SiteEvents } from "@/lib/events";

export type SearchKind = "Section" | "Place" | "Stay" | "Category" | "Page";

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
    label: "More to explore",
    description: "Amusements, beaches, dining, nightlife, golf & more",
    href: "/#things-to-do",
    keywords: "things to do activities attractions amusements beaches boardwalk dining events outdoors nightlife spirits history golf",
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
    label: "Events calendar",
    description: "Festivals, holiday events, races and concerts by month",
    href: "/events",
    keywords: "events calendar festival fireworks kite concerts christmas halloween oktoberfest bonfire 5k marathon parade tree lighting",
  },
  {
    id: "p-business",
    kind: "Page",
    label: "Business info",
    description: "Marketing partner perks, listings and the press room",
    href: "/business-info#business-info",
    keywords: "business info partners promote listing tourism improvement district gwtida administration press room media advertising",
  },
  {
    id: "p-convention",
    kind: "Page",
    label: "Wildwoods Convention Center",
    description: "260,000 sq ft on the boardwalk for meetings, shows and events",
    href: "/business-info#convention-center",
    keywords: "convention center meeting conference trade show expo ballroom exhibit venue group housing accommodations events calendar",
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
  ...moreToExplore.map<SearchEntry>((c) => ({
    id: `category-${c.id}`,
    kind: "Category",
    label: c.label,
    description: "Things to do · opens wildwoodsnj.com",
    href: c.href,
    keywords: `things to do ${c.description} ${c.alt}`,
  })),
];

export const suggestedSearches = [
  "Free beaches",
  "Ferris wheel",
  "Doo Wop",
  "Lighthouse",
  "Pet-friendly",
  "Golf",
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
