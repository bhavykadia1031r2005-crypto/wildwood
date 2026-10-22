"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Fingerprint, UserCheck } from "lucide-react";
import {
  daysToFirstInquiry,
  kpis,
  longGapReturns,
  newVsReturning,
  rangeLength,
  retentionCohortRange,
  returnWindows,
  servicePerformance,
  trafficSeries,
  visitFrequency,
} from "@/lib/admin/analytics";
import { fmtDay, fmtDuration, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { autoGranularity } from "../blocks";
import { BarList, C, ColumnChart, ShareLine } from "../charts";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { useExport } from "../useExport";
import { Card, CardHeader, StatCard } from "../ui";

export function RetentionPage() {
  const { data, range, service } = useDashboard();
  const k = useMemo(() => kpis(data, range, service), [data, range, service]);
  const windows = useMemo(() => returnWindows(data, range, service), [data, range, service]);
  const freq = useMemo(() => visitFrequency(data, range, service), [data, range, service]);
  const firstInq = useMemo(() => daysToFirstInquiry(data, range, service), [data, range, service]);
  const nvr = useMemo(() => newVsReturning(data, range, service), [data, range, service]);
  const gaps = useMemo(() => longGapReturns(data, range, service), [data, range, service]);
  const services = useMemo(() => servicePerformance(data, range).sort((a, b) => b.returningShare - a.returningShare), [data, range]);
  const trend = useMemo(() => {
    const g = autoGranularity(rangeLength(range));
    return trafficSeries(data, range, g === "day" ? "week" : g, service, false).map((p) => ({ label: p.label, value: p.total ? p.returning / p.total : 0 }));
  }, [data, range, service]);
  const thirty = windows.find((w) => w.days === 30)!;
  const cohort = retentionCohortRange(range);

  useExport("retention-windows", windows, [
    { header: "Window", value: (w) => w.label },
    { header: "Eligible visitors", value: (w) => w.eligible },
    { header: "Returned", value: (w) => w.returned },
    { header: "Return rate", value: (w) => (w.rate === null ? "" : fmtPercent(w.rate)) },
  ]);

  return (
    <div className="space-y-5">
      <DemoNotice />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-100/60 text-orange-600"><Fingerprint className="size-4" aria-hidden="true" /></span>
          <div className="text-[0.82rem] text-gray-600">
            <p className="font-semibold text-gray-900">Returning visitor</p>
            A browser that comes back with the same first-party visitor ID (analytics consent given). It tells you the device returned — not who the person is.
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600"><UserCheck className="size-4" aria-hidden="true" /></span>
          <div className="text-[0.82rem] text-gray-600">
            <p className="font-semibold text-gray-900">Existing customer</p>
            Someone matched to a customer record because they identified themselves (an inquiry form or signed-in account). No anonymous visitor is identified by guesswork or fingerprinting.
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Returning visitors" value={fmtNumber(k.returningVisitors)} sub={`${fmtPercent(k.visitors ? k.returningVisitors / k.visitors : 0)} of ${fmtNumber(k.visitors)} visitors`} info="Active in the period, first recorded visit before it." />
        <StatCard label="Came back within 30 days" value={thirty.rate === null ? "—" : fmtPercent(thirty.rate)} sub={thirty.rate === null ? "Not enough follow-up time yet" : `${fmtNumber(thirty.returned)} of ${fmtNumber(thirty.eligible)} visitors`} info="Visitors first seen in the 12 months up to the end of the period, with at least 30 days of follow-up data." />
        <StatCard label="Returning → inquiry" value={fmtPercent(nvr.returning.conversion, 2)} sub={`vs ${fmtPercent(nvr.first.conversion, 2)} for first-time visitors`} info="Share of returning visitors in the period who submitted an inquiry." />
        <StatCard label="First visit → first inquiry" value={firstInq.median === null ? "—" : fmtDuration(firstInq.median)} sub={`median across ${fmtNumber(firstInq.total)} first inquiries`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Return rate by window"
            description={`Visitors first seen ${fmtDay(cohort.start)} – ${fmtDay(cohort.end)} who came back within…`}
            info="Rolling 12-month cohort ending with the selected period. Each window only counts visitors first seen early enough to have that much follow-up time."
          />
          <div className="px-5 pb-5 pt-4">
            <ColumnChart
              data={windows.map((w) => ({ label: w.label, rate: w.rate }))}
              dataKey="rate"
              color={C.returning}
              valueLabel="Returned"
              format={(n) => fmtPercent(n, 0)}
            />
            <ul className="mt-3 grid grid-cols-5 gap-2 text-center text-[0.72rem] text-gray-500">
              {windows.map((w) => (
                <li key={w.days}>{w.eligible ? `${fmtNumber(w.returned)}/${fmtNumber(w.eligible)}` : "no data yet"}</li>
              ))}
            </ul>
          </div>
        </Card>
        <Card>
          <CardHeader title="First-time vs returning" description="Behaviour in this period" />
          <div className="px-5 pb-5 pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[0.72rem] uppercase tracking-wider text-gray-500">
                  <th scope="col" className="pb-2 text-left font-semibold" />
                  <th scope="col" className="pb-2 text-right font-semibold">First-time</th>
                  <th scope="col" className="pb-2 text-right font-semibold">Returning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: "Visitors", a: fmtNumber(nvr.first.visitors), b: fmtNumber(nvr.returning.visitors) },
                  { label: "Avg. visits", a: nvr.first.avgVisits.toFixed(2), b: nvr.returning.avgVisits.toFixed(2) },
                  { label: "Inquired", a: fmtNumber(nvr.first.inquirers), b: fmtNumber(nvr.returning.inquirers) },
                  { label: "Conversion", a: fmtPercent(nvr.first.conversion, 2), b: fmtPercent(nvr.returning.conversion, 2) },
                ].map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="py-2.5 text-left font-medium text-gray-600">{row.label}</th>
                    <td className="py-2.5 text-right tabular-nums text-gray-900">{row.a}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-gray-900">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Returning visitor share" description="Returning ÷ total visitors per period" />
          <div className="px-5 pb-5 pt-4">
            <ShareLine data={trend} label="Returning share" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Visit frequency" description="Visitors by number of visits in this period" />
          <div className="px-5 pb-5 pt-4">
            <ColumnChart data={freq} dataKey="visitors" color={C.total} valueLabel="Visitors" />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader title="Days to first inquiry" description="From first recorded visit to first inquiry" info="People whose first-ever inquiry falls in the period." />
          <div className="px-5 pb-5 pt-4">
            <ColumnChart data={firstInq.bins} dataKey="people" color={C.inquiries} valueLabel="People" height={200} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Services that bring people back" description="Share of each service's visitors who are returning" />
          <div className="px-5 pb-5 pt-4">
            <BarList color={C.returning} format={(n) => fmtPercent(n)} rows={services.map((s) => ({ label: s.label, value: s.returningShare }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Long-gap returns" description="Visitors returning in this period after being away…" />
          <ul className="divide-y divide-gray-100 px-5 pb-3 pt-2">
            {gaps.map((g) => (
              <li key={g.days} className="flex items-center justify-between py-3 text-sm">
                <span className="text-gray-600">{g.days >= 365 ? "1 year or more" : `${g.days}+ days`}</span>
                <span className="font-semibold tabular-nums text-gray-900">{fmtNumber(g.visitors)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/cohorts" className="mx-5 mb-5 inline-flex items-center gap-1 text-[0.8rem] font-medium text-ocean-600 hover:text-teal-600">
            Monthly cohorts <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
