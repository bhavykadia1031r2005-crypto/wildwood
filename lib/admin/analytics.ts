/**
 * Aggregations behind the dashboard. Pure functions over the dataset so the
 * same logic can later run server-side against real data.
 *
 * Definitions (shown to admins in tooltips):
 * - Visitor: a first-party visitor ID (consented browsers only persist one).
 * - New visitor: first recorded visit falls inside the period.
 * - Returning visitor: active in the period, first recorded visit before it.
 * - Inquiry conversion: unique visitors with ≥1 inquiry ÷ unique visitors.
 * - Qualified lead: inquiry currently marked qualified or converted.
 * With a service filter, only visits that viewed that service (and inquiries
 * for it) are counted.
 */

import {
  DEMO_END_DAY,
  SERVICES,
  SOURCES,
  dayToDate,
  type DemoDataset,
  type Inquiry,
  type LeadStatus,
  type ServiceId,
  type Session,
  type SourceId,
} from "./demoData";

export type DayRange = { start: number; end: number };
export type ServiceFilter = ServiceId | "all";
export type Granularity = "day" | "week" | "month";

export const rangeLength = (r: DayRange) => r.end - r.start + 1;

export function previousRange(r: DayRange): DayRange | null {
  const len = rangeLength(r);
  const prev = { start: r.start - len, end: r.start - 1 };
  // Comparison needs a full previous period inside the recorded history.
  return prev.start < 0 ? null : prev;
}

function sessionsIn(ds: DemoDataset, r: DayRange, service: ServiceFilter): Session[] {
  const out: Session[] = [];
  for (let d = Math.max(0, r.start); d <= Math.min(DEMO_END_DAY, r.end); d++) {
    for (const s of ds.sessionsByDay[d]) if (service === "all" || s.services.includes(service)) out.push(s);
  }
  return out;
}

function inquiriesIn(ds: DemoDataset, r: DayRange, service: ServiceFilter): Inquiry[] {
  return ds.inquiries.filter((i) => i.day >= r.start && i.day <= r.end && (service === "all" || i.service === service));
}

export type Kpis = {
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
  inquiries: number;
  inquirers: number;
  conversion: number;
  qualified: number;
  sessions: number;
};

export function kpis(ds: DemoDataset, r: DayRange, service: ServiceFilter): Kpis {
  const sessions = sessionsIn(ds, r, service);
  const visitors = new Set(sessions.map((s) => s.visitorId));
  let newVisitors = 0;
  visitors.forEach((id) => {
    if (ds.visitorById.get(id)!.firstDay >= r.start) newVisitors++;
  });
  const inqs = inquiriesIn(ds, r, service);
  const inquirers = new Set(inqs.map((i) => i.visitorId));
  return {
    visitors: visitors.size,
    newVisitors,
    returningVisitors: visitors.size - newVisitors,
    inquiries: inqs.length,
    inquirers: inquirers.size,
    conversion: visitors.size ? inquirers.size / visitors.size : 0,
    qualified: inqs.filter((i) => i.qualified).length,
    sessions: sessions.length,
  };
}

/** Relative change; null when there is no baseline to compare against. */
export function change(current: number, previous: number | undefined | null) {
  if (previous === undefined || previous === null || previous === 0) return null;
  return (current - previous) / previous;
}

export type Bucket = { start: number; end: number; label: string; key: string };

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
const DAY_LABEL = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function buckets(r: DayRange, g: Granularity): Bucket[] {
  const out: Bucket[] = [];
  let d = r.start;
  while (d <= r.end) {
    const date = dayToDate(d);
    let end = d;
    if (g === "week") {
      const toSunday = (7 - date.getUTCDay()) % 7;
      end = Math.min(r.end, d + toSunday);
    } else if (g === "month") {
      const next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
      end = Math.min(r.end, d + Math.round((next - date.getTime()) / 86_400_000) - 1);
    }
    const label = g === "month" ? MONTH_YEAR.format(date) : DAY_LABEL.format(date);
    out.push({ start: d, end, label, key: `${g}-${d}` });
    d = end + 1;
  }
  return out;
}

export type SeriesPoint = {
  label: string;
  start: number;
  end: number;
  total: number;
  newVisitors: number;
  returning: number;
  inquiries: number;
  prevTotal?: number;
  prevInquiries?: number;
};

function pointFor(ds: DemoDataset, b: DayRange, service: ServiceFilter) {
  const k = kpis(ds, b, service);
  return { total: k.visitors, newVisitors: k.newVisitors, returning: k.returningVisitors, inquiries: k.inquiries };
}

export function trafficSeries(ds: DemoDataset, r: DayRange, g: Granularity, service: ServiceFilter, compare: boolean): SeriesPoint[] {
  const bs = buckets(r, g);
  const prev = compare ? previousRange(r) : null;
  const prevBs = prev ? buckets(prev, g) : [];
  return bs.map((b, i) => {
    const p = pointFor(ds, b, service);
    const pb = prevBs[i];
    const pp = pb ? pointFor(ds, pb, service) : null;
    return { label: b.label, start: b.start, end: b.end, ...p, prevTotal: pp?.total, prevInquiries: pp?.inquiries };
  });
}

/** Small daily/weekly series for KPI sparklines. */
export function sparkline(ds: DemoDataset, r: DayRange, service: ServiceFilter, metric: keyof Kpis) {
  const g: Granularity = rangeLength(r) > 120 ? "week" : "day";
  return buckets(r, g).map((b) => {
    const k = kpis(ds, b, service);
    return { v: metric === "conversion" ? k.conversion * 100 : k[metric] };
  });
}

export type SourceRow = { id: SourceId; label: string; sessions: number; visitors: number; inquiries: number; conversion: number; share: number };

export function sourceBreakdown(ds: DemoDataset, r: DayRange, service: ServiceFilter): SourceRow[] {
  const sessions = sessionsIn(ds, r, service);
  const inqs = inquiriesIn(ds, r, service);
  const total = sessions.length || 1;
  return SOURCES.map(({ id, label }) => {
    const ss = sessions.filter((s) => s.source === id);
    const vis = new Set(ss.map((s) => s.visitorId));
    const inquiriesFrom = inqs.filter((i) => ds.sessionById.get(i.sessionId)!.source === id);
    const inquirers = new Set(inquiriesFrom.map((i) => i.visitorId));
    return {
      id,
      label,
      sessions: ss.length,
      visitors: vis.size,
      inquiries: inquiriesFrom.length,
      conversion: vis.size ? inquirers.size / vis.size : 0,
      share: ss.length / total,
    };
  }).sort((a, b) => b.sessions - a.sessions);
}

export type ServiceRow = {
  id: ServiceId;
  label: string;
  pageViews: number;
  visitors: number;
  returning: number;
  returningShare: number;
  inquiries: number;
  qualified: number;
  conversion: number;
  topSources: SourceId[];
};

export function servicePerformance(ds: DemoDataset, r: DayRange): ServiceRow[] {
  return SERVICES.map(({ id, label }) => {
    const ss = sessionsIn(ds, r, id);
    const vis = new Set(ss.map((s) => s.visitorId));
    let returning = 0;
    vis.forEach((v) => {
      if (ds.visitorById.get(v)!.firstDay < r.start) returning++;
    });
    const inqs = inquiriesIn(ds, r, id);
    const inquirers = new Set(inqs.map((i) => i.visitorId));
    const srcCount = new Map<SourceId, number>();
    ss.forEach((s) => srcCount.set(s.source, (srcCount.get(s.source) ?? 0) + 1));
    return {
      id,
      label,
      pageViews: ss.length,
      visitors: vis.size,
      returning,
      returningShare: vis.size ? returning / vis.size : 0,
      inquiries: inqs.length,
      qualified: inqs.filter((i) => i.qualified).length,
      conversion: vis.size ? inquirers.size / vis.size : 0,
      topSources: [...srcCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([s]) => s),
    };
  });
}

/* ---------- Retention ---------- */

const visitorSessions = (ds: DemoDataset, visitorId: string) => ds.visitorById.get(visitorId)!.sessionIds.map((id) => ds.sessionById.get(id)!);

function cohortVisitors(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  return ds.visitors.filter(
    (v) => v.firstDay >= r.start && v.firstDay <= r.end && (service === "all" || visitorSessions(ds, v.id).some((s) => s.services.includes(service))),
  );
}

export type ReturnWindow = { days: number; label: string; eligible: number; returned: number; rate: number | null };

/** Rolling cohort used for return windows: visitors first seen in the 12 months up to the end of the period. */
export const retentionCohortRange = (r: DayRange): DayRange => ({ start: Math.max(0, r.end - 364), end: r.end });

/** Share of the rolling cohort who came back within N days (only counting visitors with N days of follow-up). */
export function returnWindows(ds: DemoDataset, r: DayRange, service: ServiceFilter): ReturnWindow[] {
  const cohort = cohortVisitors(ds, retentionCohortRange(r), service);
  return [
    { days: 7, label: "7 days" },
    { days: 30, label: "30 days" },
    { days: 90, label: "90 days" },
    { days: 180, label: "6 months" },
    { days: 365, label: "1 year" },
  ].map(({ days, label }) => {
    const eligible = cohort.filter((v) => v.firstDay + days <= DEMO_END_DAY);
    const returned = eligible.filter((v) => visitorSessions(ds, v.id).some((s) => s.index > 0 && s.day - v.firstDay <= days)).length;
    return { days, label, eligible: eligible.length, returned, rate: eligible.length ? returned / eligible.length : null };
  });
}

export function visitFrequency(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const counts = new Map<string, number>();
  for (const s of sessionsIn(ds, r, service)) counts.set(s.visitorId, (counts.get(s.visitorId) ?? 0) + 1);
  const bins = [
    { label: "1 visit", min: 1, max: 1 },
    { label: "2", min: 2, max: 2 },
    { label: "3", min: 3, max: 3 },
    { label: "4–5", min: 4, max: 5 },
    { label: "6–9", min: 6, max: 9 },
    { label: "10+", min: 10, max: Infinity },
  ];
  return bins.map((b) => ({ label: b.label, visitors: [...counts.values()].filter((c) => c >= b.min && c <= b.max).length }));
}

export function daysToFirstInquiry(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const firsts = new Map<string, Inquiry>();
  for (const i of ds.inquiries) if (!firsts.has(i.visitorId)) firsts.set(i.visitorId, i);
  const diffs = [...firsts.values()]
    .filter((i) => i.day >= r.start && i.day <= r.end && (service === "all" || i.service === service))
    .map((i) => i.day - ds.visitorById.get(i.visitorId)!.firstDay);
  const bins = [
    { label: "0 d", min: 0, max: 0 },
    { label: "1–7 d", min: 1, max: 7 },
    { label: "8–30 d", min: 8, max: 30 },
    { label: "31–90 d", min: 31, max: 90 },
    { label: "91–180 d", min: 91, max: 180 },
    { label: "181+ d", min: 181, max: Infinity },
  ];
  const sorted = [...diffs].sort((a, b) => a - b);
  return {
    total: diffs.length,
    median: sorted.length ? sorted[Math.floor(sorted.length / 2)] : null,
    bins: bins.map((b) => ({ label: b.label, people: diffs.filter((d) => d >= b.min && d <= b.max).length })),
  };
}

/** Returning visitors who went on to inquire (in the period). */
export function returningToInquiry(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const k = kpis(ds, r, service);
  const inqs = inquiriesIn(ds, r, service);
  const returningInquirers = new Set(inqs.filter((i) => ds.sessionById.get(i.sessionId)!.index > 0).map((i) => i.visitorId));
  return { returningVisitors: k.returningVisitors, returningInquirers: returningInquirers.size, inquirers: k.inquirers };
}

export type CohortRow = { key: string; label: string; size: number; cells: (number | null)[] };

/** Monthly cohorts by first-visit month: share of the cohort active in each following month. */
export function cohorts(ds: DemoDataset, service: ServiceFilter, maxOffset = 12): CohortRow[] {
  const monthIndex = (day: number) => {
    const d = dayToDate(day);
    return d.getUTCFullYear() * 12 + d.getUTCMonth();
  };
  const lastMonth = monthIndex(DEMO_END_DAY);
  const groups = new Map<number, string[]>();
  for (const v of ds.visitors) {
    if (service !== "all" && !visitorSessions(ds, v.id).some((s) => s.services.includes(service))) continue;
    const m = monthIndex(v.firstDay);
    groups.set(m, [...(groups.get(m) ?? []), v.id]);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([m, ids]) => {
      const cells: (number | null)[] = [];
      for (let k = 1; k <= maxOffset; k++) {
        if (m + k > lastMonth) {
          cells.push(null);
          continue;
        }
        const active = ids.filter((id) => visitorSessions(ds, id).some((s) => monthIndex(s.day) === m + k)).length;
        cells.push(active / ids.length);
      }
      const date = new Date(Date.UTC(Math.floor(m / 12), m % 12, 1));
      return { key: String(m), label: MONTH_YEAR.format(date), size: ids.length, cells };
    });
}

/** Long gaps: returning visits in the period that came after N+ days away. */
export function longGapReturns(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const ss = sessionsIn(ds, r, service).filter((s) => s.index > 0);
  const gaps = ss.map((s) => {
    const prior = visitorSessions(ds, s.visitorId)[s.index - 1];
    return { visitorId: s.visitorId, gap: s.day - prior.day };
  });
  return [30, 90, 180, 365].map((n) => ({
    days: n,
    visitors: new Set(gaps.filter((g) => g.gap >= n).map((g) => g.visitorId)).size,
  }));
}

/* ---------- Inquiries ---------- */

export function inquiryStats(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const inqs = inquiriesIn(ds, r, service);
  const responded = inqs.filter((i) => i.responseHours !== undefined);
  const byStatus = Object.fromEntries(
    (["pending", "contacted", "qualified", "converted", "lost"] as LeadStatus[]).map((s) => [s, inqs.filter((i) => i.status === s).length]),
  ) as Record<LeadStatus, number>;
  return {
    total: inqs.length,
    unique: new Set(inqs.map((i) => i.visitorId)).size,
    qualified: inqs.filter((i) => i.qualified).length,
    byStatus,
    avgResponseHours: responded.length ? responded.reduce((a, i) => a + i.responseHours!, 0) / responded.length : null,
  };
}

export type InquiryRow = {
  id: string;
  customerId: string;
  name: string;
  email: string;
  company?: string;
  service: ServiceId;
  firstVisit: number;
  latestVisit: number;
  submitted: number;
  visitorType: "new" | "returning";
  visits: number;
  status: LeadStatus;
  rep: string;
};

export function inquiryRows(ds: DemoDataset, r: DayRange, service: ServiceFilter): InquiryRow[] {
  return inquiriesIn(ds, r, service).map((i) => {
    const c = ds.customerById.get(i.customerId)!;
    const v = ds.visitorById.get(i.visitorId)!;
    const sess = visitorSessions(ds, v.id);
    return {
      id: i.id,
      customerId: c.id,
      name: c.name,
      email: c.email,
      company: c.company,
      service: i.service,
      firstVisit: v.firstDay,
      latestVisit: sess[sess.length - 1].day,
      submitted: i.day,
      visitorType: ds.sessionById.get(i.sessionId)!.index > 0 ? "returning" : "new",
      visits: sess.length,
      status: i.status,
      rep: i.rep,
    };
  });
}

/* ---------- Cross-service & long-term ---------- */

export type CrossServiceRow = {
  customerId: string;
  name: string;
  previousService: ServiceId;
  previousDay: number;
  newService: ServiceId;
  newDay: number;
  daysBetween: number;
  status: LeadStatus;
  returnSource: SourceId;
};

/** Returning visitors who submitted an inquiry for a different service than before (later inquiry in period). */
export function crossServiceInquiries(ds: DemoDataset, r: DayRange, service: ServiceFilter): CrossServiceRow[] {
  const byCustomer = new Map<string, Inquiry[]>();
  for (const i of ds.inquiries) byCustomer.set(i.customerId, [...(byCustomer.get(i.customerId) ?? []), i]);
  const rows: CrossServiceRow[] = [];
  byCustomer.forEach((list, customerId) => {
    for (let k = 1; k < list.length; k++) {
      const prev = list[k - 1];
      const next = list[k];
      if (prev.service === next.service || next.day < r.start || next.day > r.end) continue;
      if (service !== "all" && prev.service !== service && next.service !== service) continue;
      rows.push({
        customerId,
        name: ds.customerById.get(customerId)!.name,
        previousService: prev.service,
        previousDay: prev.day,
        newService: next.service,
        newDay: next.day,
        daysBetween: next.day - prev.day,
        status: next.status,
        returnSource: ds.sessionById.get(next.sessionId)!.source,
      });
    }
  });
  return rows.sort((a, b) => b.newDay - a.newDay);
}

export function repeatInquiryStats(ds: DemoDataset) {
  const byCustomer = new Map<string, Inquiry[]>();
  for (const i of ds.inquiries) byCustomer.set(i.customerId, [...(byCustomer.get(i.customerId) ?? []), i]);
  const repeaters = [...byCustomer.values()].filter((l) => l.length > 1);
  const gaps = repeaters.flatMap((l) => l.slice(1).map((i, k) => i.day - l[k].day));
  const combos = new Map<string, number>();
  repeaters.forEach((l) => {
    const set = [...new Set(l.map((i) => i.service))].sort();
    for (let a = 0; a < set.length; a++) for (let b = a + 1; b < set.length; b++) {
      const key = `${set[a]}|${set[b]}`;
      combos.set(key, (combos.get(key) ?? 0) + 1);
    }
  });
  const laterConverted = repeaters.filter((l) => l.slice(1).some((i) => i.status === "converted")).length;
  return {
    customers: byCustomer.size,
    repeatCustomers: repeaters.length,
    avgDaysBetween: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
    repeatConversion: repeaters.length ? laterConverted / repeaters.length : null,
    combos: [...combos.entries()]
      .map(([key, count]) => ({ a: key.split("|")[0] as ServiceId, b: key.split("|")[1] as ServiceId, count }))
      .sort((x, y) => y.count - x.count),
  };
}

/** Monthly visitors and inquiries for the whole history, used for trends and year-over-year. */
export function monthlyHistory(ds: DemoDataset, service: ServiceFilter) {
  return buckets({ start: 0, end: DEMO_END_DAY }, "month").map((b) => {
    const k = kpis(ds, b, service);
    const d = dayToDate(b.start);
    return {
      label: b.label,
      month: MONTH.format(d),
      year: d.getUTCFullYear(),
      start: b.start,
      end: b.end,
      partial: b.end - b.start + 1 < new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(),
      visitors: k.visitors,
      returning: k.returningVisitors,
      returningShare: k.visitors ? k.returningVisitors / k.visitors : 0,
      inquiries: k.inquiries,
    };
  });
}

/** Year-over-year comparison for the same calendar span, only where both years exist in the data. */
export function yearOverYear(ds: DemoDataset, service: ServiceFilter) {
  const end = dayToDate(DEMO_END_DAY);
  const monthStart = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1);
  const thisStart = Math.round((monthStart - dayToDate(0).getTime()) / 86_400_000);
  const lastStart = Math.round((Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), 1) - dayToDate(0).getTime()) / 86_400_000);
  const span = DEMO_END_DAY - thisStart;
  if (lastStart < 0) return null;
  const cur = kpis(ds, { start: thisStart, end: thisStart + span }, service);
  const prev = kpis(ds, { start: lastStart, end: lastStart + span }, service);
  return {
    label: `${DAY_LABEL.format(dayToDate(thisStart))}–${DAY_LABEL.format(end)}`,
    current: cur,
    previous: prev,
    visitorsChange: change(cur.visitors, prev.visitors),
    inquiriesChange: change(cur.inquiries, prev.inquiries),
  };
}

/* ---------- Activity heatmap ---------- */

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Visits in the period by weekday (Mon–Sun rows) and starting hour (0–23 columns, ET). */
export function activityHeatmap(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const grid = WEEKDAYS.map(() => Array<number>(24).fill(0));
  for (const s of sessionsIn(ds, r, service)) grid[(dayToDate(s.day).getUTCDay() + 6) % 7][s.hour]++;
  let max = 0;
  let peak = { day: 0, hour: 0 };
  grid.forEach((row, d) =>
    row.forEach((v, h) => {
      if (v > max) {
        max = v;
        peak = { day: d, hour: h };
      }
    }),
  );
  const byDay = grid.map((row) => row.reduce((a, b) => a + b, 0));
  const total = byDay.reduce((a, b) => a + b, 0);
  const busiestDay = byDay.indexOf(Math.max(...byDay));
  return { grid, max, total, peak, busiestDay, weekendShare: total ? (byDay[5] + byDay[6]) / total : 0 };
}

/* ---------- Customer profile ---------- */

export type TimelineEvent = {
  day: number;
  type: "session_start" | "service_view" | "inquiry_form_start" | "inquiry_submit" | "lead_contacted" | "lead_qualified" | "lead_converted" | "lead_lost";
  label: string;
  detail?: string;
  identified: boolean;
  sessionIndex: number;
};

export function customerProfile(ds: DemoDataset, customerId: string) {
  const c = ds.customerById.get(customerId)!;
  const v = ds.visitorById.get(c.visitorId)!;
  const sessions = visitorSessions(ds, v.id);
  const inqs = ds.inquiries.filter((i) => i.customerId === customerId);
  const firstInquiryDay = inqs[0]?.day ?? Infinity;
  const events: TimelineEvent[] = [];
  const serviceName = (id: ServiceId) => SERVICES.find((s) => s.id === id)!.label;
  const sourceName = (id: SourceId) => SOURCES.find((s) => s.id === id)!.label;

  sessions.forEach((s) => {
    const identified = s.day > firstInquiryDay || (s.day === firstInquiryDay && Boolean(s.inquiryId));
    events.push({ day: s.day, type: "session_start", label: s.index === 0 ? "First visit" : `Visit ${s.index + 1}`, detail: `via ${sourceName(s.source)} · ${s.pageViews} pages`, identified, sessionIndex: s.index });
    s.services.forEach((sv) => events.push({ day: s.day, type: "service_view", label: `Viewed ${serviceName(sv)}`, identified, sessionIndex: s.index }));
    if (s.formStarted && !s.inquiryId) events.push({ day: s.day, type: "inquiry_form_start", label: "Started an inquiry form", detail: "Not submitted", identified, sessionIndex: s.index });
    if (s.inquiryId) {
      const i = inqs.find((x) => x.id === s.inquiryId)!;
      events.push({ day: s.day, type: "inquiry_submit", label: `Submitted inquiry · ${serviceName(i.service)}`, detail: i.id, identified: true, sessionIndex: s.index });
      if (i.responseHours !== undefined) {
        events.push({ day: s.day + Math.floor(i.responseHours / 24), type: "lead_contacted", label: "Contacted by sales", detail: `${i.rep} · responded in ${formatHours(i.responseHours)}`, identified: true, sessionIndex: s.index });
      }
      const after = s.day + i.statusAfterDays;
      if (i.status === "qualified" || i.status === "converted") events.push({ day: after, type: "lead_qualified", label: "Lead qualified", detail: serviceName(i.service), identified: true, sessionIndex: s.index });
      if (i.status === "converted") events.push({ day: Math.min(DEMO_END_DAY, after + 3), type: "lead_converted", label: "Lead converted", detail: serviceName(i.service), identified: true, sessionIndex: s.index });
      if (i.status === "lost") events.push({ day: after, type: "lead_lost", label: "Lead marked lost", detail: serviceName(i.service), identified: true, sessionIndex: s.index });
    }
  });
  events.sort((a, b) => a.day - b.day || a.sessionIndex - b.sessionIndex);

  const servicesViewed = [...new Set(sessions.flatMap((s) => s.services))];
  const gaps = sessions.slice(1).map((s, k) => s.day - sessions[k].day);
  return {
    customer: c,
    visitor: v,
    sessions,
    inquiries: inqs,
    events,
    servicesViewed,
    firstSeen: v.firstDay,
    lastSeen: sessions[sessions.length - 1].day,
    firstTouch: sessions[0].source,
    latestTouch: sessions[sessions.length - 1].source,
    daysToFirstInquiry: inqs.length ? inqs[0].day - v.firstDay : null,
    avgGap: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
    anonymousVisitsBeforeInquiry: sessions.filter((s) => s.day < firstInquiryDay || (s.day === firstInquiryDay && !s.inquiryId)).length,
  };
}

export function formatHours(h: number) {
  return h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${Math.round(h * 10) / 10} h` : `${Math.round(h / 24)} days`;
}

/** Identified people with the richest journeys, for the journey explorer list. */
export function journeyCandidates(ds: DemoDataset, service: ServiceFilter) {
  return ds.customers
    .map((c) => {
      const v = ds.visitorById.get(c.visitorId)!;
      const inqs = ds.inquiries.filter((i) => i.customerId === c.id);
      return {
        id: c.id,
        name: c.name,
        visits: v.sessionIds.length,
        inquiries: inqs.length,
        services: [...new Set(inqs.map((i) => i.service))],
        lastDay: ds.sessionById.get(v.sessionIds[v.sessionIds.length - 1])!.day,
      };
    })
    .filter((c) => service === "all" || c.services.includes(service))
    .sort((a, b) => b.inquiries - a.inquiries || b.visits - a.visits || b.lastDay - a.lastDay);
}

/** First-touch vs latest-touch sources for identified customers. */
export function touchAttribution(ds: DemoDataset, service: ServiceFilter) {
  const first = new Map<SourceId, number>();
  const latest = new Map<SourceId, number>();
  for (const c of ds.customers) {
    const sess = visitorSessions(ds, c.visitorId);
    const inqs = ds.inquiries.filter((i) => i.customerId === c.id);
    if (service !== "all" && !inqs.some((i) => i.service === service)) continue;
    first.set(sess[0].source, (first.get(sess[0].source) ?? 0) + 1);
    const s = sess[sess.length - 1].source;
    latest.set(s, (latest.get(s) ?? 0) + 1);
  }
  return SOURCES.map(({ id, label }) => ({ id, label, first: first.get(id) ?? 0, latest: latest.get(id) ?? 0 }));
}

/** First-time vs returning visitors in the period: size, visits and inquiry conversion. */
export function newVsReturning(ds: DemoDataset, r: DayRange, service: ServiceFilter) {
  const sessions = sessionsIn(ds, r, service);
  const visitsBy = new Map<string, number>();
  sessions.forEach((s) => visitsBy.set(s.visitorId, (visitsBy.get(s.visitorId) ?? 0) + 1));
  const inquirers = new Set(inquiriesIn(ds, r, service).map((i) => i.visitorId));
  const group = (isNew: boolean) => {
    const ids = [...visitsBy.keys()].filter((id) => (ds.visitorById.get(id)!.firstDay >= r.start) === isNew);
    const conv = ids.filter((id) => inquirers.has(id)).length;
    return {
      visitors: ids.length,
      inquirers: conv,
      conversion: ids.length ? conv / ids.length : 0,
      avgVisits: ids.length ? ids.reduce((a, id) => a + visitsBy.get(id)!, 0) / ids.length : 0,
    };
  };
  return { first: group(true), returning: group(false) };
}
