"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { servicePerformance, sourceBreakdown } from "@/lib/admin/analytics";
import { fmtNumber, fmtPercent } from "@/lib/admin/format";
import { BarList, C, ChartFrame, TooltipBox } from "../charts";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { KpiCards } from "../KpiCards";
import { TrafficCard, useTraffic } from "../blocks";
import { useExport } from "../useExport";
import { Card, CardHeader, Td, Th } from "../ui";

export function VisitorsPage() {
  const { data, range, service } = useDashboard();
  const traffic = useTraffic();
  const sources = useMemo(() => sourceBreakdown(data, range, service), [data, range, service]);
  const services = useMemo(() => servicePerformance(data, range).sort((a, b) => b.pageViews - a.pageViews), [data, range]);

  useExport("traffic-sources", sources, [
    { header: "Source", value: (r) => r.label },
    { header: "Visits", value: (r) => r.sessions },
    { header: "Share of visits", value: (r) => fmtPercent(r.share) },
    { header: "Unique visitors", value: (r) => r.visitors },
    { header: "Inquiries", value: (r) => r.inquiries },
    { header: "Inquiry conversion", value: (r) => fmtPercent(r.conversion, 2) },
  ]);

  return (
    <div className="space-y-5">
      <DemoNotice />
      <KpiCards only={["visitors", "newVisitors", "returningVisitors"]} />
      <TrafficCard traffic={traffic} />

      <Card>
        <CardHeader title="Source performance" description="Which channels bring visitors who go on to inquire" info="Conversion = unique visitors from the channel who submitted an inquiry in a visit started by that channel ÷ unique visitors from the channel." />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-y border-gray-100 bg-gray-50/60">
              <tr>
                <Th>Source</Th>
                <Th align="right">Visits</Th>
                <Th>Share</Th>
                <Th align="right">Visitors</Th>
                <Th align="right">Inquiries</Th>
                <Th align="right">Conversion</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60">
                  <Td className="font-medium text-gray-900">{s.label}</Td>
                  <Td align="right">{fmtNumber(s.sessions)}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-24 rounded-full bg-gray-100">
                        <span className="block h-1.5 rounded-full bg-teal-500" style={{ width: `${s.share * 100}%` }} />
                      </span>
                      <span className="text-[0.78rem] tabular-nums text-gray-500">{fmtPercent(s.share)}</span>
                    </span>
                  </Td>
                  <Td align="right">{fmtNumber(s.visitors)}</Td>
                  <Td align="right">{fmtNumber(s.inquiries)}</Td>
                  <Td align="right" className="font-medium text-gray-900">{fmtPercent(s.conversion, 2)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="New vs returning visitors" description="Unique visitors per period" />
          <div className="px-5 pb-5 pt-4">
            <ChartFrame height={260} empty={traffic.series.every((d) => !d.total)}>
              <BarChart data={traffic.series} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  cursor={{ fill: "rgb(16 86 101 / 0.05)" }}
                  content={(p) =>
                    p.active && p.payload?.length ? (
                      <TooltipBox
                        title={String(p.label)}
                        rows={[
                          { label: "New", value: fmtNumber(Number(p.payload[0].payload.newVisitors)), color: C.newVisitors },
                          { label: "Returning", value: fmtNumber(Number(p.payload[0].payload.returning)), color: C.returning },
                        ]}
                      />
                    ) : null
                  }
                />
                <Bar dataKey="newVisitors" stackId="v" fill={C.newVisitors} maxBarSize={28} isAnimationActive={false} />
                <Bar dataKey="returning" stackId="v" fill={C.returning} radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            </ChartFrame>
            <div className="mt-3 flex gap-4 text-[0.75rem] text-gray-600">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: C.newVisitors }} /> New</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: C.returning }} /> Returning</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Most viewed services" description="Visits that viewed each service page" />
          <div className="px-5 pb-5 pt-4">
            <BarList color={C.ocean} rows={services.map((s) => ({ label: s.label, value: s.pageViews }))} />
          </div>
        </Card>
      </div>
    </div>
  );
}
