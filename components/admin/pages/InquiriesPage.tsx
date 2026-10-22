"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { buckets, change, inquiryRows, inquiryStats, rangeLength } from "@/lib/admin/analytics";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/admin/demoData";
import { fmtNumber, fmtPercent } from "@/lib/admin/format";
import { formatHours } from "@/lib/admin/analytics";
import { autoGranularity } from "../blocks";
import { C, ChartFrame, TooltipBox } from "../charts";
import { CustomerDrawer } from "../CustomerDrawer";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { INQUIRY_COLUMNS, InquiryTable, useInquiryTable } from "../InquiryTable";
import { useExport } from "../useExport";
import { Card, CardHeader, StatCard } from "../ui";

const STATUS_COLOR: Record<LeadStatus, string> = {
  pending: "#FFD400",
  contacted: "#087D9C",
  qualified: "#12B9D0",
  converted: "#105665",
  lost: "#c9d2d5",
};

export function InquiriesPage() {
  const { data, range, prev, compare, service } = useDashboard();
  const [open, setOpen] = useState<string | null>(null);
  const stats = useMemo(() => inquiryStats(data, range, service), [data, range, service]);
  const before = useMemo(() => (compare && prev ? inquiryStats(data, prev, service) : null), [data, prev, compare, service]);
  const rows = useMemo(() => inquiryRows(data, range, service), [data, range, service]);
  const table = useInquiryTable(rows);
  const visitors = useMemo(() => {
    const ids = new Set<string>();
    for (let d = range.start; d <= range.end; d++) for (const s of data.sessionsByDay[d] ?? []) if (service === "all" || s.services.includes(service)) ids.add(s.visitorId);
    return ids.size;
  }, [data, range, service]);

  const trend = useMemo(() => {
    const g = autoGranularity(rangeLength(range));
    return buckets(range, g === "day" && rangeLength(range) > 14 ? "week" : g).map((b) => {
      const inBucket = data.inquiries.filter((i) => i.day >= b.start && i.day <= b.end && (service === "all" || i.service === service));
      return {
        label: b.label,
        ...(Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, inBucket.filter((i) => i.status === s.id).length])) as Record<LeadStatus, number>),
      };
    });
  }, [data, range, service]);

  useExport("inquiries", table.filtered, INQUIRY_COLUMNS);

  return (
    <div className="space-y-5">
      <DemoNotice />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Inquiries" value={fmtNumber(stats.total)} delta={compare ? change(stats.total, before?.total) : undefined} />
        <StatCard label="Unique people" value={fmtNumber(stats.unique)} sub="submitted at least one inquiry" delta={compare ? change(stats.unique, before?.unique) : undefined} />
        <StatCard label="Inquiry conversion" value={fmtPercent(visitors ? stats.unique / visitors : 0, 2)} sub={`of ${fmtNumber(visitors)} unique visitors`} info="Unique visitors with ≥1 inquiry ÷ unique visitors × 100." />
        <StatCard label="Qualified leads" value={fmtNumber(stats.qualified)} sub={`${fmtPercent(stats.total ? stats.qualified / stats.total : 0)} of inquiries`} delta={compare ? change(stats.qualified, before?.qualified) : undefined} />
        <StatCard label="Avg. first response" value={stats.avgResponseHours === null ? "—" : formatHours(stats.avgResponseHours)} sub="from submission to first contact" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader title="Lead pipeline" description="Current status of inquiries in this period" />
          <div className="px-5 pb-5 pt-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
              {LEAD_STATUSES.map((s) =>
                stats.byStatus[s.id] ? <span key={s.id} style={{ width: `${(stats.byStatus[s.id] / stats.total) * 100}%`, background: STATUS_COLOR[s.id] }} /> : null,
              )}
            </div>
            <ul className="mt-4 space-y-2.5">
              {LEAD_STATUSES.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="size-2.5 rounded-sm" style={{ background: STATUS_COLOR[s.id] }} aria-hidden="true" />
                    {s.label}
                  </span>
                  <span className="tabular-nums text-gray-900">
                    <strong className="font-semibold">{fmtNumber(stats.byStatus[s.id])}</strong>
                    <span className="ml-2 text-[0.75rem] text-gray-400">{fmtPercent(stats.total ? stats.byStatus[s.id] / stats.total : 0, 0)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Inquiry trend" description="Inquiries per period, by current lead status" />
          <div className="px-5 pb-5 pt-4">
            <ChartFrame height={240} empty={!stats.total}>
              <BarChart data={trend} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgb(16 86 101 / 0.05)" }}
                  content={(p) =>
                    p.active && p.payload?.length ? (
                      <TooltipBox
                        title={String(p.label)}
                        rows={LEAD_STATUSES.map((s) => ({ label: s.label, value: fmtNumber(Number(p.payload[0].payload[s.id])), color: STATUS_COLOR[s.id] }))}
                      />
                    ) : null
                  }
                />
                {LEAD_STATUSES.map((s, i) => (
                  <Bar key={s.id} dataKey={s.id} stackId="s" fill={STATUS_COLOR[s.id]} maxBarSize={30} isAnimationActive={false} radius={i === LEAD_STATUSES.length - 1 ? [3, 3, 0, 0] : undefined} />
                ))}
              </BarChart>
            </ChartFrame>
          </div>
        </Card>
      </div>

      <InquiryTable table={table} total={rows.length} onOpen={setOpen} />
      <CustomerDrawer customerId={open} onClose={() => setOpen(null)} />
    </div>
  );
}
