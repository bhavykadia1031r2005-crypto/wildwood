"use client";

import { useMemo } from "react";
import { BadgeCheck, MousePointerClick, Repeat, Send, UserPlus, Users, type LucideIcon } from "lucide-react";
import { change, kpis, sparkline, type Kpis } from "@/lib/admin/analytics";
import { fmtNumber, fmtPercent } from "@/lib/admin/format";
import { C, Sparkline } from "./charts";
import { useDashboard } from "./DashboardProvider";
import { Delta, InfoTip } from "./ui";

type CardDef = {
  key: keyof Kpis;
  label: string;
  icon: LucideIcon;
  info: string;
  color: string;
  value: (k: Kpis) => string;
  sub?: (k: Kpis) => string;
  /** Rates compare in percentage points. */
  points?: boolean;
};

const CARDS: CardDef[] = [
  {
    key: "visitors",
    label: "Total visitors",
    icon: Users,
    color: C.total,
    info: "Unique visitor IDs with at least one visit in the period. Only browsers that allow analytics cookies keep a persistent ID.",
    value: (k) => fmtNumber(k.visitors),
    sub: (k) => `${fmtNumber(k.sessions)} visits`,
  },
  {
    key: "returningVisitors",
    label: "Returning visitors",
    icon: Repeat,
    color: C.returning,
    info: "Visitors active in the period whose first recorded visit was before it. A returning visitor isn't necessarily a known customer.",
    value: (k) => fmtNumber(k.returningVisitors),
    sub: (k) => `${fmtPercent(k.visitors ? k.returningVisitors / k.visitors : 0)} of visitors`,
  },
  {
    key: "newVisitors",
    label: "New visitors",
    icon: UserPlus,
    color: C.newVisitors,
    info: "Visitors whose first recorded visit falls inside the period.",
    value: (k) => fmtNumber(k.newVisitors),
    sub: (k) => `${fmtPercent(k.visitors ? k.newVisitors / k.visitors : 0)} of visitors`,
  },
  {
    key: "inquiries",
    label: "Total inquiries",
    icon: Send,
    color: C.inquiries,
    info: "Inquiry forms submitted in the period (each submission counts once).",
    value: (k) => fmtNumber(k.inquiries),
    sub: (k) => `from ${fmtNumber(k.inquirers)} people`,
  },
  {
    key: "conversion",
    label: "Inquiry conversion",
    icon: MousePointerClick,
    color: C.ocean,
    info: "Unique visitors who submitted at least one inquiry ÷ unique visitors × 100.",
    value: (k) => fmtPercent(k.conversion, 2),
    sub: (k) => `${fmtNumber(k.inquirers)} of ${fmtNumber(k.visitors)} visitors`,
    points: true,
  },
  {
    key: "qualified",
    label: "Qualified leads",
    icon: BadgeCheck,
    color: C.total,
    info: "Inquiries in the period currently marked qualified or converted by the sales team.",
    value: (k) => fmtNumber(k.qualified),
    sub: (k) => `${fmtPercent(k.inquiries ? k.qualified / k.inquiries : 0)} of inquiries`,
  },
];

const WIDE_COLS: Record<number, string> = { 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "2xl:grid-cols-6" };

export function KpiCards({ only }: { only?: (keyof Kpis)[] }) {
  const { data, range, prev, compare, service } = useDashboard();
  const cur = useMemo(() => kpis(data, range, service), [data, range, service]);
  const before = useMemo(() => (compare && prev ? kpis(data, prev, service) : null), [data, prev, compare, service]);
  const cards = only ? CARDS.filter((c) => only.includes(c.key)) : CARDS;

  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${WIDE_COLS[Math.min(cards.length, 6)] ?? ""}`}>
      {cards.map((c) => (
        <KpiCard key={c.key} def={c} cur={cur} before={before} compare={compare} />
      ))}
    </div>
  );
}

function KpiCard({ def, cur, before, compare }: { def: CardDef; cur: Kpis; before: Kpis | null; compare: boolean }) {
  const { data, range, service } = useDashboard();
  const spark = useMemo(() => sparkline(data, range, service, def.key), [data, range, service, def.key]);
  const delta = before ? (def.points ? cur[def.key] - before[def.key] : change(cur[def.key], before[def.key])) : null;
  const Icon = def.icon;
  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgb(19_28_32/0.04)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[0.8rem] font-medium text-gray-500">
          {def.label}
          <InfoTip text={def.info} />
        </h3>
        <span className="grid size-7 place-items-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-100">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-gray-900">{def.value(cur)}</p>
        {compare && <Delta value={delta} points={def.points} unavailable="The previous period falls before the start of recorded data" />}
      </div>
      {def.sub && <p className="mt-0.5 text-[0.75rem] text-gray-500">{def.sub(cur)}</p>}
      <div className="mt-auto pt-3">
        <Sparkline data={spark} color={def.color} />
      </div>
    </article>
  );
}
