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

const SEASON = [0.35, 0.36, 0.48, 0.62, 0.92, 1.42, 1.72, 1.62, 0.95, 0.62, 0.42, 0.46];

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

function statusFor(r: () => number, age: number): { status: LeadStatus; statusAfterDays: number; responseHours?: number } {
  if (age < 5) {
    return r() < 0.7 ? { status: "pending", statusAfterDays: 0 } : { status: "contacted", statusAfterDays: 0, responseHours: 1 + r() * 20 };
  }
  const responseHours = Math.round((r() < 0.6 ? 1 + r() * 10 : 10 + r() * 60) * 10) / 10;
  if (age < 14) {
    const status = pick(r, ["contacted", "qualified", "pending"] as LeadStatus[], [55, 35, 10]);
    return { status, statusAfterDays: Math.min(age, 1 + Math.floor(r() * 5)), responseHours: status === "pending" ? undefined : responseHours };
  }
  const status = pick(r, ["contacted", "qualified", "converted", "lost"] as LeadStatus[], [14, 30, 24, 32]);
  return { status, statusAfterDays: Math.min(age, 2 + Math.floor(r() * 25)), responseHours };
}

function build(): DemoDataset {
  const r = seededRandom(20251022);
  const drafts: Draft[] = [];
  let vCount = 0;

  // Organic visitors, shaped by beach-town seasonality and a gentle growth trend.
  for (let day = 0; day < DEMO_DAYS; day++) {
    const d = dayToDate(day);
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 1.25 : 1;
    const trend = 0.9 + (day / DEMO_DAYS) * 0.25;
    const expected = 13.5 * SEASON[d.getUTCMonth()] * weekend * trend;
    const count = Math.max(0, Math.round(expected * (0.75 + r() * 0.5)));
    for (let k = 0; k < count; k++) {
      const id = `v${(++vCount).toString(36).padStart(4, "0")}`;
      const consent = r() < 0.9;
      const primary = pick(r, SERVICE_IDS, SERVICE_W);
      const visits: Draft["visits"] = [{ day, source: pick(r, SOURCE_IDS, FIRST_TOUCH_W), services: [] }];
      if (consent && r() < 0.47) {
        let last = day;
        let more = 1;
        while (r() < 0.52 && more < 12) more++;
        for (let n = 0; n < more; n++) {
          const kind = r();
          const gap = kind < 0.45 ? 1 + Math.floor(r() * 14) : kind < 0.75 ? 15 + Math.floor(r() * 75) : kind < 0.93 ? 91 + Math.floor(r() * 150) : 241 + Math.floor(r() * 160);
          last += gap;
          if (last > DEMO_END_DAY) break;
          visits.push({ day: last, source: pick(r, SOURCE_IDS, RETURN_TOUCH_W), services: [] });
        }
      }
      for (const v of visits) {
        if (r() < 0.14) continue; // homepage-only visit
        const n = r() < 0.6 ? 1 : r() < 0.7 ? 2 : 3;
        const set = new Set<ServiceId>();
        if (r() < 0.65) set.add(primary);
        while (set.size < n) set.add(pick(r, SERVICE_IDS, SERVICE_W));
        v.services = [...set];
      }
      drafts.push({ visitor: { id, firstDay: day, consent, sessionIds: [] }, primary, visits });
    }
  }

  // Inquiries: more likely on later visits and for planning-heavy services.
  for (const dr of drafts) {
    const seen = new Map<ServiceId, number>();
    dr.visits.forEach((v, i) => {
      if (!v.services.length) return;
      const base = i === 0 ? 0.024 : i === 1 ? 0.075 : 0.11;
      // Later visits sometimes turn into an inquiry about a different service.
      const others = v.services.filter((sv) => sv !== dr.primary);
      const service = i > 0 && others.length && r() < 0.45 ? others[0] : v.services.includes(dr.primary) ? dr.primary : v.services[0];
      if (r() < base * INQUIRY_AFFINITY[service]) {
        const prev = seen.get(service);
        if (prev !== undefined && v.day - prev < 45) return;
        v.inquiry = service;
        seen.set(service, v.day);
      }
    });
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
        const age = DEMO_END_DAY - visit.day;
        const st = statusFor(r, age);
        const inquiry: Inquiry = {
          id: `INQ-${(1000 + ++iCount).toString()}`,
          visitorId: v.id,
          customerId: customer.id,
          sessionId: id,
          day: visit.day,
          service: visit.inquiry,
          status: st.status,
          qualified: st.status === "qualified" || st.status === "converted",
          rep: REPS[Math.floor(r() * REPS.length)],
          responseHours: st.responseHours,
          statusAfterDays: st.statusAfterDays,
          message: MESSAGES[visit.inquiry][Math.floor(r() * 3)],
        };
        inquiries.push(inquiry);
        session.inquiryId = inquiry.id;
      }
      sessions.push(session);
      v.sessionIds.push(id);
    });
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
