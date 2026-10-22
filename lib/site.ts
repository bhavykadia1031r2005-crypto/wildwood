/**
 * Central site configuration.
 *
 * Anything that must come from the Wildwoods tourism team (official URLs,
 * handles, contact details, legal pages, the final logo file) lives here or in
 * environment variables. Empty values are treated as "not provided" and the UI
 * hides or clearly labels the related control instead of inventing data.
 */

// NEXT_PUBLIC_* values must be read with literal property access so Next can inline them
// into client bundles; `env()` only normalises whitespace/undefined.
const env = (value: string | undefined) => value?.trim() || "";

export const siteConfig = {
  name: "The Wildwoods",
  shortName: "Wildwoods",
  region: "New Jersey",
  tagline: "Make waves in the Wildwoods",
  description:
    "Plan your escape to The Wildwoods, New Jersey: five miles of free beaches, an iconic boardwalk, amusement piers, Doo Wop motels and endless summer memories.",

  /** Public origin of the deployed site, e.g. https://www.example.com (no trailing slash). */
  url: env(process.env.NEXT_PUBLIC_SITE_URL),

  /**
   * Destination encoded in the "Take Wildwoods With You" QR code.
   * Defaults to this site's /guide page (resolved against `url`, or the
   * browser origin when `url` is not configured).
   */
  qrTarget: env(process.env.NEXT_PUBLIC_QR_TARGET_URL),
  guidePath: "/guide",

  /**
   * Official logo artwork in /public/brand. `src` is the original (for light
   * backgrounds); `lightSrc` is a variant with the black outlines and lettering
   * turned white, for the teal navigation, footer and other dark surfaces.
   * `mark` is the square sun-and-wave "W" used where space is tight.
   */
  logo: {
    src: env(process.env.NEXT_PUBLIC_LOGO_SRC) || "/brand/wildwoods-logo.png",
    lightSrc: env(process.env.NEXT_PUBLIC_LOGO_LIGHT_SRC) || "/brand/wildwoods-logo-light.png",
    mark: "/brand/wildwoods-mark.png",
    width: 239,
    height: 100,
  },

  /** Official social profiles. Leave blank until confirmed; blank links render as disabled placeholders. */
  social: {
    instagram: env(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    facebook: env(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
    youtube: env(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
    tiktok: env(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK),
  },

  /** Visitor contact details. Only rendered when provided. */
  contact: {
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    phone: env(process.env.NEXT_PUBLIC_CONTACT_PHONE),
    address: env(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
  },

  /**
   * Legal pages. When an official URL is configured the footer links to it;
   * otherwise it links to the local placeholder page under /legal.
   */
  legal: {
    privacy: env(process.env.NEXT_PUBLIC_PRIVACY_URL),
    terms: env(process.env.NEXT_PUBLIC_TERMS_URL),
    accessibility: env(process.env.NEXT_PUBLIC_ACCESSIBILITY_URL),
  },

  /**
   * Map tiles. Defaults to OpenStreetMap's community tile server, which is fine
   * for previews but not for high-traffic production use (see the OSM tile
   * usage policy). Point these at a keyed provider (Mapbox, MapTiler, Stadia…)
   * before launch.
   */
  map: {
    tileUrl: env(process.env.NEXT_PUBLIC_MAP_TILE_URL) || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      env(process.env.NEXT_PUBLIC_MAP_ATTRIBUTION) ||
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  buildYear: Number(process.env.BUILD_YEAR) || 2026,
} as const;

export type NavItem = { label: string; href: string; section?: string };

export const primaryNav: NavItem[] = [
  { label: "Explore", href: "/#explore", section: "explore" },
  { label: "Things to Do", href: "/#things-to-do", section: "things-to-do" },
  { label: "Places to Stay", href: "/#stays", section: "stays" },
  { label: "Events", href: "/events" },
  { label: "Plan Your Trip", href: "/#itinerary", section: "itinerary" },
];

export const navCtas = {
  primary: { label: "Build Your Trip", href: "/#itinerary" },
  secondary: { label: "Explore Wildwoods", href: "/#explore" },
};

export function legalHref(key: keyof typeof siteConfig.legal) {
  return siteConfig.legal[key] || `/legal/${key}`;
}
