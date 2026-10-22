/**
 * Signature, long-running happenings, described by month or season only.
 * Exact dates, venues and line-ups change every year — connect the official
 * events calendar feed here before launch.
 */

export type SignatureEvent = {
  id: string;
  title: string;
  /** Large label on the calendar tile, e.g. "May". */
  month: string;
  /** Band above the month on the calendar tile, e.g. "Spring". */
  band: string;
  /** Label in the calendar's month strip. */
  tab: string;
  season: string;
  location: string;
  text: string;
  imageId: string;
};

export const signatureEvents: SignatureEvent[] = [
  {
    id: "kite-festival",
    title: "Wildwoods International Kite Festival",
    month: "May",
    tab: "May",
    band: "Spring",
    season: "Late spring",
    location: "Wildwood beach",
    text: "Giant show kites, stunt teams and colourful windsocks fill the sky above the wide Wildwood beach.",
    imageId: "kite-festival",
  },
  {
    id: "marbles",
    title: "National Marbles Tournament",
    month: "Jun",
    tab: "Jun",
    band: "Summer",
    season: "Early summer",
    location: "Wildwood beachfront",
    text: "Young players from across the country compete in a tradition long hosted on the Wildwood beachfront.",
    imageId: "beach-near-mariners",
  },
  {
    id: "summer-nights",
    title: "Boardwalk parades & summer nights",
    month: "Jul–Aug",
    tab: "Jul–Aug",
    band: "Summer",
    season: "Summer",
    location: "The Boardwalk",
    text: "Evening parades, live music and fireworks bring families to the boardwalk throughout the season.",
    imageId: "family-fun-night",
  },
  {
    id: "irish-fall-festival",
    title: "Irish Fall Festival",
    month: "Sep",
    tab: "Sep",
    band: "Fall",
    season: "Early fall",
    location: "North Wildwood",
    text: "North Wildwood celebrates Irish music, dancing and food as the summer crowds give way to autumn.",
    imageId: "hereford-lighthouse",
  },
  {
    id: "convention-center",
    title: "Convention Center shows",
    month: "365",
    tab: "Year-round",
    band: "Year-round",
    season: "Year-round",
    location: "Wildwoods Convention Center",
    text: "The Wildwoods Convention Center on the boardwalk hosts expos, sports, concerts and festivals.",
    imageId: "wildwoods-sign-night",
  },
];
