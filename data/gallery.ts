/** Photo spots (used by the pocket guide). Every image is a licensed Wildwoods photo from `data/media.ts`. */

export type GalleryCategory =
  | "boardwalk"
  | "sunrise"
  | "beachfront"
  | "rides"
  | "sunset-neon"
  | "local";

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "boardwalk", label: "Iconic Boardwalk" },
  { id: "sunrise", label: "Ocean Sunrises" },
  { id: "beachfront", label: "Beachfront Views" },
  { id: "rides", label: "Amusement Rides" },
  { id: "sunset-neon", label: "Sunset & Neon" },
  { id: "local", label: "Local Favorites" },
];

export type GalleryItem = {
  id: string;
  mediaId: string;
  title: string;
  location: string;
  category: GalleryCategory;
  tip: string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: "sign-kites",
    mediaId: "wildwoods-sign-kites",
    title: "The Wildwoods sign",
    location: "Boardwalk plaza, Wildwood",
    category: "boardwalk",
    tip: "Go early for an empty frame — or come during the kite festival for a sky full of colour.",
  },
  {
    id: "sunrise-northeast",
    mediaId: "sunrise-northeast",
    title: "Pastel daybreak",
    location: "Wildwood beach",
    category: "sunrise",
    tip: "The beach faces the Atlantic, so sunrise is the main event. Arrive 20 minutes before.",
  },
  {
    id: "carousel-night",
    mediaId: "carousel-ferris-wheel-night",
    title: "Carousel lights",
    location: "Morey's Piers",
    category: "rides",
    tip: "Blue hour, just after sunset, balances the neon with a little colour left in the sky.",
  },
  {
    id: "lifeguard-rainbow",
    mediaId: "beach-lifeguard-rainbow",
    title: "After the storm",
    location: "Wildwood beach",
    category: "beachfront",
    tip: "Summer showers clear fast. Keep your camera handy for rainbows over the surf.",
  },
  {
    id: "motel-doors",
    mediaId: "doo-wop-motel-doors",
    title: "Doo Wop doors",
    location: "Mid-century motel, the Wildwoods",
    category: "local",
    tip: "Shoot straight-on to make the colour grid pop. Always respect private property.",
  },
  {
    id: "macks-neon",
    mediaId: "macks-neon",
    title: "Slices after dark",
    location: "The Boardwalk",
    category: "sunset-neon",
    tip: "Neon signs read best when you expose for the letters, not the shadows.",
  },
  {
    id: "tramcar",
    mediaId: "boardwalk-tramcar",
    title: "Watch the tram car",
    location: "Boardwalk at the Convention Center",
    category: "boardwalk",
    tip: "Frame it head-on as it rolls toward you — then step aside for the ride by.",
  },
  {
    id: "sun-clouds",
    mediaId: "sun-through-clouds",
    title: "Golden hour",
    location: "Over the Atlantic",
    category: "sunrise",
    tip: "Cloudy mornings often deliver the most dramatic light.",
  },
  {
    id: "lighthouse",
    mediaId: "hereford-lighthouse",
    title: "Hereford Inlet Lighthouse",
    location: "North Wildwood",
    category: "local",
    tip: "The gardens are at their best in early summer.",
  },
  {
    id: "dunes",
    mediaId: "dunes-to-ocean",
    title: "Through the dunes",
    location: "North Wildwood",
    category: "beachfront",
    tip: "Stay on marked paths — dune grass protects the beach.",
  },
  {
    id: "ferris-night",
    mediaId: "ferris-wheel-night",
    title: "Wheel in motion",
    location: "Morey's Piers",
    category: "sunset-neon",
    tip: "Brace against a railing and try a half-second exposure for light trails.",
  },
  {
    id: "zoom-phloom",
    mediaId: "zoom-phloom-coaster",
    title: "Splash zone",
    location: "Morey's Piers",
    category: "rides",
    tip: "Afternoon sun lights the coaster track from the ocean side.",
  },
  {
    id: "lollipop",
    mediaId: "lollipop-motel-sign",
    title: "Lollipop sign",
    location: "The Wildwoods",
    category: "local",
    tip: "One of the island's most-photographed motel signs — look up against a clear blue sky.",
  },
  {
    id: "kites",
    mediaId: "kite-festival",
    title: "Kites over the sand",
    location: "Wildwood beach",
    category: "beachfront",
    tip: "Steady sea breezes make the wide beach a natural kite field.",
  },
  {
    id: "coca-cola",
    mediaId: "coca-cola-pier-stand",
    title: "Boardwalk classics",
    location: "The Boardwalk",
    category: "boardwalk",
    tip: "Late afternoon light warms the boardwalk planks and signage.",
  },
  {
    id: "sign-night",
    mediaId: "wildwoods-sign-night",
    title: "The sign at night",
    location: "Boardwalk plaza, Wildwood",
    category: "sunset-neon",
    tip: "The letters glow after dark — use the beach balls as foreground.",
  },
  {
    id: "piers-entrance",
    mediaId: "moreys-piers-entrance",
    title: "Pier arches",
    location: "Morey's Piers",
    category: "rides",
    tip: "Symmetry works here — centre the arch and wait for a gap in the crowd.",
  },
  {
    id: "sunrise-glow",
    mediaId: "sunrise-glow",
    title: "Before the sun",
    location: "Wildwood beach",
    category: "sunrise",
    tip: "Wet sand at low tide doubles the colour in the sky.",
  },
  {
    id: "beach-18th",
    mediaId: "north-wildwood-beach-18th",
    title: "Beach day, perfected",
    location: "North Wildwood",
    category: "beachfront",
    tip: "Shoot low from the sand to make the horizon feel endless.",
  },
  {
    id: "dusk-vintage",
    mediaId: "boardwalk-dusk-vintage",
    title: "Boardwalk at dusk, then",
    location: "The Boardwalk (archival)",
    category: "sunset-neon",
    tip: "Archival image from the Library of Congress — the boardwalk ritual hasn't changed much.",
  },
  {
    id: "crest-arch",
    mediaId: "wildwood-crest-arch",
    title: "Crest arch",
    location: "Wildwood Crest",
    category: "local",
    tip: "Frame the beach path through the arch with a bike in the scene.",
  },
  {
    id: "piers-aerial",
    mediaId: "piers-aerial",
    title: "Above the piers",
    location: "Wildwood",
    category: "rides",
    tip: "Ride the Giant Wheel for a bird's-eye view across the island to the bay.",
  },
  {
    id: "water-ice",
    mediaId: "water-ice-stand",
    title: "Water ice stop",
    location: "The Boardwalk",
    category: "boardwalk",
    tip: "Colourful storefronts look best in open shade.",
  },
  {
    id: "bayside",
    mediaId: "bayside-homes",
    title: "Bayside calm",
    location: "Back bay, the Wildwoods",
    category: "local",
    tip: "The bay goes glassy around sunset — the best time for reflections.",
  },
];
