"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Search } from "lucide-react";
import {
  crossServiceInquiries,
  customerProfile,
  daysToFirstInquiry,
  journeyCandidates,
  returningToInquiry,
  touchAttribution,
} from "@/lib/admin/analytics";
import { serviceLabel, sourceLabel } from "@/lib/admin/demoData";
import { fmtDay, fmtDuration, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { CROSS_SERVICE_COLUMNS, CrossServiceTable } from "../CrossServiceTable";
import { CustomerDrawer } from "../CustomerDrawer";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { JourneyTimeline } from "../JourneyTimeline";
import { useExport } from "../useExport";
import { Badge, Button, Card, CardHeader, EmptyState, StatCard, StatusBadge, Td, Th } from "../ui";

export function JourneyPage() {
  const { data, range, service } = useDashboard();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const candidates = useMemo(() => journeyCandidates(data, service), [data, service]);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => !q || c.name.toLowerCase().includes(q)).slice(0, 40);
  }, [candidates, query]);
  const selectedId = picked && candidates.some((c) => c.id === picked) ? picked : candidates[0]?.id ?? null;
  const profile = useMemo(() => (selectedId ? customerProfile(data, selectedId) : null), [data, selectedId]);

  const cross = useMemo(() => crossServiceInquiries(data, range, service), [data, range, service]);
  const firstInq = useMemo(() => daysToFirstInquiry(data, range, service), [data, range, service]);
  const rti = useMemo(() => returningToInquiry(data, range, service), [data, range, service]);
  const touches = useMemo(() => touchAttribution(data, service), [data, service]);

  useExport("cross-service-inquiries", cross, CROSS_SERVICE_COLUMNS);

  return (
    <div className="space-y-5">
      <DemoNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Identified customers" value={fmtNumber(candidates.length)} sub="matched by an inquiry form (all time)" info="A person is identified only after they submit their details. Earlier visits from the same browser are linked through the first-party visitor ID." />
        <StatCard label="Inquirers who visited before" value={fmtPercent(rti.inquirers ? rti.returningInquirers / rti.inquirers : 0)} sub={`${fmtNumber(rti.returningInquirers)} of ${fmtNumber(rti.inquirers)} in this period`} />
        <StatCard label="First visit → first inquiry" value={firstInq.median === null ? "—" : fmtDuration(firstInq.median)} sub="median, first inquiries in this period" />
        <StatCard label="Switched service" value={fmtNumber(cross.length)} sub="later inquiry for a different service" />
      </div>

      <Card>
        <CardHeader title="Journey explorer" description="Pick an identified customer to see every recorded visit, service and inquiry in order" />
        <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="border-b border-gray-100 p-4 lg:border-b-0 lg:border-r">
            <label className="relative block">
              <span className="sr-only">Search customers</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers"
                className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
              />
            </label>
            <ul className="mt-3 max-h-[520px] space-y-0.5 overflow-y-auto pr-1" aria-label="Customers">
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(c.id)}
                    aria-current={c.id === selectedId ? "true" : undefined}
                    className={cn("w-full rounded-lg px-3 py-2 text-left transition-colors", c.id === selectedId ? "bg-teal-50" : "hover:bg-gray-50")}
                  >
                    <span className={cn("block truncate text-sm font-medium", c.id === selectedId ? "text-teal-600" : "text-gray-900")}>{c.name}</span>
                    <span className="block text-[0.72rem] text-gray-500">
                      {c.visits} visits · {c.inquiries} {c.inquiries === 1 ? "inquiry" : "inquiries"} · last {fmtDay(c.lastDay)}
                    </span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <EmptyState title="No customers match" className="py-6" />}
            </ul>
          </div>

          <div className="p-5">
            {profile ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{profile.customer.name}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge tone="teal"><BadgeCheck className="size-3" aria-hidden="true" /> Verified via inquiry</Badge>
                      <span className="text-[0.75rem] text-gray-500">
                        {profile.anonymousVisitsBeforeInquiry} earlier anonymous {profile.anonymousVisitsBeforeInquiry === 1 ? "visit" : "visits"} linked by visitor ID
                      </span>
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setOpen(profile.customer.id)}>
                    Open full profile <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { k: "First touch", v: sourceLabel(profile.firstTouch) },
                    { k: "Latest touch", v: sourceLabel(profile.latestTouch) },
                    { k: "First visit", v: fmtDay(profile.firstSeen) },
                    { k: "Most recent visit", v: fmtDay(profile.lastSeen) },
                    { k: "Recorded visits", v: fmtNumber(profile.sessions.length) },
                    { k: "Avg. time between visits", v: profile.avgGap === null ? "—" : fmtDuration(Math.round(profile.avgGap)) },
                    { k: "First visit → inquiry", v: profile.daysToFirstInquiry === null ? "—" : fmtDuration(profile.daysToFirstInquiry) },
                    { k: "Inquiries", v: fmtNumber(profile.inquiries.length) },
                  ].map((x) => (
                    <div key={x.k} className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <dt className="text-[0.7rem] text-gray-500">{x.k}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">{x.v}</dd>
                    </div>
                  ))}
                </dl>

                {profile.inquiries.length > 1 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-orange-200 bg-orange-100/30 px-3.5 py-2.5 text-[0.82rem] text-gray-700">
                    <span className="font-semibold text-gray-900">Service changes:</span>
                    {profile.inquiries.map((i, k) => (
                      <span key={i.id} className="inline-flex items-center gap-2">
                        {k > 0 && <ArrowRight className="size-3.5 text-orange-500" aria-label="then" />}
                        <span>
                          {serviceLabel(i.service)} <span className="text-gray-400">({fmtDay(i.day)})</span>
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <JourneyTimeline events={profile.events} />
                  <div className="space-y-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Services viewed</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {profile.servicesViewed.map((s) => <Badge key={s} tone="ocean">{serviceLabel(s)}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Inquiries</p>
                      <ul className="mt-2 space-y-2">
                        {profile.inquiries.map((i) => (
                          <li key={i.id} className="rounded-lg border border-gray-200 px-3 py-2">
                            <p className="text-sm font-medium text-gray-900">{serviceLabel(i.service)}</p>
                            <p className="mb-1.5 text-[0.72rem] text-gray-500">{fmtDay(i.day)} · {i.id}</p>
                            <StatusBadge status={i.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No identified customers for this filter" />
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Returning visitors who submitted inquiries for different services"
          description="Later inquiry in the selected period, for a different service than the person's previous inquiry"
        />
        <div className="mt-3 pb-2">
          <CrossServiceTable rows={cross} onOpen={setOpen} />
        </div>
      </Card>

      <Card>
        <CardHeader title="First-touch vs latest-touch" description="How identified customers first found the site, and how they came back most recently (all time)" />
        <div className="mt-3 overflow-x-auto pb-2">
          <table className="w-full min-w-[520px]">
            <thead className="border-y border-gray-100 bg-gray-50/60">
              <tr>
                <Th>Source</Th>
                <Th align="right">First touch</Th>
                <Th align="right">Latest touch</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {touches.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium text-gray-900">{t.label}</Td>
                  <Td align="right">{fmtNumber(t.first)}</Td>
                  <Td align="right">{fmtNumber(t.latest)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CustomerDrawer customerId={open} onClose={() => setOpen(null)} />
    </div>
  );
}
