/**
 * Areas and points of interest for the "Find your kind of Wildwoods" section.
 *
 * Coordinates were looked up from OpenStreetMap (Nominatim / Overpass) and are
 * shown to visitors as approximate. Descriptions are curated sample copy —
 * confirm hours, seasons and details with each venue before publishing.
 */

export type AreaId = "north-wildwood" | "wildwood" | "wildwood-crest" | "west-wildwood";

export type PoiCategory =
  | "beaches"
  | "boardwalk"
  | "dining"
  | "shopping"
  | "family"
  | "stay"
  | "nature";

export type Area = {
  id: AreaId;
  /** Stretch of the illustrated island this area covers, as [tStart, tEnd]. */
  span: [number, number];
  name: string;
  nickname: string;
  summary: string;
  knownFor: string[];
  imageId: string;
  center: [number, number];
};

export type PointOfInterest = {
  id: string;
  name: string;
  category: PoiCategory;
  area: AreaId | "nearby";
  lat: number;
  lng: number;
  blurb: string;
  imageId?: string;
  /**
   * Position on the illustrated 2D map: [t, s] where t runs along the island
   * from the northern tip (0) to the southern tip (1) and s runs across it from
   * the bay (-1) to the ocean edge (+1). Values beyond ±1 sit in the water.
   */
  sketch: [number, number];
};

export const categoryMeta: Record<
  PoiCategory,
  { label: string; color: string; text: string }
> = {
  beaches: { label: "Beaches", color: "#FFD400", text: "#105665" },
  boardwalk: { label: "Boardwalk & Piers", color: "#F15A24", text: "#FFFFFF" },
  dining: { label: "Restaurants", color: "#F47B20", text: "#0B2A31" },
  shopping: { label: "Shopping", color: "#12B9D0", text: "#0B2A31" },
  family: { label: "Family Fun", color: "#087D9C", text: "#FFFFFF" },
  stay: { label: "Where to Stay", color: "#105665", text: "#FFFFFF" },
  nature: { label: "Parks & Nature", color: "#0C7C8D", text: "#FFFFFF" },
};

export const areas: Area[] = [
  {
    id: "north-wildwood",
    span: [0, 0.29],
    name: "North Wildwood",
    nickname: "Lighthouse end",
    summary:
      "The island's northern tip, where Hereford Inlet meets the ocean. Expect a laid-back beach scene, a seawall made for sunset strolls and a Victorian lighthouse wrapped in gardens.",
    knownFor: ["Hereford Inlet Lighthouse", "Seawall walk", "Surfside Pier", "Wide family beaches"],
    imageId: "hereford-lighthouse",
    center: [39.0005, -74.7965],
  },
  {
    id: "wildwood",
    span: [0.29, 0.555],
    name: "Wildwood",
    nickname: "Boardwalk central",
    summary:
      "The heart of the action: nearly two miles of boardwalk, three amusement piers, neon-lit snack stands and the tram car that has rolled past generations of summer visitors.",
    knownFor: ["Morey's Piers", "Boardwalk tram car", "Wildwoods sign", "Convention Center events"],
    imageId: "boardwalk-tramcar",
    center: [38.9845, -74.8135],
  },
  {
    id: "wildwood-crest",
    span: [0.555, 0.8],
    name: "Wildwood Crest",
    nickname: "Doo Wop & quiet sands",
    summary:
      "Family-friendly and a little quieter, with the Jersey Shore's richest collection of 1950s and '60s Doo Wop motels, a beachfront bike path and bayside sunsets over Sunset Lake.",
    knownFor: ["Doo Wop motels", "Beachfront bike path", "Sunset Lake", "Crest Pier"],
    imageId: "doo-wop-motel-doors",
    center: [38.973, -74.832],
  },
  {
    id: "west-wildwood",
    span: [0.3, 0.42],
    name: "West Wildwood",
    nickname: "Bayside calm",
    summary:
      "A small residential community on the back bay. Think docks, boats and marsh views, with the boardwalk just a short drive or bike ride away.",
    knownFor: ["Bay views", "Boating", "Vacation rentals", "Quiet streets"],
    imageId: "bayside-homes",
    center: [39.0005, -74.8245],
  },
];

export const pointsOfInterest: PointOfInterest[] = [
  // Beaches
  {
    id: "wildwoods-sign",
    name: "Wildwood Beach & the Wildwoods Sign",
    category: "beaches",
    area: "wildwood",
    lat: 38.98013,
    lng: -74.81991,
    blurb:
      "Strike a pose with the giant letters and beach balls, then cross some of the widest sand on the Jersey Shore. Wildwoods beaches are free to enjoy.",
    imageId: "wildwoods-sign-kites",
    sketch: [0.49, 0.72],
  },
  {
    id: "north-wildwood-beach",
    name: "North Wildwood Beach",
    category: "beaches",
    area: "north-wildwood",
    lat: 38.99489,
    lng: -74.79251,
    blurb:
      "A relaxed stretch of sand near the north end, with lifeguarded beaches in season and room to spread out.",
    imageId: "north-wildwood-beach-18th",
    sketch: [0.17, 0.74],
  },
  {
    id: "crest-beach",
    name: "Wildwood Crest Beach",
    category: "beaches",
    area: "wildwood-crest",
    lat: 38.97408,
    lng: -74.82293,
    blurb:
      "Quieter sands beside the beachfront bike path — a favourite for families, early walks and long afternoons.",
    imageId: "wildwood-crest-arch",
    sketch: [0.68, 0.74],
  },
  // Boardwalk & piers
  {
    id: "surfside-pier",
    name: "Morey's Surfside Pier",
    category: "boardwalk",
    area: "north-wildwood",
    lat: 38.98977,
    lng: -74.80326,
    blurb:
      "Rides and arcades at the northern end of the boardwalk, next door to a beachfront waterpark.",
    imageId: "moreys-kong",
    sketch: [0.26, 0.76],
  },
  {
    id: "mariners-landing",
    name: "Morey's Mariner's Landing",
    category: "boardwalk",
    area: "wildwood",
    lat: 38.98494,
    lng: -74.8086,
    blurb:
      "Home of the Giant Wheel and a classic boardwalk pier with coasters, games and a waterpark.",
    imageId: "ferris-wheel-night",
    sketch: [0.35, 0.76],
  },
  {
    id: "adventure-pier",
    name: "Morey's Adventure Pier",
    category: "boardwalk",
    area: "wildwood",
    lat: 38.98363,
    lng: -74.81348,
    blurb: "Thrill rides with ocean views — plan an evening visit when the pier lights come on.",
    imageId: "carousel-ferris-wheel-night",
    sketch: [0.41, 0.76],
  },
  {
    id: "boardwalk-tram",
    name: "The Boardwalk & Tram Car",
    category: "boardwalk",
    area: "wildwood",
    lat: 38.98729,
    lng: -74.80997,
    blurb:
      "Nearly two miles of planks linking Wildwood and North Wildwood. Hop on the tram car when your feet need a break.",
    imageId: "boardwalk-tramcar",
    sketch: [0.315, 0.44],
  },
  {
    id: "convention-center",
    name: "Wildwoods Convention Center",
    category: "boardwalk",
    area: "wildwood",
    lat: 38.98149,
    lng: -74.81693,
    blurb: "A beachfront venue on the boardwalk hosting shows, sports and festivals through the year.",
    imageId: "wildwoods-sign-night",
    sketch: [0.45, 0.44],
  },
  // Dining
  {
    id: "boardwalk-eats",
    name: "Boardwalk Food Stands",
    category: "dining",
    area: "wildwood",
    lat: 38.9858,
    lng: -74.8117,
    blurb:
      "Pizza by the slice, fresh-cut fries, saltwater taffy and water ice — boardwalk classics best eaten mid-stroll.",
    imageId: "coca-cola-pier-stand",
    sketch: [0.38, 0.44],
  },
  {
    id: "pacific-avenue",
    name: "Pacific Avenue Dining & Nightlife",
    category: "dining",
    area: "wildwood",
    lat: 38.98796,
    lng: -74.81587,
    blurb: "A few blocks inland: sit-down restaurants, bars and late-night spots in downtown Wildwood.",
    imageId: "pizza-neon",
    sketch: [0.37, -0.1],
  },
  {
    id: "ottens-harbor",
    name: "Otten's Harbor",
    category: "dining",
    area: "wildwood",
    lat: 38.99122,
    lng: -74.82822,
    blurb: "A working bayside harbor where fishing boats dock beside waterfront seafood restaurants.",
    imageId: "bayside-homes",
    sketch: [0.33, -0.86],
  },
  // Shopping
  {
    id: "boardwalk-shops",
    name: "Boardwalk Shops & Arcades",
    category: "shopping",
    area: "wildwood",
    lat: 38.9886,
    lng: -74.8085,
    blurb: "Souvenir shops, T-shirt stands, candy counters and arcades lining the boardwalk between the piers.",
    imageId: "water-ice-stand",
    sketch: [0.285, 0.44],
  },
  // Family
  {
    id: "doo-wop-experience",
    name: "Fox Park & The Doo Wop Experience",
    category: "family",
    area: "wildwood",
    lat: 38.98281,
    lng: -74.8179,
    blurb: "A park and museum celebrating the island's mid-century motels, with a garden of restored neon signs.",
    imageId: "lollipop-motel-sign",
    sketch: [0.47, 0.05],
  },
  {
    id: "crest-pier",
    name: "Crest Pier Recreation Center",
    category: "family",
    area: "wildwood-crest",
    lat: 38.97646,
    lng: -74.82732,
    blurb: "A beachfront community center in Wildwood Crest that hosts seasonal activities and events.",
    imageId: "wildwood-crest-arch",
    sketch: [0.6, 0.42],
  },
  // Where to stay (districts, not individual properties)
  {
    id: "doo-wop-motels",
    name: "Doo Wop Motel District",
    category: "stay",
    area: "wildwood-crest",
    lat: 38.97446,
    lng: -74.82972,
    blurb: "Stay in a piece of design history: mid-century motels with neon signs, pools and plenty of colour.",
    imageId: "doo-wop-motel-doors",
    sketch: [0.64, 0.12],
  },
  {
    id: "oceanfront-hotels",
    name: "Oceanfront Hotels, Wildwood",
    category: "stay",
    area: "wildwood",
    lat: 38.9808,
    lng: -74.8207,
    blurb: "Hotels and suites a short walk from the beach, the Wildwoods sign and the south end of the boardwalk.",
    imageId: "beachfront-promenade",
    sketch: [0.52, 0.18],
  },
  {
    id: "west-wildwood-rentals",
    name: "Bayside Rentals, West Wildwood",
    category: "stay",
    area: "west-wildwood",
    lat: 39.00234,
    lng: -74.82433,
    blurb: "Vacation homes on the quiet back bay — ideal for longer stays, boaters and bigger groups.",
    imageId: "bayside-homes",
    sketch: [0.36, -2.15],
  },
  // Nature
  {
    id: "hereford-lighthouse",
    name: "Hereford Inlet Lighthouse",
    category: "nature",
    area: "north-wildwood",
    lat: 39.00682,
    lng: -74.79153,
    blurb: "An 1874 Victorian lighthouse surrounded by seasonal gardens, steps from the inlet.",
    imageId: "hereford-lighthouse",
    sketch: [0.075, -0.32],
  },
  {
    id: "seawall",
    name: "North Wildwood Seawall",
    category: "nature",
    area: "north-wildwood",
    lat: 39.01336,
    lng: -74.79411,
    blurb: "A waterfront walkway along Hereford Inlet for watching boats, birds and the evening light.",
    imageId: "dunes-to-ocean",
    sketch: [0.025, 0.12],
  },
  {
    id: "sunset-lake",
    name: "Sunset Lake",
    category: "nature",
    area: "wildwood-crest",
    lat: 38.9749,
    lng: -74.84383,
    blurb: "A bayside lake on the Crest's western edge — true to its name at the end of the day.",
    imageId: "sun-through-clouds",
    sketch: [0.71, -0.72],
  },
  {
    id: "two-mile-beach",
    name: "Two Mile Beach (nearby)",
    category: "nature",
    area: "nearby",
    lat: 38.94713,
    lng: -74.85799,
    blurb:
      "Just south of the island in Lower Township: an undeveloped beach within the Cape May National Wildlife Refuge. Check seasonal access before visiting.",
    imageId: "dunes-to-ocean",
    sketch: [0.93, 0.45],
  },
];

export const islandBounds: [[number, number], [number, number]] = [
  [38.944, -74.862],
  [39.016, -74.786],
];
