import {
  CalendarDays,
  Compass,
  Images,
  LayoutTemplate,
  Map,
  Megaphone,
  PanelBottom,
  Route,
  BedDouble,
  type LucideIcon,
} from "lucide-react";
import type { ContentKey, SectionId } from "@/lib/cms/content";

export type ContentPage = {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Content this page edits ("Restore original" resets these). */
  keys: ContentKey[];
  /** Where to see it on the site. */
  preview: string;
  section?: SectionId;
};

export const CONTENT_PAGES: ContentPage[] = [
  {
    href: "/admin/content",
    label: "Homepage layout",
    title: "Homepage layout",
    description: "Choose which sections appear on the homepage and in what order.",
    icon: LayoutTemplate,
    keys: ["layout"],
    preview: "/",
  },
  {
    href: "/admin/content/hero",
    label: "Hero & events",
    title: "Hero & events calendar",
    description: "The headline, intro and buttons over the video, plus the flip calendar of signature events.",
    icon: CalendarDays,
    keys: ["hero", "events"],
    preview: "/#top",
    section: "hero",
  },
  {
    href: "/admin/content/trip-planner",
    label: "Trip planner",
    title: "Trip planner",
    description: "The “Your Wildwoods. Your way.” section that opens the itinerary builder.",
    icon: Route,
    keys: ["itinerary"],
    preview: "/#itinerary",
    section: "itinerary",
  },
  {
    href: "/admin/content/map",
    label: "Map & places",
    title: "Map & places",
    description: "The explore-by-area heading and every place pinned on the map and 2D guide.",
    icon: Map,
    keys: ["explore", "places"],
    preview: "/#explore",
    section: "explore",
  },
  {
    href: "/admin/content/things-to-do",
    label: "Things to do",
    title: "More to explore",
    description: "The things-to-do category cards: image, title, description and link.",
    icon: Compass,
    keys: ["thingsToDo", "categories"],
    preview: "/#things-to-do",
    section: "things-to-do",
  },
  {
    href: "/admin/content/stays",
    label: "Places to stay",
    title: "Places to stay",
    description: "The stays heading and the sample listings visitors can filter.",
    icon: BedDouble,
    keys: ["staysCopy", "stays"],
    preview: "/#stays",
    section: "stays",
  },
  {
    href: "/admin/content/photos",
    label: "Photo strip & QR",
    title: "Photo strip & pocket guide",
    description: "The scrolling photo strip and the “Take Wildwoods with you” QR card.",
    icon: Images,
    keys: ["pocketGuide"],
    preview: "/#pocket-guide",
    section: "pocket-guide",
  },
  {
    href: "/admin/content/banner",
    label: "Closing banner",
    title: "Closing banner",
    description: "The big sunset call to action above the footer.",
    icon: Megaphone,
    keys: ["cta"],
    preview: "/#plan",
    section: "cta",
  },
  {
    href: "/admin/content/navigation",
    label: "Navigation & footer",
    title: "Navigation & footer",
    description: "Menu links and buttons in the floating nav, and the footer text and link columns.",
    icon: PanelBottom,
    keys: ["navigation", "footer"],
    preview: "/",
  },
];

export const pageForSection = (id: SectionId) => CONTENT_PAGES.find((p) => p.section === id)!;
