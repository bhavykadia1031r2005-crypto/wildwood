/**
 * Business info and Convention Center content, taken from the official
 * Wildwoods tourism site (wildwoodsnj.com/business-info/ and
 * /convention-center/, read Oct 29, 2026). Photos were copied from those pages
 * into /public/images/business. Detail links open the official pages.
 */

const SITE = "https://wildwoodsnj.com";

export type ResourceCard = { id: string; title: string; tagline: string; href: string; image: string; alt: string };

export const businessInfo = {
  eyebrow: "In the Wildwoods",
  title: "Supporting *local business.*",
  intro:
    "All businesses in the Wildwoods Tourism Improvement District are considered marketing partners and as such are afforded many perks including a free listing on the WildwoodsNJ.com website with a direct link to each business, a comprehensive advertising campaign to attract visitors to our destination, and extensive Public Relations branding.",
  /** The three perks named in the intro. */
  perks: [
    { id: "listing", title: "A free listing", text: "on the WildwoodsNJ.com website, with a direct link to each business." },
    { id: "advertising", title: "Comprehensive advertising", text: "a campaign to attract visitors to our destination." },
    { id: "pr", title: "Public relations", text: "extensive PR branding for the Wildwoods." },
  ],
  cards: [
    {
      id: "promote",
      title: "Promote your Business",
      tagline: "Get your business listed",
      href: `${SITE}/business-info/promote-your-business/`,
      image: "/images/business/promote-your-business.jpg",
      alt: "Shoppers and cyclists passing colourful boardwalk storefronts, including a frozen yogurt shop",
    },
    {
      id: "administration",
      title: "Administration",
      tagline: "Learn about GWTIDA",
      href: `${SITE}/business-info/administration/`,
      image: "/images/business/administration.jpg",
      alt: "The Wildwoods Convention Center lit up at dusk, with its arched Wildwoods sign",
    },
    {
      id: "do-business",
      title: "Do Business With Us",
      tagline: "Resources for local businesses",
      href: `${SITE}/business-info/do-business-with-us/`,
      image: "/images/business/do-business-with-us.jpg",
      alt: "Hands sketching business icons and charts in a notebook",
    },
    {
      id: "press",
      title: "Press Room",
      tagline: "Get more information",
      href: `${SITE}/business-info/press-room/`,
      image: "/images/business/press-room.jpg",
      alt: "A word cloud of media and web terms such as social, data, news and share",
    },
  ] satisfies ResourceCard[],
};

export const conventionCenter = {
  eyebrow: "Welcome to the Wildwoods",
  title: "Wildwoods *Convention Center.*",
  paragraphs: [
    "The Wildwoods Convention Center is a modern, multipurpose facility equipped with exhibit, ballroom, meeting and pre-function space.",
    "Located on the world famous Wildwoods Boardwalk directly overlooking the beach and ocean, this unique, state-of-the-art, 260,000-square-foot facility offers one of the most spacious, flexible, innovative and inviting venues available for conventions, trade shows, meetings, concerts and exhibits. Located within a day's drive of one-third of America's population, it can accommodate groups as small as 100 or as large as 10,000.",
  ],
  image: "/images/business/plan-a-meeting.jpg",
  imageAlt: "The Wildwoods Convention Center entrance at night, with its glowing tower and arched Wildwoods sign",
  stats: [
    { value: "260,000", unit: "sq ft", label: "Multipurpose facility" },
    { value: "100–10,000", unit: "guests", label: "Groups of every size" },
    { value: "⅓", unit: "of the U.S.", label: "Within a day's drive" },
    { value: "Oceanfront", unit: "", label: "On the Wildwoods Boardwalk" },
  ],
  spaces: ["Exhibit", "Ballroom", "Meeting", "Pre-function"],
  uses: ["Conventions", "Trade shows", "Meetings", "Concerts", "Exhibits"],
  cards: [
    {
      id: "plan",
      title: "Plan A Meeting Or Event",
      tagline: "Our business is your business",
      href: `${SITE}/convention-center/plan-a-meeting-or-event/`,
      image: "/images/business/administration.jpg",
      alt: "The Wildwoods Convention Center and its plaza at dusk",
    },
    {
      id: "attend",
      title: "Attend A Meeting Or Event",
      tagline: "Our business is your business",
      href: `${SITE}/convention-center/attend-meeting-or-event/`,
      image: "/images/business/attend-an-event.jpg",
      alt: "A packed exhibit hall seated for a conference session in front of a stage",
    },
    {
      id: "resources",
      title: "Event Resources",
      tagline: "What you need",
      href: `${SITE}/convention-center/resources-2/`,
      image: "/images/business/event-resources.jpg",
      alt: "A ballroom filled with round banquet tables during an event",
    },
    {
      id: "about",
      title: "Get To Know Us",
      tagline: "About the convention center",
      href: `${SITE}/convention-center/get-to-know-us/`,
      image: "/images/business/get-to-know-us.jpg",
      alt: "A Wildwoods Convention Center trade-show booth with brochures and a 'New Jersey Beachfront Facility' banner",
    },
  ] satisfies ResourceCard[],
  accommodations: {
    title: "Convention *accommodations.*",
    eyebrow: "Where to stay in the Wildwoods",
    paragraphs: [
      "The Wildwoods Convention Center operates a Housing Bureau with highly trained, in-house staff to work with you to effectively and efficiently reserve rooms for your attendees.",
      "We provide a range of services, audits and reports that provide for all of your housing needs. The Convention Center Housing Department uses MeetingMax software to offer online reservation services to groups utilizing the facility.",
    ],
    href: `${SITE}/convention-center/attend-meeting-or-event/accommodations/`,
    image: "/images/business/accommodations.jpg",
    alt: "Sun loungers and blue umbrellas around a hotel pool beside a beachfront resort",
  },
  /** "Who we work with — our clients love us" (names as listed; logos not reproduced). */
  clients: [
    "WWE",
    "YFC",
    "American Legion",
    "Atlantic",
    "Beast of the East",
    "BPOE",
    "Cape Classic",
    "Cape May County Chamber",
    "DeMolay",
    "Disabled American Veterans",
    "Feis At The Beach",
    "FMBA",
    "Harlem Globetrotters",
    "Hotel and Motel Association",
    "IAIGC",
    "Ignite Conference",
    "KOC",
    "LETRCNJ",
    "NAGA",
    "NJ Elks",
    "Polar Plunge",
    "Rotary",
    "Seashore",
    "Showdown",
    "Sophisticated Productions",
    "Special Olympics",
    "Tall Cedars",
    "Tattoo",
    "Tournament of Bands",
    "United Methodists",
    "VFW",
    "WW COC",
  ],
  events: {
    intro:
      "Catch all the fun and exciting events happening in the Wildwoods every day. From classic cars to rock stars we offer something for visitors of all ages and tastes. What's more, most of our events are entirely free!",
    calendarHref: `${SITE}/convention-center/attend-meeting-or-event/convention-center-calendar/`,
    /** As listed on the convention center page on Oct 29, 2026. */
    asOf: "Oct 29, 2026",
    list: [
      { date: "2026-11-01", title: "Spirit Brands American Rec & School Cheer Championships", cancelled: true, href: `${SITE}/?post_type=event&p=1907155` },
      { date: "2026-11-13", title: "Coach Bingo", cancelled: false, href: `${SITE}/?post_type=event&p=1906486` },
      { date: "2026-11-15", title: "Spirit Brands Island Championships & Dance Nationals", cancelled: false, href: `${SITE}/?post_type=event&p=1907157` },
      { date: "2026-11-22", title: "Spirit Brands Showcase Cheerleading Competition", cancelled: false, href: `${SITE}/?post_type=event&p=1907310` },
    ],
  },
  /** Phone number shown on wildwoodsnj.com ("Give Us A Ring"). */
  phone: "800-992-9732",
};
