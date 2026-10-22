/**
 * SAMPLE accommodation listings.
 *
 * Property names, nightly prices, ratings and capacities are illustrative
 * placeholders for layout and filtering — they are not real businesses, live
 * availability or verified reviews. Replace `stays` with data from a booking
 * or partner feed; the UI only depends on the `Stay` shape below.
 */

import type { AreaId } from "./attractions";

export type StayType = "hotel" | "motel" | "resort" | "rental" | "campground";
export type Amenity = "pool" | "beach-access" | "parking" | "wifi" | "pet-friendly";
export type StayArea = AreaId | "mainland";

export type Stay = {
  id: string;
  name: string;
  type: StayType;
  area: StayArea;
  /** Sample nightly price in USD. */
  priceFrom: number;
  /** Sample guest rating out of 5. */
  rating: number;
  maxGuests: number;
  amenities: Amenity[];
  imageId: string;
  description: string;
  /** Lower is shown first under "Recommended". */
  rank: number;
};

export const isSampleData = true;

export const stayTypes: Record<StayType, string> = {
  hotel: "Hotels",
  motel: "Motels",
  resort: "Resorts",
  rental: "Vacation Rentals",
  campground: "Campgrounds",
};

export const stayTypeSingular: Record<StayType, string> = {
  hotel: "Hotel",
  motel: "Motel",
  resort: "Resort",
  rental: "Vacation Rental",
  campground: "Campground",
};

export const stayAreas: Record<StayArea, string> = {
  "north-wildwood": "North Wildwood",
  wildwood: "Wildwood",
  "wildwood-crest": "Wildwood Crest",
  "west-wildwood": "West Wildwood",
  mainland: "Nearby mainland",
};

export const amenityLabels: Record<Amenity, string> = {
  pool: "Pool",
  "beach-access": "Beach Access",
  parking: "Parking",
  wifi: "Wi-Fi",
  "pet-friendly": "Pet-Friendly",
};

export const stays: Stay[] = [
  {
    id: "tidewater-doo-wop-inn",
    name: "Tidewater Doo Wop Inn",
    type: "motel",
    area: "wildwood-crest",
    priceFrom: 149,
    rating: 4.6,
    maxGuests: 4,
    amenities: ["pool", "parking", "wifi"],
    imageId: "doo-wop-motel-doors",
    description:
      "Candy-coloured doors, a heated pool and a neon sign straight out of 1959 — two blocks from the Crest's quieter beaches.",
    rank: 1,
  },
  {
    id: "saltbox-suites",
    name: "Saltbox Suites on the Boardwalk",
    type: "hotel",
    area: "wildwood",
    priceFrom: 239,
    rating: 4.5,
    maxGuests: 5,
    amenities: ["beach-access", "parking", "wifi", "pool"],
    imageId: "boardwalk-tramcar",
    description:
      "Oceanfront suites with kitchenettes and balconies over the boardwalk, steps from the tram car and the piers.",
    rank: 2,
  },
  {
    id: "harborlight-bay-house",
    name: "Harborlight Bay House",
    type: "rental",
    area: "west-wildwood",
    priceFrom: 410,
    rating: 4.8,
    maxGuests: 10,
    amenities: ["parking", "wifi", "pet-friendly"],
    imageId: "bayside-homes",
    description:
      "A four-bedroom bayside home with a private dock, outdoor shower and sunset deck — room for the whole crew.",
    rank: 3,
  },
  {
    id: "sunburst-motor-lodge",
    name: "Sunburst Motor Lodge",
    type: "motel",
    area: "wildwood",
    priceFrom: 129,
    rating: 4.2,
    maxGuests: 4,
    amenities: ["pool", "parking", "wifi"],
    imageId: "lollipop-motel-sign",
    description:
      "A retro motor lodge with a kidney-shaped pool and easy walks to the beach, Fox Park and the Wildwoods sign.",
    rank: 4,
  },
  {
    id: "lighthouse-lane-cottage",
    name: "Lighthouse Lane Cottage",
    type: "rental",
    area: "north-wildwood",
    priceFrom: 295,
    rating: 4.7,
    maxGuests: 6,
    amenities: ["parking", "wifi", "pet-friendly"],
    imageId: "hereford-lighthouse",
    description:
      "A shingled cottage near Hereford Inlet with bikes, beach chairs and a porch made for morning coffee.",
    rank: 5,
  },
  {
    id: "neon-palms-resort",
    name: "Neon Palms Resort",
    type: "resort",
    area: "wildwood",
    priceFrom: 329,
    rating: 4.4,
    maxGuests: 6,
    amenities: ["pool", "beach-access", "parking", "wifi"],
    imageId: "piers-aerial",
    description:
      "Two pools, a lazy river and pier views. Built for families who want the action right outside the door.",
    rank: 6,
  },
  {
    id: "seaglass-family-suites",
    name: "Seaglass Family Suites",
    type: "hotel",
    area: "north-wildwood",
    priceFrom: 209,
    rating: 4.3,
    maxGuests: 6,
    amenities: ["pool", "beach-access", "parking", "wifi"],
    imageId: "north-wildwood-beach-18th",
    description:
      "Two-room suites with bunk nooks, a splash pool and beach carts to borrow. A short stroll to Surfside Pier.",
    rank: 7,
  },
  {
    id: "ferris-view-hotel",
    name: "Ferris View Hotel",
    type: "hotel",
    area: "wildwood",
    priceFrom: 189,
    rating: 4.1,
    maxGuests: 4,
    amenities: ["parking", "wifi"],
    imageId: "ferris-wheel-night",
    description: "Compact rooms with big views of the Giant Wheel after dark. Ideal for couples and boardwalk night owls.",
    rank: 8,
  },
  {
    id: "crest-sands-resort",
    name: "Crest Sands Beach Resort",
    type: "resort",
    area: "wildwood-crest",
    priceFrom: 279,
    rating: 4.6,
    maxGuests: 5,
    amenities: ["pool", "beach-access", "parking", "wifi"],
    imageId: "wildwood-crest-arch",
    description:
      "Beachfront rooms beside the Crest bike path, with a poolside café and complimentary beach chairs.",
    rank: 9,
  },
  {
    id: "sunset-lake-bungalow",
    name: "Sunset Lake Bungalow",
    type: "rental",
    area: "wildwood-crest",
    priceFrom: 265,
    rating: 4.5,
    maxGuests: 5,
    amenities: ["parking", "wifi", "pet-friendly"],
    imageId: "sun-through-clouds",
    description: "A breezy two-bedroom bungalow a short walk from Sunset Lake — kayaks and a fire pit included.",
    rank: 10,
  },
  {
    id: "inlet-breeze-motel",
    name: "Inlet Breeze Motel",
    type: "motel",
    area: "north-wildwood",
    priceFrom: 119,
    rating: 3.9,
    maxGuests: 3,
    amenities: ["parking", "wifi", "pet-friendly"],
    imageId: "north-wildwood-beach-tall",
    description: "Simple, spotless rooms near the seawall walk and North Wildwood's restaurant blocks.",
    rank: 11,
  },
  {
    id: "boardwalk-bunkhouse",
    name: "Boardwalk Bunkhouse Condo",
    type: "rental",
    area: "wildwood",
    priceFrom: 335,
    rating: 4.4,
    maxGuests: 8,
    amenities: ["beach-access", "parking", "wifi", "pool"],
    imageId: "beachfront-promenade",
    description: "A three-bedroom condo with a shared pool and a private path to the sand. Great for friend groups.",
    rank: 12,
  },
  {
    id: "dune-grass-campground",
    name: "Dune Grass Campground",
    type: "campground",
    area: "mainland",
    priceFrom: 79,
    rating: 4.3,
    maxGuests: 6,
    amenities: ["pool", "parking", "wifi", "pet-friendly"],
    imageId: "dunes-to-ocean",
    description: "Wooded RV and tent sites with a pool and camp store, around a 15-minute drive from the beaches.",
    rank: 13,
  },
  {
    id: "pinewood-shore-camp",
    name: "Pinewood Shore Camp & Cabins",
    type: "campground",
    area: "mainland",
    priceFrom: 95,
    rating: 4.0,
    maxGuests: 4,
    amenities: ["parking", "pet-friendly"],
    imageId: "sunrise-glow",
    description: "Rustic cabins and shady sites under the pines — an easy-going base for budget beach days.",
    rank: 14,
  },
];

export const priceBounds = {
  min: Math.floor(Math.min(...stays.map((s) => s.priceFrom)) / 10) * 10,
  max: Math.ceil(Math.max(...stays.map((s) => s.priceFrom)) / 10) * 10,
};
