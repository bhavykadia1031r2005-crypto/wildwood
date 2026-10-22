"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { cohorts, longGapReturns, monthlyHistory, repeatInquiryStats, yearOverYear } from "@/lib/admin/analytics";
import { DEMO_END_DAY, serviceLabel } from "@/lib/admin/demoData";
import { fmtDuration, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { C, ColumnChart, Heatmap, ShareLine } from "../charts";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { useExport } from "../useExport";
import { Card, CardHeader, Delta, StatCard } from "../ui";

const MAX_OFFSET = 12;

export function CohortsPage() {
  const { data, service } = useDashboard();
  const rows = useMemo(() => cohorts(data, service, MAX_OFFSET), [data, service]);
  const history = useMemo(() => monthlyHistory(data, service), [data, service]);
  const repeat = useMemo(() => repeatInquiryStats(data), [data]);
  const yoy = useMemo(() => yearOverYear(data, service), [data, service]);
  const gaps = useMemo(() => longGapReturns(data, { start: 0, end: DEMO_END_DAY }, service), [data, service]);

  useExport("cohort-retention", rows, [
    { header: "Cohort (first-visit month)", value: (r) => r.label },
    { header: "Visitors", value: (r) => r.size },
    ...Array.from({ length: MAX_OFFSET }, (_, i) => ({ header: `Month ${i + 1}`, value: (r: (typeof rows)[number]) => (r.cells[i] === null ? "" : fmtPercent(r.cells[i]!, 1)) })),
  ]);

  return (
    <div className="space-y-5">
      <DemoNotice />
      <Card>
        <CardHeader
          title="Monthly cohorts"
          description="Visitors grouped by first-visit month · share active again N months later"
          info="Cohorts use the full recorded history, so they ignore the date range. The service filter limits cohorts to visitors who viewed that service. Grey cells haven't happened yet."
        />
        <div className="px-5 pb-5 pt-4">
          <Heatmap rows={rows} maxOffset={MAX_OFFSET} />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Monthly retention trend" description="Returning visitors as a share of each month's visitors" />
          <div className="px-5 pb-5 pt-4">
            <ShareLine data={history.map((m) => ({ label: m.label, value: m.returningShare }))} label="Returning share" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Visitors by month" description="Unique visitors (first and last month are partial)" />
          <div className="px-5 pb-5 pt-4">
            <ColumnChart data={history.map((m) => ({ label: m.label, visitors: m.visitors }))} dataKey="visitors" color={C.total} valueLabel="Visitors" />
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers with repeat inquiries" value={fmtNumber(repeat.repeatCustomers)} sub={`of ${fmtNumber(repeat.customers)} identified customers`} />
        <StatCard label="Avg. time between inquiries" value={repeat.avgDaysBetween === null ? "—" : fmtDuration(Math.round(repeat.avgDaysBetween))} sub="for people who inquired more than once" />
        <StatCard label="Repeat lead conversion" value={repeat.repeatConversion === null ? "—" : fmtPercent(repeat.repeatConversion)} sub="repeat inquirers with a later inquiry converted" />
        <StatCard label="Back after a year+" value={fmtNumber(gaps.find((g) => g.days === 365)?.visitors ?? 0)} sub="visitors returning after 365+ days away" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader title="Long-gap returns" description="All recorded history" />
          <ul className="divide-y divide-gray-100 px-5 pb-4 pt-2">
            {gaps.map((g) => (
              <li key={g.days} className="flex items-center justify-between py-3 text-sm">
                <span className="text-gray-600">Returned after {g.days >= 365 ? "1 year+" : `${g.days}+ days`}</span>
                <span className="font-semibold tabular-nums text-gray-900">{fmtNumber(g.visitors)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Common service combinations" description="Services the same person inquired about" />
          <ul className="divide-y divide-gray-100 px-5 pb-4 pt-2">
            {repeat.combos.length === 0 && <li className="py-3 text-sm text-gray-500">No multi-service customers yet.</li>}
            {repeat.combos.slice(0, 6).map((c) => (
              <li key={`${c.a}-${c.b}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="text-gray-700">
                  {serviceLabel(c.a)} <span className="text-gray-400">+</span> {serviceLabel(c.b)}
                </span>
                <span className="font-semibold tabular-nums text-gray-900">{c.count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Year over year" description="Same calendar span, where both years exist" />
          <div className="px-5 pb-5 pt-4">
            {yoy ? (
              <>
                <p className="text-[0.8rem] text-gray-500">{yoy.label}</p>
                <dl className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Visitors</dt>
                    <dd className="flex items-center gap-2 text-sm font-semibold tabular-nums text-gray-900">
                      {fmtNumber(yoy.current.visitors)} <span className="font-normal text-gray-400">vs {fmtNumber(yoy.previous.visitors)}</span>
                      <Delta value={yoy.visitorsChange} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Inquiries</dt>
                    <dd className="flex items-center gap-2 text-sm font-semibold tabular-nums text-gray-900">
                      {fmtNumber(yoy.current.inquiries)} <span className="font-normal text-gray-400">vs {fmtNumber(yoy.previous.inquiries)}</span>
                      <Delta value={yoy.inquiriesChange} />
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-gray-500">Not enough history for a year-over-year comparison.</p>
            )}
            <p className="mt-4 flex gap-1.5 text-[0.75rem] text-gray-500">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Full year-over-year trends need 24 months of data. Recorded history starts Sep 22, 2025, so only this span overlaps.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
