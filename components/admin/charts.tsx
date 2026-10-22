"use client";

import { useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { SeriesPoint } from "@/lib/admin/analytics";
import { fmtCompact, fmtDay, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { EmptyState, Skeleton, useMounted } from "./ui";

export const C = {
  total: "#105665",
  newVisitors: "#12B9D0",
  returning: "#F47B20",
  inquiries: "#F15A24",
  previous: "#98a6ab",
  grid: "#edf1f2",
  axis: "#6a7a80",
  ocean: "#087D9C",
  sun: "#FFD400",
} as const;

const AXIS = { fontSize: 11, fill: C.axis };

/** Measures after hydration; shows a skeleton until then. */
export function ChartFrame({ height, children, empty }: { height: number; children: ReactNode; empty?: boolean }) {
  const mounted = useMounted();
  if (empty) {
    return (
      <div style={{ height }} className="grid place-items-center">
        <EmptyState icon={<BarChart3 className="size-5" />} title="No data for this selection" description="Try a longer date range or a different service." />
      </div>
    );
  }
  if (!mounted) return <Skeleton className="w-full" style={{ height }} />;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data, color = C.total }: { data: { v: number }[]; color?: string }) {
  const mounted = useMounted();
  if (!mounted) return <Skeleton className="h-9 w-full" />;
  const id = `spark-${color.slice(1)}`;
  return (
    <div className="h-9 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 120, height: 36 }}>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={`url(#${id})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; dashed?: boolean }[] }) {
  return (
    <div className="min-w-44 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[0.78rem] shadow-[0_8px_24px_-6px_rgb(19_28_32/0.2)]">
      <p className="mb-1.5 font-semibold text-gray-900">{title}</p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-gray-600">
              {r.color && (
                <span
                  aria-hidden="true"
                  className={cn("h-0.5 w-3 rounded-full", r.dashed && "bg-transparent")}
                  style={r.dashed ? { borderTop: `2px dashed ${r.color}` } : { background: r.color }}
                />
              )}
              {r.label}
            </span>
            <span className="font-semibold tabular-nums text-gray-900">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SeriesKey = "total" | "newVisitors" | "returning" | "inquiries";
const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "total", label: "Total visitors", color: C.total },
  { key: "newVisitors", label: "New", color: C.newVisitors },
  { key: "returning", label: "Returning", color: C.returning },
  { key: "inquiries", label: "Inquiries", color: C.inquiries },
];

/** Visitors (left axis) and inquiries (right axis) with optional previous-period overlay. */
export function TrafficChart({ data, compare, height = 300 }: { data: SeriesPoint[]; compare: boolean; height?: number }) {
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const toggle = (k: SeriesKey) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  const hasPrev = compare && data.some((d) => d.prevTotal !== undefined);
  const empty = data.every((d) => d.total === 0 && d.inquiries === 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Show or hide series">
        {SERIES.map((s) => {
          const on = !hidden.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.75rem] font-medium transition-colors",
                on ? "border-gray-200 bg-white text-gray-700" : "border-dashed border-gray-200 bg-gray-50 text-gray-400",
              )}
            >
              <span aria-hidden="true" className={cn("size-2 rounded-sm", s.key === "inquiries" && "rounded-full")} style={{ background: on ? s.color : "#c9d2d5" }} />
              {s.label}
            </button>
          );
        })}
        {hasPrev && (
          <span className="ml-1 inline-flex items-center gap-1.5 text-[0.75rem] text-gray-500">
            <span aria-hidden="true" className="w-4" style={{ borderTop: `2px dashed ${C.previous}` }} />
            Previous period
          </span>
        )}
      </div>
      <ChartFrame height={height} empty={empty}>
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="fill-total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.total} stopOpacity={0.14} />
              <stop offset="100%" stopColor={C.total} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis yAxisId="v" tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => fmtCompact(v)} />
          <YAxis yAxisId="i" orientation="right" tick={AXIS} tickLine={false} axisLine={false} width={32} allowDecimals={false} hide={hidden.has("inquiries")} />
          <Tooltip
            cursor={{ fill: "rgb(16 86 101 / 0.05)" }}
            content={(p) => {
              if (!p.active || !p.payload?.length) return null;
              const d = p.payload[0].payload as SeriesPoint;
              const title = d.start === d.end ? fmtDay(d.start) : `${fmtDay(d.start)} – ${fmtDay(d.end)}`;
              return (
                <TooltipBox
                  title={title}
                  rows={[
                    ...SERIES.filter((s) => !hidden.has(s.key)).map((s) => ({ label: s.label, value: fmtNumber(d[s.key]), color: s.color })),
                    ...(hasPrev && d.prevTotal !== undefined ? [{ label: "Visitors (prev.)", value: fmtNumber(d.prevTotal), color: C.previous, dashed: true }] : []),
                    ...(hasPrev && d.prevInquiries !== undefined ? [{ label: "Inquiries (prev.)", value: fmtNumber(d.prevInquiries), color: C.previous, dashed: true }] : []),
                  ]}
                />
              );
            }}
          />
          {!hidden.has("inquiries") && <Bar yAxisId="i" dataKey="inquiries" fill={C.inquiries} fillOpacity={0.45} radius={[3, 3, 0, 0]} maxBarSize={10} isAnimationActive={false} />}
          {!hidden.has("total") && <Area yAxisId="v" type="monotone" dataKey="total" stroke={C.total} strokeWidth={2} fill="url(#fill-total)" isAnimationActive={false} dot={false} activeDot={{ r: 3.5 }} />}
          {!hidden.has("newVisitors") && <Line yAxisId="v" type="monotone" dataKey="newVisitors" stroke={C.newVisitors} strokeWidth={1.8} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />}
          {!hidden.has("returning") && <Line yAxisId="v" type="monotone" dataKey="returning" stroke={C.returning} strokeWidth={1.8} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />}
          {hasPrev && !hidden.has("total") && <Line yAxisId="v" type="monotone" dataKey="prevTotal" stroke={C.previous} strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
        </ComposedChart>
      </ChartFrame>
    </div>
  );
}

/** Accessible horizontal bar list (no chart library needed). */
export function BarList({
  rows,
  format = fmtNumber,
  color = C.total,
  secondary,
  emptyLabel = "No data for this selection",
}: {
  rows: { label: string; value: number; hint?: string }[];
  format?: (n: number) => string;
  color?: string;
  secondary?: (row: { label: string; value: number; hint?: string }) => ReactNode;
  emptyLabel?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 0);
  if (!max) return <EmptyState title={emptyLabel} className="py-6" />;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[0.82rem]">
            <span className="truncate font-medium text-gray-700">{r.label}</span>
            <span className="flex shrink-0 items-baseline gap-2">
              {secondary?.(r)}
              <span className="font-semibold tabular-nums text-gray-900">{format(r.value)}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full transition-[width] duration-500" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Simple vertical bar chart for distributions. */
export function ColumnChart({
  data,
  dataKey,
  color = C.total,
  height = 220,
  valueLabel,
  format = fmtNumber,
}: {
  data: { label: string; [k: string]: number | string | null }[];
  dataKey: string;
  color?: string;
  height?: number;
  valueLabel: string;
  format?: (n: number) => string;
}) {
  const empty = data.every((d) => !d[dataKey]);
  return (
    <ChartFrame height={height} empty={empty}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -6 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval={data.length > 8 ? "preserveStartEnd" : 0} minTickGap={8} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => format(v)} />
        <Tooltip
          cursor={{ fill: "rgb(16 86 101 / 0.05)" }}
          content={(p) =>
            p.active && p.payload?.length ? <TooltipBox title={String(p.label)} rows={[{ label: valueLabel, value: format(Number(p.payload[0].value)), color }]} /> : null
          }
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false} />
      </BarChart>
    </ChartFrame>
  );
}

/** Line chart of a ratio over time (e.g. returning-visitor share). */
export function ShareLine({ data, height = 220, color = C.returning, label }: { data: { label: string; value: number }[]; height?: number; color?: string; label: string }) {
  return (
    <ChartFrame height={height} empty={data.every((d) => !d.value)}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="fill-share" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.16} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => fmtPercent(v, 0)} />
        <Tooltip
          content={(p) =>
            p.active && p.payload?.length ? <TooltipBox title={String(p.label)} rows={[{ label, value: fmtPercent(Number(p.payload[0].value)), color }]} /> : null
          }
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#fill-share)" isAnimationActive={false} dot={{ r: 2.5, fill: color }} />
      </AreaChart>
    </ChartFrame>
  );
}

/** Cohort retention heatmap: rows are first-visit months, columns months since. */
export function Heatmap({ rows, maxOffset }: { rows: { key: string; label: string; size: number; cells: (number | null)[] }[]; maxOffset: number }) {
  const max = Math.max(0.0001, ...rows.flatMap((r) => r.cells.filter((c): c is number => c !== null)));
  if (!rows.length) return <EmptyState title="No cohorts for this selection" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-1 text-[0.75rem]">
        <caption className="sr-only">Share of each first-visit cohort that returned in later months</caption>
        <thead>
          <tr className="text-gray-500">
            <th scope="col" className="w-24 text-left font-medium">Cohort</th>
            <th scope="col" className="w-16 text-right font-medium">Visitors</th>
            {Array.from({ length: maxOffset }, (_, i) => (
              <th key={i} scope="col" className="font-medium">
                M{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="whitespace-nowrap text-left font-medium text-gray-700">{r.label}</th>
              <td className="pr-1 text-right tabular-nums text-gray-500">{fmtNumber(r.size)}</td>
              {r.cells.map((c, i) =>
                c === null ? (
                  <td key={i} className="rounded bg-gray-50" aria-label="Not yet available" />
                ) : (
                  <td
                    key={i}
                    className={cn("h-8 rounded text-center font-medium tabular-nums", c / max > 0.55 ? "text-white" : "text-gray-800")}
                    style={{ background: `rgb(16 86 101 / ${0.06 + (c / max) * 0.88})` }}
                    title={`${r.label} cohort · month ${i + 1}: ${fmtPercent(c)}`}
                  >
                    {fmtPercent(c, c < 0.1 ? 1 : 0)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
