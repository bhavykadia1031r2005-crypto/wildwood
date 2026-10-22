"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { servicePerformance, type ServiceRow } from "@/lib/admin/analytics";
import { sourceLabel } from "@/lib/admin/demoData";
import { fmtNumber, fmtPercent } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { BarList, C, ChartFrame, TooltipBox } from "../charts";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { useExport } from "../useExport";
import { Badge, Card, CardHeader, Td, Th } from "../ui";

type SortKey = "visitors" | "pageViews" | "returningShare" | "inquiries" | "qualified" | "conversion";

export function ServicesPage() {
  const { data, range, service } = useDashboard();
  const all = useMemo(() => servicePerformance(data, range), [data, range]);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "inquiries", dir: "desc" });
  const rows = useMemo(
    () => [...all].sort((a, b) => (a[sort.key] - b[sort.key]) * (sort.dir === "asc" ? 1 : -1)),
    [all, sort],
  );
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
  const dir = (k: SortKey) => (sort.key === k ? sort.dir : null);

  useExport("service-performance", rows, [
    { header: "Service", value: (r: ServiceRow) => r.label },
    { header: "Service page visits", value: (r) => r.pageViews },
    { header: "Unique visitors", value: (r) => r.visitors },
    { header: "Returning visitors", value: (r) => r.returning },
    { header: "Returning share", value: (r) => fmtPercent(r.returningShare) },
    { header: "Inquiries", value: (r) => r.inquiries },
    { header: "Qualified leads", value: (r) => r.qualified },
    { header: "Inquiry conversion", value: (r) => fmtPercent(r.conversion, 2) },
    { header: "Top sources", value: (r) => r.topSources.map(sourceLabel).join(" / ") },
  ]);

  return (
    <div className="space-y-5">
      <DemoNotice />
      <Card>
        <CardHeader
          title="Service comparison"
          description={service === "all" ? "All services in the selected period" : "Highlighted: the service selected in the filter"}
          info="Visitors and conversion count visits that viewed the service page and inquiries submitted for that service."
        />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="border-y border-gray-100 bg-gray-50/60">
              <tr>
                <Th>Service</Th>
                <Th align="right" sort={dir("pageViews")} onSort={() => sortBy("pageViews")}>Page visits</Th>
                <Th align="right" sort={dir("visitors")} onSort={() => sortBy("visitors")}>Visitors</Th>
                <Th align="right" sort={dir("returningShare")} onSort={() => sortBy("returningShare")}>Returning</Th>
                <Th align="right" sort={dir("inquiries")} onSort={() => sortBy("inquiries")}>Inquiries</Th>
                <Th align="right" sort={dir("qualified")} onSort={() => sortBy("qualified")}>Qualified</Th>
                <Th align="right" sort={dir("conversion")} onSort={() => sortBy("conversion")}>Conversion</Th>
                <Th>Top sources</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className={cn("hover:bg-gray-50/60", service === r.id && "bg-turquoise-50/60")}>
                  <Td className="font-medium text-gray-900">{r.label}</Td>
                  <Td align="right">{fmtNumber(r.pageViews)}</Td>
                  <Td align="right">{fmtNumber(r.visitors)}</Td>
                  <Td align="right">
                    {fmtNumber(r.returning)} <span className="text-[0.75rem] text-gray-400">({fmtPercent(r.returningShare, 0)})</span>
                  </Td>
                  <Td align="right" className="font-medium text-gray-900">{fmtNumber(r.inquiries)}</Td>
                  <Td align="right">{fmtNumber(r.qualified)}</Td>
                  <Td align="right" className="font-medium text-gray-900">{fmtPercent(r.conversion, 2)}</Td>
                  <Td>
                    <span className="flex gap-1">
                      {r.topSources.map((s) => (
                        <Badge key={s}>{sourceLabel(s)}</Badge>
                      ))}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Inquiries by service" description="Total and qualified inquiries in this period" />
          <div className="px-5 pb-5 pt-4">
            <ChartFrame height={280} empty={rows.every((r) => !r.inquiries)}>
              <BarChart data={[...all].sort((a, b) => b.inquiries - a.inquiries)} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#38454a" }} tickLine={false} axisLine={false} width={150} />
                <Tooltip
                  cursor={{ fill: "rgb(16 86 101 / 0.05)" }}
                  content={(p) =>
                    p.active && p.payload?.length ? (
                      <TooltipBox
                        title={String(p.label)}
                        rows={[
                          { label: "Inquiries", value: fmtNumber(Number(p.payload[0].payload.inquiries)), color: C.inquiries },
                          { label: "Qualified", value: fmtNumber(Number(p.payload[0].payload.qualified)), color: C.total },
                        ]}
                      />
                    ) : null
                  }
                />
                <Bar dataKey="inquiries" fill={C.inquiries} fillOpacity={0.85} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
                <Bar dataKey="qualified" fill={C.total} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
              </BarChart>
            </ChartFrame>
            <div className="mt-2 flex gap-4 text-[0.75rem] text-gray-600">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: C.inquiries }} /> Inquiries</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: C.total }} /> Qualified</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Conversion by service" description="Visitors who inquired about the service" />
          <div className="px-5 pb-5 pt-4">
            <BarList color={C.ocean} format={(n) => fmtPercent(n, 2)} rows={[...all].sort((a, b) => b.conversion - a.conversion).map((r) => ({ label: r.label, value: r.conversion }))} />
          </div>
        </Card>
      </div>
    </div>
  );
}
