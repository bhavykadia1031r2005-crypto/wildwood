/**
 * "More to explore" categories, mirroring the "So Much To Do" section of the
 * official Wildwoods tourism site (wildwoodsnj.com). Images were copied from
 * that site into /public/images/explore; links open its category pages.
 * When these pages move onto this site, point `href` at the local routes.
 */

export type ExploreCategory = {
  id: string;
  label: string;
  /** One or two sentences, based on the category page's own summary. */
  description: string;
  href: string;
  image: string;
  alt: string;
};

const BASE = "https://wildwoodsnj.com/so-much-to-do";

export const moreToExplore: ExploreCategory[] = [
  {
    id: "amusements",
    label: "Amusements",
    description:
      "Roller coasters, thrill rides and kiddie rides across the amusement piers, plus arcades, carnival games and boardwalk eats.",
    href: `${BASE}/amusements/`,
    image: "/images/explore/amusements.jpg",
    alt: "A swing ride spinning in a blur of light above an amusement pier, with a Ferris wheel behind",
  },
  {
    id: "beaches",
    label: "Beaches",
    description:
      "Free beaches with no tags required and room for surfing, boogie boarding, volleyball or a lazy day in the sun, including dog-friendly spots.",
    href: `${BASE}/beaches/`,
    image: "/images/explore/beaches.jpg",
    alt: "A white Wildwood lifeguard boat resting on the wide, wet sand",
  },
  {
    id: "boardwalk",
    label: "Boardwalk",
    description:
      "38 blocks of rides, games, shops and classic snacks, with the tram car rolling by when your feet need a break.",
    href: `${BASE}/boardwalk/`,
    image: "/images/explore/boardwalk.jpg",
    alt: "The yellow Sightseer tram car rolling along the boardwalk past shops",
  },
  {
    id: "dining",
    label: "Dining",
    description:
      "From pancakes at sunrise to fresh-caught seafood and boardwalk classics, with vegetarian and vegan options too.",
    href: `${BASE}/wildwood-dining/`,
    image: "/images/explore/dining.jpg",
    alt: "Plated steak and seafood with cocktails on a white restaurant tablecloth",
  },
  {
    id: "festivals-events",
    label: "Festivals & Events",
    description:
      "Fireworks, parades and festivals through every season, from summer nights on the boardwalk to the holiday Christmas parade.",
    href: `${BASE}/festivals-and-events/`,
    image: "/images/explore/festivals-events.jpg",
    alt: "A basketball showman spinning a ball on a young fan's finger in a packed arena",
  },
  {
    id: "outdoor-activities",
    label: "Outdoor Activities",
    description:
      "From beach to bay: stroll the Sea Wall, step back in time at nearby Cold Spring Village or paddle out at sunset.",
    href: `${BASE}/outdoor-activities/`,
    image: "/images/explore/outdoor-activities.jpg",
    alt: "A kayaker paddling across calm water toward the setting sun",
  },
  {
    id: "nightlife",
    label: "Nightlife",
    description:
      "Lively bars steps from the beach and boardwalk to round off a sunny day with a cold drink and good company.",
    href: `${BASE}/nightlife/`,
    image: "/images/explore/nightlife.jpg",
    alt: "A smiling couple holding cocktails in a lively, blue-lit bar",
  },
  {
    id: "local-spirits",
    label: "Local Spirits",
    description:
      "Breweries, wineries and distilleries in and around the Wildwoods. Taste the story behind each crafted pour.",
    href: `${BASE}/local-spirits/`,
    image: "/images/explore/local-spirits.jpg",
    alt: "Friends sharing drinks on a vineyard patio under a green umbrella",
  },
  {
    id: "historical-cultural",
    label: "History & Culture",
    description:
      "Doo Wop motels, a Victorian lighthouse and vintage boardwalk lore. The island's story is everywhere you look.",
    href: `${BASE}/historical-cultural-attractions/`,
    image: "/images/explore/historical-cultural.jpg",
    alt: "A vintage black-and-white photo of performers posing above a Wildwood By The Sea sign",
  },
  {
    id: "golf",
    label: "Golf",
    description:
      "Championship courses near the shore and mini golf the whole family will love, all with an ocean breeze.",
    href: `${BASE}/golf/`,
    image: "/images/explore/golf.jpg",
    alt: "A golf driver lined up behind a Wildwoods-branded ball on a tee",
  },
];
