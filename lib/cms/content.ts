/**
 * Editable homepage content (demo CMS).
 *
 * Defaults come straight from the `data/` files and current page copy, so the
 * site looks the same until someone edits it in /admin/content. Edits are kept
 * in the browser by `./store` — see that file for how they're saved.
 *
 * Headings support *asterisks* to mark the highlighted (script) words.
 */

import { stays as sampleStays, type Stay } from "@/data/accommodations";
import { pointsOfInterest, type PointOfInterest } from "@/data/attractions";
import { signatureEvents, type SignatureEvent } from "@/data/events";
import { moreToExplore, type ExploreCategory } from "@/data/moreToExplore";
import { navCtas, primaryNav } from "@/lib/site";

export const SECTION_IDS = ["hero", "itinerary", "explore", "things-to-do", "stays", "pocket-guide", "cta"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type LinkItem = { id: string; label: string; href: string };
/** A menu link; with `children` it opens a dropdown instead of navigating. */
export type NavLink = LinkItem & { children?: (LinkItem & { description?: string })[] };

export type SiteContent = {
  layout: { id: SectionId; visible: boolean }[];
  navigation: { links: NavLink[]; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string };
  hero: {
    line1: string;
    line2: string;
    intro: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    showCalendar: boolean;
  };
  events: SignatureEvent[];
  itinerary: { title: string; intro: string; buttonLabel: string; note: string };
  explore: { title: string; intro: string };
  places: PointOfInterest[];
  thingsToDo: { title: string; intro: string };
  categories: ExploreCategory[];
  staysCopy: { title: string; intro: string; notice: string };
  stays: Stay[];
  pocketGuide: { photos: string[]; eyebrow: string; title: string; text: string };
  cta: { title: string; text: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string };
  footer: { blurb: string; newsletterTitle: string; columns: { id: string; title: string; links: LinkItem[] }[] };
};

export type ContentKey = keyof SiteContent;

const link = (label: string, href: string): LinkItem => ({ id: slug(label), label, href });

export const defaultContent: SiteContent = {
  layout: SECTION_IDS.map((id) => ({ id, visible: true })),
  navigation: {
    links: primaryNav.map((n) => ({
      ...link(n.label, n.href),
      ...(n.children && { children: n.children.map((c) => ({ ...link(c.label, c.href), description: c.description })) }),
    })),
    primaryLabel: navCtas.primary.label,
    primaryHref: navCtas.primary.href,
    secondaryLabel: navCtas.secondary.label,
    secondaryHref: navCtas.secondary.href,
  },
  hero: {
    line1: "Make Waves",
    line2: "*in the* Wildwoods",
    intro: "Five miles of free beaches, an iconic boardwalk, and endless summer memories.",
    primaryLabel: "Discover Wildwoods",
    primaryHref: "/#explore",
    secondaryLabel: "Plan Your Escape",
    secondaryHref: "/#itinerary",
    showCalendar: true,
  },
  events: signatureEvents,
  itinerary: {
    title: "Your Wildwoods. *Your way.*",
    intro: "Build a beach escape that feels like you. Pick your style, trip length and interests, and we’ll map out your days.",
    buttonLabel: "Create My Itinerary",
    note: "Four quick picks · a day-by-day plan in seconds",
  },
  explore: {
    title: "Find your *kind of* Wildwoods.",
    intro: "Four shore towns share one barrier island. Browse the live map, wander the illustrated guide, or step into a scene.",
  },
  places: pointsOfInterest,
  thingsToDo: {
    title: "More to explore *in the Wildwoods.*",
    intro: "From neon-lit piers and free beaches to vineyard patios, local history and a round of golf — pick your kind of fun.",
  },
  categories: moreToExplore,
  staysCopy: {
    title: "Stay a little *longer.*",
    intro: "From neon-lit Doo Wop motels to bayside homes and shady campgrounds — find the right base for your days on the island.",
    notice: "Sample listings: names, prices and ratings are illustrative until a booking partner feed is connected.",
  },
  stays: sampleStays,
  pocketGuide: {
    photos: [
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
    ],
    eyebrow: "Take Wildwoods with you",
    title: "Your pocket *guide* to the island.",
    text: "Scan the code to open our mobile visitor guide — areas, beach essentials and the best photo spots, ready on your phone. No app, no sign-up.",
  },
  cta: {
    title: "Your next great story *starts here.*",
    text: "Salt in the air. Sand between your toes. A little more Wildwoods in your life.",
    primaryLabel: "Plan Your Trip",
    primaryHref: "/#itinerary",
    secondaryLabel: "Explore Things to Do",
    secondaryHref: "/#things-to-do",
  },
  footer: {
    blurb:
      "North Wildwood, Wildwood, Wildwood Crest and West Wildwood — one island of free beaches, boardwalk thrills and Doo Wop style on the Jersey Shore.",
    newsletterTitle: "Sunny news, straight to your inbox.",
    columns: [
      {
        id: "explore",
        title: "Explore",
        links: [
          link("Beaches", "/#explore"),
          link("Boardwalk", "/#things-to-do"),
          link("Attractions", "/#explore"),
          link("Events", "/events"),
          link("Dining", "/#explore"),
        ],
      },
      {
        id: "plan",
        title: "Plan Your Visit",
        links: [
          link("Places to Stay", "/#stays"),
          link("Customize Your Itinerary", "/#itinerary"),
          link("Explore the Map", "/#explore"),
          link("Travel Information", "/guide#getting-here"),
          link("Visitor Guide", "/guide"),
          link("Your Wishlist", "/wishlist"),
        ],
      },
      {
        id: "discover",
        title: "Discover",
        links: [
          link("Photo Gallery", "/#things-to-do"),
          link("Area Guides", "/#explore"),
          link("Family Activities", "/#itinerary"),
          link("Local Experiences", "/#things-to-do"),
          link("Business Info", "/business-info"),
          link("Convention Center", "/business-info#convention-center"),
        ],
      },
    ],
  },
};

/** Which content each homepage section renders (used for remounting and "edited" badges). */
export const sectionContentKeys: Record<SectionId, ContentKey[]> = {
  hero: ["hero", "events"],
  itinerary: ["itinerary"],
  explore: ["explore", "places"],
  "things-to-do": ["thingsToDo", "categories"],
  stays: ["staysCopy", "stays"],
  "pocket-guide": ["pocketGuide"],
  cta: ["cta"],
};

export function slug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "item"
  );
}

/** A slug that isn't already taken in `existing`. */
export function uniqueId(base: string, existing: { id: string }[]) {
  const root = slug(base);
  const taken = new Set(existing.map((e) => e.id));
  if (!taken.has(root)) return root;
  let i = 2;
  while (taken.has(`${root}-${i}`)) i++;
  return `${root}-${i}`;
}

/** Links must stay on this site or use http(s)/mailto/tel; anything else is rejected. */
export function isSafeHref(href: string) {
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href.trim());
}
