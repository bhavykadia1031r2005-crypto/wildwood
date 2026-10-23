/**
 * DEMO analytics dataset for the admin dashboard UI.
 *
 * Everything here is generated in the browser from a fixed seed: visitors,
 * sessions, service views and inquiries are fictional and exist only to show
 * how the dashboard behaves. Replace `getDemoDataset()` with real queries
 * (e.g. Prisma aggregates behind authenticated API routes) when analytics
 * collection is connected.
 */

import { seededRandom } from "@/lib/utils";

export type SourceId = "organic" | "direct" | "paid" | "social" | "referral" | "email";
export type ServiceId = "stays" | "events" | "amusements" | "beaches" | "dining" | "groups";
export type LeadStatus = "pending" | "contacted" | "qualified" | "converted" | "lost";

export const SOURCES: { id: SourceId; label: string }[] = [
  { id: "organic", label: "Organic search" },
  { id: "direct", label: "Direct" },
  { id: "paid", label: "Paid advertising" },
  { id: "social", label: "Social media" },
  { id: "referral", label: "Referral" },
  { id: "email", label: "Email campaigns" },
];

export const SERVICES: { id: ServiceId; label: string; path: string }[] = [
  { id: "stays", label: "Places to Stay", path: "/stays" },
  { id: "events", label: "Festivals & Events", path: "/events" },
  { id: "amusements", label: "Amusements & Piers", path: "/amusements" },
  { id: "beaches", label: "Beaches & Outdoors", path: "/beaches" },
  { id: "dining", label: "Dining & Nightlife", path: "/dining" },
  { id: "groups", label: "Groups & Conventions", path: "/groups" },
];

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "converted", label: "Converted" },
  { id: "lost", label: "Lost" },
];

export const REPS = ["Avery Brooks", "Jordan Lee", "Sam Patel", "Riley Chen"];

/** Demo history: Sep 22, 2025 → Oct 21, 2026 (inclusive). Day 0 is the first day. */
export const DEMO_START_MS = Date.UTC(2025, 8, 22);
export const DEMO_DAYS = 395;
export const DEMO_END_DAY = DEMO_DAYS - 1;
const DAY_MS = 86_400_000;

export const dayToDate = (day: number) => new Date(DEMO_START_MS + day * DAY_MS);
export const dateToDay = (d: Date) => Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - DEMO_START_MS) / DAY_MS);

export type Visitor = {
  id: string;
  firstDay: number;
  consent: boolean;
  /** Set once the visitor identifies themselves by submitting an inquiry. */
  customerId?: string;
  sessionIds: string[];
};

export type Session = {
  id: string;
  visitorId: string;
  day: number;
  /** 0 for the visitor's first recorded visit. */
  index: number;
  source: SourceId;
  services: ServiceId[];
  pageViews: number;
  formStarted: boolean;
  inquiryId?: string;
};

export type Inquiry = {
  id: string;
  visitorId: string;
  customerId: string;
  sessionId: string;
  day: number;
  service: ServiceId;
  status: LeadStatus;
  qualified: boolean;
  rep: string;
  /** Hours until first response; undefined while pending. */
  responseHours?: number;
  /** Days after submission when the status last changed. */
  statusAfterDays: number;
  message: string;
};

export type Customer = {
  id: string;
  visitorId: string;
  name: string;
  email: string;
  company?: string;
  phoneOnFile: boolean;
  note: string;
};

export type DemoDataset = {
  visitors: Visitor[];
  sessions: Session[];
  inquiries: Inquiry[];
  customers: Customer[];
  visitorById: Map<string, Visitor>;
  sessionById: Map<string, Session>;
  customerById: Map<string, Customer>;
  sessionsByDay: Session[][];
};

const FIRST = ["Maya", "Ethan", "Olivia", "Noah", "Ava", "Liam", "Sofia", "Lucas", "Isla", "Mason", "Zoe", "Elijah", "Nora", "Caleb", "Leah", "Owen", "Grace", "Aiden", "Hannah", "Wyatt", "Ella", "Julian", "Aria", "Henry", "Layla", "Miles", "Ruby", "Theo", "Stella", "Jonah", "Priya", "Marcus", "Elena", "Tariq", "Mei", "Diego", "Amara", "Kenji", "Fatima", "Samir"];
const LAST = ["Carter", "Nguyen", "Rossi", "Murphy", "Patel", "Kowalski", "Bennett", "Okafor", "Sullivan", "Reyes", "Fischer", "Coleman", "Haddad", "Lindqvist", "Brennan", "Moreau", "Santos", "Adeyemi", "Walsh", "Tanaka", "Hughes", "Delgado", "Novak", "Ibrahim", "Foster", "Castillo", "Park", "Shaw", "Quinn", "Romero"];
const COMPANIES = ["Harbor Swim Club", "Shoreline Dance Academy", "Cape Youth Soccer", "Delaware Valley Seniors", "Bayside Marching Band", "Coastal Realty Group", "Pinecrest Church Group", "Atlantic Robotics Team", "Tri-State Car Club", "Lakeside Reunion Committee"];
const MESSAGES: Record<ServiceId, string[]> = {
  stays: ["Looking for a family-friendly motel near the beach for a week in July.", "Do you have recommendations for pet-friendly rentals in the Crest?", "Need two rooms close to the boardwalk for a long weekend."],
  events: ["When are this year's fireworks nights scheduled?", "Interested in vendor space at a summer festival.", "Planning a trip around the kite festival — what dates should we target?"],
  amusements: ["Do the piers offer group ticket discounts?", "Which rides are open in early May?", "Planning a school trip to the piers — who should we contact?"],
  beaches: ["Which beaches allow dogs in September?", "Are there surf lessons for beginners?", "Where can we rent beach wheelchairs?"],
  dining: ["Can you recommend seafood restaurants for a rehearsal dinner?", "Looking for late-night dining options near Pacific Ave.", "Are there gluten-free friendly spots on the boardwalk?"],
  groups: ["We're planning a 60-person team trip and need lodging plus activities.", "Interested in the Convention Center for a two-day regional meeting.", "Organizing a youth tournament — what venues are available?"],
};


function pick<T>(r: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = r() * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
}

const SOURCE_IDS = SOURCES.map((s) => s.id);
const FIRST_TOUCH_W = [40, 17, 12, 16, 11, 4];
const RETURN_TOUCH_W = [24, 40, 5, 10, 5, 16];
const SERVICE_IDS = SERVICES.map((s) => s.id);
const SERVICE_W = [30, 22, 18, 14, 10, 6];
const INQUIRY_AFFINITY: Record<ServiceId, number> = { stays: 1.3, events: 1.15, amusements: 0.6, beaches: 0.45, dining: 0.5, groups: 2.6 };

type Draft = {
  visitor: Visitor;
  primary: ServiceId;
  visits: { day: number; source: SourceId; services: ServiceId[]; inquiry?: ServiceId }[];
};

function statusFor(r: () => number, age: number, qualified: boolean): { status: LeadStatus; statusAfterDays: number; responseHours?: number } {
  const responseHours = Math.round((r() < 0.6 ? 1 + r() * 10 : 10 + r() * 60) * 10) / 10;
  if (qualified) {
    // The team qualifies good leads quickly; older qualified leads have often converted.
    const status: LeadStatus = age >= 14 && r() < 0.45 ? "converted" : "qualified";
    return { status, statusAfterDays: Math.min(age, 1 + Math.floor(r() * (status === "converted" ? 25 : 4))), responseHours: Math.min(responseHours, 24) };
  }
  if (age < 3) {
    return r() < 0.6 ? { status: "pending", statusAfterDays: 0 } : { status: "contacted", statusAfterDays: 0, responseHours: 1 + Math.round(r() * 190) / 10 };
  }
  if (age < 14) {
    const status = pick(r, ["contacted", "pending"] as LeadStatus[], [75, 25]);
    return { status, statusAfterDays: Math.min(age, 1 + Math.floor(r() * 5)), responseHours: status === "pending" ? undefined : responseHours };
  }
  const status = pick(r, ["contacted", "lost"] as LeadStatus[], [40, 60]);
  return { status, statusAfterDays: Math.min(age, 2 + Math.floor(r() * 25)), responseHours };
}

/**
 * Evenly spread values in [0, 1) for consecutive indexes (additive recurrence
 * on irrational numbers). Used instead of plain random draws for the choices
 * that drive headline metrics, so short date ranges don't swing by chance.
 */
const IRRATIONALS = [0.6180339887, 0.4142135624, 0.7320508076, 0.2360679775, 0.6457513111, 0.3166247904, 0.6055512755];
const spread = (i: number, dim: number) => ((i + 1) * IRRATIONALS[dim]) % 1;

/** Steady growth through the year (no seasonal dip): daily traffic rises about 3.2×. */
const GROWTH = Math.log(3.2) / DEMO_DAYS;
const SERVICE_W_TOTAL = SERVICE_W.reduce((x, y) => x + y, 0);
/** Related services a visit sometimes browses as well. */
const RELATED: Record<ServiceId, [ServiceId, ServiceId]> = {
  stays: ["beaches", "dining"],
  events: ["dining", "stays"],
  amusements: ["dining", "beaches"],
  beaches: ["stays", "amusements"],
  dining: ["events", "amusements"],
  groups: ["stays", "events"],
};
const progress = (day: number) => day / DEMO_END_DAY;

/**
 * Fixed inputs so the demo is identical on server and client. The seed and the
 * starting points of the per-service running totals were chosen so this demo
 * year reads as steady growth in every preset date range.
 */
const SEED = 20251022;
type Phases = Record<ServiceId, number>;
const even = (v: number): Phases => ({ stays: v, events: v, amusements: v, beaches: v, dining: v, groups: v });
const PHASES = { newVisitors: even(0.5), returns: even(0.5), inquiries: even(0.5), qualified: even(0.5) };

function build(seed = SEED, phases = PHASES): DemoDataset {
  const { newVisitors: newPhase, returns: returnPhase, inquiries: inquiryPhase, qualified: qualifyPhase } = phases;
  const r = seededRandom(seed);
  const drafts: Draft[] = [];
  let vCount = 0;

  // Organic traffic, day by day and per service: a smooth quota of new visitors (busier weekends)
  // and of return visits, which go to an earlier visitor of that service after a realistic gap
  // (days, weeks, months or most of a year). Some visits also browse a related service.
  const pools = Object.fromEntries(SERVICE_IDS.map((sv) => [sv, [] as Draft[]])) as Record<ServiceId, Draft[]>;
  const lastDay = new Map<Draft, number>();
  const newQuota = { ...newPhase };
  const returnQuota = { ...returnPhase };
  const seq = Object.fromEntries(SERVICE_IDS.map((sv) => [sv, 0])) as Record<ServiceId, number>;
  const servicesFor = (sv: ServiceId, n: number) => {
    const out: ServiceId[] = [sv];
    if (spread(n, 5) < 0.32) out.push(RELATED[sv][spread(n, 6) < 0.5 ? 0 : 1]);
    return out;
  };
  for (let day = 0; day < DEMO_DAYS; day++) {
    const d = dayToDate(day);
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 1.25 : 1;
    const expected = 19 * Math.exp(GROWTH * day) * weekend;
    SERVICE_IDS.forEach((sv, si) => {
      newQuota[sv] += (expected * SERVICE_W[si]) / SERVICE_W_TOTAL;
      for (; newQuota[sv] >= 1; newQuota[sv]--) {
        const i = vCount;
        const id = `v${(++vCount).toString(36).padStart(4, "0")}`;
        const consent = spread(i, 0) < 0.9;
        const dr: Draft = {
          visitor: { id, firstDay: day, consent, sessionIds: [] },
          primary: sv,
          visits: [{ day, source: pick(r, SOURCE_IDS, FIRST_TOUCH_W), services: servicesFor(sv, seq[sv]++) }],
        };
        drafts.push(dr);
        lastDay.set(dr, day);
        if (consent) pools[sv].push(dr); // only consented browsers can be recognised when they return
      }

      // Return visits grow with the audience, and engagement improves over the year.
      returnQuota[sv] += (expected * SERVICE_W[si] * (0.34 + 0.14 * progress(day))) / SERVICE_W_TOTAL;
      const pool = pools[sv];
      while (returnQuota[sv] >= 1 && pool.length) {
        const n = seq[sv]++;
        const kind = spread(n, 3);
        const g = spread(n, 4);
        const gap = kind < 0.45 ? 1 + Math.floor(g * 14) : kind < 0.75 ? 15 + Math.floor(g * 75) : kind < 0.93 ? 91 + Math.floor(g * 150) : 241 + Math.floor(g * 160);
        const target = Math.max(0, day - gap);
        // Latest visitor who first came by the target day and hasn't been back since.
        let lo = 0;
        let hi = pool.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (pool[mid].visitor.firstDay <= target) lo = mid;
          else hi = mid - 1;
        }
        let found: Draft | null = null;
        for (let j = lo; j >= 0 && j > lo - 400; j--) {
          const cand = pool[j];
          if (lastDay.get(cand)! <= target && cand.visits.length < 12) {
            found = cand;
            break;
          }
        }
        if (!found) break; // not enough history yet; the quota carries over
        found.visits.push({ day, source: pick(r, SOURCE_IDS, RETURN_TOUCH_W), services: servicesFor(sv, n) });
        lastDay.set(found, day);
        returnQuota[sv]--;
      }
    });
  }

  // Inquiries, in date order: more likely on later visits and for planning-heavy services, and
  // gradually more likely over the year. A running total per service turns those odds into
  // inquiries evenly instead of in random clumps.
  const odds = { ...inquiryPhase };
  const lastInquiry = new Map<Draft, Map<ServiceId, number>>();
  const chronological = drafts.flatMap((dr) => dr.visits.map((_, vi) => ({ dr, vi }))).sort((x, y) => x.dr.visits[x.vi].day - y.dr.visits[y.vi].day);
  for (const { dr, vi } of chronological) {
    const v = dr.visits[vi];
    if (!v.services.length) continue;
    const base = vi === 0 ? 0.02 : vi === 1 ? 0.055 : 0.075;
    // Later visits sometimes turn into an inquiry about a different service.
    const others = v.services.filter((sv) => sv !== dr.primary);
    const service = vi > 0 && others.length && r() < 0.45 ? others[0] : v.services.includes(dr.primary) ? dr.primary : v.services[0];
    odds[service] += base * INQUIRY_AFFINITY[service] * (0.7 + 0.8 * progress(v.day));
    if (odds[service] < 1) continue;
    const seen = lastInquiry.get(dr) ?? new Map<ServiceId, number>();
    const prev = seen.get(service);
    if (prev !== undefined && v.day - prev < 45) continue;
    odds[service] -= 1;
    v.inquiry = service;
    seen.set(service, v.day);
    lastInquiry.set(dr, seen);
  }

  // Scripted journeys that illustrate key scenarios (also fictional).
  const scripted: { name: string; email: string; company?: string; visits: Draft["visits"] }[] = [
    {
      name: "Maria Alvarez",
      email: "maria.alvarez@example.com",
      visits: [
        { day: dateToDay(new Date(Date.UTC(2025, 9, 3))), source: "organic", services: ["stays"] },
        { day: dateToDay(new Date(Date.UTC(2025, 10, 6))), source: "direct", services: ["events", "stays"], inquiry: "events" },
        { day: dateToDay(new Date(Date.UTC(2026, 5, 18))), source: "email", services: ["groups"], inquiry: "groups" },
        { day: dateToDay(new Date(Date.UTC(2026, 9, 8))), source: "direct", services: ["stays"], inquiry: "stays" },
      ],
    },
    {
      name: "Daniel Okafor",
      email: "daniel.okafor@example.com",
      visits: [
        { day: dateToDay(new Date(Date.UTC(2025, 8, 28))), source: "organic", services: ["amusements"] },
        { day: dateToDay(new Date(Date.UTC(2026, 9, 1))), source: "organic", services: ["amusements", "stays"], inquiry: "amusements" },
      ],
    },
    {
      name: "Chloe Bennett",
      email: "chloe.bennett@example.com",
      company: "Shoreline Dance Academy",
      visits: [
        { day: dateToDay(new Date(Date.UTC(2026, 2, 9))), source: "paid", services: ["groups", "stays"] },
        { day: dateToDay(new Date(Date.UTC(2026, 3, 10))), source: "direct", services: ["groups"], inquiry: "groups" },
        { day: dateToDay(new Date(Date.UTC(2026, 6, 22))), source: "email", services: ["events"], inquiry: "events" },
      ],
    },
  ];
  const scriptedIds = new Set<string>();
  for (const s of scripted) {
    const id = `v${(++vCount).toString(36).padStart(4, "0")}`;
    scriptedIds.add(id);
    drafts.push({ visitor: { id, firstDay: s.visits[0].day, consent: true, sessionIds: [] }, primary: s.visits[0].services[0], visits: s.visits });
  }

  // Materialise sessions, inquiries and customers.
  const visitors: Visitor[] = [];
  const sessions: Session[] = [];
  const inquiries: Inquiry[] = [];
  const customers: Customer[] = [];
  let sCount = 0;
  let iCount = 0;
  let cCount = 0;
  const scriptedMeta = new Map(scripted.map((s, i) => [[...scriptedIds][i], s]));

  for (const dr of drafts) {
    const v = dr.visitor;
    visitors.push(v);
    let customer: Customer | undefined;
    dr.visits.forEach((visit, index) => {
      const id = `s${(++sCount).toString(36).padStart(5, "0")}`;
      const session: Session = {
        id,
        visitorId: v.id,
        day: visit.day,
        index,
        source: visit.source,
        services: visit.services,
        pageViews: 1 + visit.services.length + Math.floor(r() * 4),
        formStarted: Boolean(visit.inquiry) || (visit.services.length > 0 && r() < 0.035),
      };
      if (visit.inquiry) {
        if (!customer) {
          const meta = scriptedMeta.get(v.id);
          const first = FIRST[Math.floor(r() * FIRST.length)];
          const last = LAST[Math.floor(r() * LAST.length)];
          const groupish = visit.inquiry === "groups" || (visit.inquiry === "events" && r() < 0.3);
          customer = {
            id: `c${(++cCount).toString(36).padStart(4, "0")}`,
            visitorId: v.id,
            name: meta?.name ?? `${first} ${last}`,
            email: meta?.email ?? `${first}.${last}${cCount % 7 === 0 ? cCount : ""}@example.com`.toLowerCase(),
            company: meta ? meta.company : groupish ? COMPANIES[Math.floor(r() * COMPANIES.length)] : undefined,
            phoneOnFile: r() < 0.55,
            note: meta ? "Scripted demo journey." : "",
          };
          customers.push(customer);
          v.customerId = customer.id;
        }
        const inquiry: Inquiry = {
          id: `INQ-${(1000 + ++iCount).toString()}`,
          visitorId: v.id,
          customerId: customer.id,
          sessionId: id,
          day: visit.day,
          service: visit.inquiry,
          status: "pending", // set below
          qualified: false,
          rep: REPS[Math.floor(r() * REPS.length)],
          statusAfterDays: 0,
          message: MESSAGES[visit.inquiry][Math.floor(r() * 3)],
        };
        inquiries.push(inquiry);
        session.inquiryId = inquiry.id;
      }
      sessions.push(session);
      v.sessionIds.push(id);
    });
  }

  // Lead outcomes, in date order: the share of qualified leads improves over the year, spread
  // evenly per service with the same running-total approach as inquiries.
  const qualifyOdds = { ...qualifyPhase };
  for (const inq of [...inquiries].sort((x, y) => x.day - y.day)) {
    qualifyOdds[inq.service] += 0.42 + 0.2 * progress(inq.day);
    const qualified = qualifyOdds[inq.service] >= 1;
    if (qualified) qualifyOdds[inq.service] -= 1;
    const st = statusFor(r, DEMO_END_DAY - inq.day, qualified);
    Object.assign(inq, { status: st.status, qualified, responseHours: st.responseHours, statusAfterDays: st.statusAfterDays });
  }

  // Scripted outcome overrides so the example journeys tell a clear story.
  const byName = (n: string) => customers.find((c) => c.name === n)!;
  const setStatus = (c: Customer, service: ServiceId, status: LeadStatus, hours: number, after: number) => {
    const inq = inquiries.find((i) => i.customerId === c.id && i.service === service)!;
    Object.assign(inq, { status, qualified: status === "qualified" || status === "converted", responseHours: status === "pending" ? undefined : hours, statusAfterDays: after });
  };
  setStatus(byName("Maria Alvarez"), "events", "converted", 3.5, 12);
  setStatus(byName("Maria Alvarez"), "groups", "qualified", 6, 8);
  setStatus(byName("Maria Alvarez"), "stays", "contacted", 2, 1);
  setStatus(byName("Daniel Okafor"), "amusements", "qualified", 4, 6);
  setStatus(byName("Chloe Bennett"), "groups", "converted", 1.5, 9);
  setStatus(byName("Chloe Bennett"), "events", "lost", 20, 14);

  inquiries.sort((a, b) => a.day - b.day);
  const sessionsByDay: Session[][] = Array.from({ length: DEMO_DAYS }, () => []);
  for (const s of sessions) sessionsByDay[s.day].push(s);

  return {
    visitors,
    sessions,
    inquiries,
    customers,
    visitorById: new Map(visitors.map((v) => [v.id, v])),
    sessionById: new Map(sessions.map((s) => [s.id, s])),
    customerById: new Map(customers.map((c) => [c.id, c])),
    sessionsByDay,
  };
}

let cache: DemoDataset | null = null;

/** Lazily builds the deterministic demo dataset (identical on server and client). */
export function getDemoDataset() {
  return (cache ??= build());
}

export const serviceLabel = (id: ServiceId) => SERVICES.find((s) => s.id === id)!.label;
export const sourceLabel = (id: SourceId) => SOURCES.find((s) => s.id === id)!.label;
export const statusLabel = (id: LeadStatus) => LEAD_STATUSES.find((s) => s.id === id)!.label;
