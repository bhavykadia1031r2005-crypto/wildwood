"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  rangeLength,
  returnWindows,
  returningToInquiry,
  servicePerformance,
  sourceBreakdown,
  trafficSeries,
  type Granularity,
} from "@/lib/admin/analytics";
import { serviceLabel } from "@/lib/admin/demoData";
import { fmtDay, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { BarList, C, TrafficChart } from "./charts";
import { useDashboard } from "./DashboardProvider";
import { Badge, Card, CardHeader, EmptyState, Segmented, StatusBadge } from "./ui";

export const autoGranularity = (days: number): Granularity => (days <= 31 ? "day" : days <= 120 ? "week" : "month");

const GRAN_OPTIONS: { id: Granularity; label: string }[] = [
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
];

export function useTraffic() {
  const { data, range, service, compare } = useDashboard();
  const [override, setOverride] = useState<{ g: Granularity; key: string } | null>(null);
  const key = `${range.start}-${range.end}`;
  // A manual choice sticks until the date range changes.
  const gran = override && override.key === key ? override.g : autoGranularity(rangeLength(range));
  const series = useMemo(() => trafficSeries(data, range, gran, service, compare), [data, range, gran, service, compare]);
  return { gran, setGran: (g: Granularity) => setOverride({ g, key }), series };
}

export function TrafficCard({ className, traffic }: { className?: string; traffic: ReturnType<typeof useTraffic> }) {
  const { compare, prev } = useDashboard();
  const { gran, setGran, series } = traffic;
  return (
    <Card className={className}>
      <CardHeader
        title="Visitors & inquiries"
        description={compare && !prev ? "Previous period is outside recorded history" : "Unique visitors per period, with inquiry submissions"}
        info="New: first recorded visit in the bucket. Returning: visited before the bucket. Inquiries use the right-hand axis."
        action={<Segmented label="Aggregation" value={gran} onChange={setGran} options={GRAN_OPTIONS} />}
      />
      <div className="px-5 pb-5 pt-3">
        <TrafficChart data={series} compare={compare} />
      </div>
    </Card>
  );
}

export function SourcesCard({ className }: { className?: string }) {
  const { data, range, service } = useDashboard();
  const rows = useMemo(() => sourceBreakdown(data, range, service), [data, range, service]);
  return (
    <Card className={className}>
      <CardHeader title="Traffic sources" description="Visits by acquisition channel" info="Each visit is attributed to the channel that started it (UTM parameters, referrer or direct)." />
      <div className="px-5 pb-5 pt-4">
        <BarList
          rows={rows.map((r) => ({ label: r.label, value: r.sessions, hint: fmtPercent(r.conversion, 1) }))}
          secondary={(r) => <span className="text-[0.72rem] text-gray-400">{r.hint} conv.</span>}
        />
      </div>
    </Card>
  );
}

export function ReturningSnapshot({ className }: { className?: string }) {
  const { data, range, service } = useDashboard();
  const windows = useMemo(() => returnWindows(data, range, service), [data, range, service]);
  const rti = useMemo(() => returningToInquiry(data, range, service), [data, range, service]);
  return (
    <Card className={className}>
      <CardHeader
        title="Returning visitors"
        description="Visitors first seen in the last 12 months who came back within…"
        info="Rolling 12-month cohort ending with the selected period. Only visitors with enough follow-up time before the latest data are counted."
        action={
          <Link href="/admin/retention" className="inline-flex items-center gap-1 text-[0.8rem] font-medium text-ocean-600 hover:text-teal-600">
            Retention <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      <div className="space-y-2.5 px-5 pb-4 pt-4">
        {windows.map((w) => (
          <div key={w.days} className="grid grid-cols-[72px_1fr_56px] items-center gap-3 text-[0.82rem]">
            <span className="text-gray-600">{w.label}</span>
            <div className="h-2 rounded-full bg-gray-100">
              {w.rate !== null && <div className="h-2 rounded-full" style={{ width: `${Math.min(100, w.rate * 100 * 2)}%`, background: C.returning }} />}
            </div>
            <span className="text-right font-semibold tabular-nums text-gray-900" title={w.rate === null ? "Not enough follow-up time yet" : `${w.returned} of ${w.eligible}`}>
              {w.rate === null ? "—" : fmtPercent(w.rate)}
            </span>
          </div>
        ))}
      </div>
      <div className="mx-5 mb-5 rounded-lg bg-gray-50 px-3.5 py-3 text-[0.82rem] text-gray-600">
        <strong className="font-semibold text-gray-900">{fmtNumber(rti.returningInquirers)}</strong> of {fmtNumber(rti.inquirers)} people who inquired had visited before.
      </div>
    </Card>
  );
}

export function ServiceSnapshot({ className }: { className?: string }) {
  const { data, range } = useDashboard();
  const rows = useMemo(() => servicePerformance(data, range).sort((a, b) => b.inquiries - a.inquiries), [data, range]);
  return (
    <Card className={className}>
      <CardHeader
        title="Services"
        description="Inquiries and conversion by service"
        action={
          <Link href="/admin/services" className="inline-flex items-center gap-1 text-[0.8rem] font-medium text-ocean-600 hover:text-teal-600">
            All services <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      <div className="px-5 pb-5 pt-4">
        <BarList
          color={C.inquiries}
          rows={rows.map((r) => ({ label: r.label, value: r.inquiries, hint: fmtPercent(r.conversion, 1) }))}
          secondary={(r) => <span className="text-[0.72rem] text-gray-400">{r.hint} conv.</span>}
          emptyLabel="No inquiries in this period"
        />
      </div>
    </Card>
  );
}

export function RecentInquiries({ className, onOpen }: { className?: string; onOpen: (customerId: string) => void }) {
  const { data, range, service } = useDashboard();
  const rows = useMemo(
    () => data.inquiries.filter((i) => i.day >= range.start && i.day <= range.end && (service === "all" || i.service === service)).slice(-6).reverse(),
    [data, range, service],
  );
  return (
    <Card className={className}>
      <CardHeader
        title="Recent inquiries"
        action={
          <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-[0.8rem] font-medium text-ocean-600 hover:text-teal-600">
            View all <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="No inquiries in this period" />
      ) : (
        <ul className="mt-2 divide-y divide-gray-100 px-2 pb-2">
          {rows.map((i) => {
            const c = data.customerById.get(i.customerId)!;
            const returning = data.sessionById.get(i.sessionId)!.index > 0;
            return (
              <li key={i.id}>
                <button type="button" onClick={() => onOpen(c.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gray-100 text-[0.7rem] font-semibold text-gray-600">
                    {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900">{c.name}</span>
                    <span className="block truncate text-[0.75rem] text-gray-500">
                      {serviceLabel(i.service)} · {fmtDay(i.day)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={i.status} />
                    {returning && <Badge tone="orange">Returning</Badge>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
