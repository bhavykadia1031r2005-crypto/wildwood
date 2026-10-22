"use client";

import { useState } from "react";
import { fmtDay } from "@/lib/admin/format";
import { CustomerDrawer } from "../CustomerDrawer";
import { KpiCards } from "../KpiCards";
import { useExport } from "../useExport";
import { RecentInquiries, ReturningSnapshot, ServiceSnapshot, SourcesCard, TrafficCard, useTraffic } from "../blocks";
import { DemoNotice } from "../DemoNotice";

export function OverviewPage() {
  const [open, setOpen] = useState<string | null>(null);
  const traffic = useTraffic();
  const { series } = traffic;
  useExport("overview-traffic", series, [
    { header: "Period start", value: (r) => fmtDay(r.start) },
    { header: "Period end", value: (r) => fmtDay(r.end) },
    { header: "Total visitors", value: (r) => r.total },
    { header: "New visitors", value: (r) => r.newVisitors },
    { header: "Returning visitors", value: (r) => r.returning },
    { header: "Inquiries", value: (r) => r.inquiries },
    { header: "Visitors (previous period)", value: (r) => r.prevTotal },
  ]);

  return (
    <div className="space-y-5">
      <DemoNotice />
      <KpiCards />
      <div className="grid gap-5 xl:grid-cols-3">
        <TrafficCard className="xl:col-span-2" traffic={traffic} />
        <SourcesCard />
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <ReturningSnapshot />
        <ServiceSnapshot />
        <RecentInquiries onOpen={setOpen} className="lg:col-span-2 xl:col-span-1" />
      </div>
      <CustomerDrawer customerId={open} onClose={() => setOpen(null)} />
    </div>
  );
}
