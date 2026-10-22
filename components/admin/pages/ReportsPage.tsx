"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { crossServiceInquiries, inquiryRows, monthlyHistory, servicePerformance, sourceBreakdown } from "@/lib/admin/analytics";
import { downloadCsv, toCsv } from "@/lib/admin/csv";
import { sourceLabel } from "@/lib/admin/demoData";
import { fmtDay, fmtNumber, fmtPercent, isoDay } from "@/lib/admin/format";
import { CROSS_SERVICE_COLUMNS, CrossServiceTable } from "../CrossServiceTable";
import { CustomerDrawer } from "../CustomerDrawer";
import { useDashboard } from "../DashboardProvider";
import { DemoNotice } from "../DemoNotice";
import { INQUIRY_COLUMNS } from "../InquiryTable";
import { useExport } from "../useExport";
import { Button, Card, CardHeader } from "../ui";

export function ReportsPage() {
  const { data, range, service } = useDashboard();
  const [open, setOpen] = useState<string | null>(null);
  const cross = useMemo(() => crossServiceInquiries(data, range, service), [data, range, service]);
  const suffix = `${isoDay(range.start)}_to_${isoDay(range.end)}`;
  useExport("returning-different-services", cross, CROSS_SERVICE_COLUMNS);

  const reports: { title: string; description: string; rows: number; run: () => void }[] = [
    {
      title: "Service performance",
      description: "Visits, visitors, returning share, inquiries, qualified leads and conversion per service.",
      rows: 6,
      run: () => {
        const rows = servicePerformance(data, range);
        downloadCsv(`wildwoods-service-performance-${suffix}`, toCsv(rows, [
          { header: "Service", value: (r) => r.label },
          { header: "Page visits", value: (r) => r.pageViews },
          { header: "Visitors", value: (r) => r.visitors },
          { header: "Returning visitors", value: (r) => r.returning },
          { header: "Inquiries", value: (r) => r.inquiries },
          { header: "Qualified", value: (r) => r.qualified },
          { header: "Conversion", value: (r) => fmtPercent(r.conversion, 2) },
          { header: "Top sources", value: (r) => r.topSources.map(sourceLabel).join(" / ") },
        ]));
      },
    },
    {
      title: "Traffic sources",
      description: "Visits, unique visitors, inquiries and conversion for each acquisition channel.",
      rows: 6,
      run: () =>
        downloadCsv(`wildwoods-traffic-sources-${suffix}`, toCsv(sourceBreakdown(data, range, service), [
          { header: "Source", value: (r) => r.label },
          { header: "Visits", value: (r) => r.sessions },
          { header: "Visitors", value: (r) => r.visitors },
          { header: "Inquiries", value: (r) => r.inquiries },
          { header: "Conversion", value: (r) => fmtPercent(r.conversion, 2) },
        ])),
    },
    {
      title: "Lead pipeline",
      description: "Every inquiry in the period with customer, service, visit history, status and sales rep.",
      rows: inquiryRows(data, range, service).length,
      run: () => downloadCsv(`wildwoods-inquiries-${suffix}`, toCsv(inquiryRows(data, range, service), INQUIRY_COLUMNS)),
    },
    {
      title: "Monthly history",
      description: "Visitors, returning visitors and inquiries for every month on record.",
      rows: monthlyHistory(data, service).length,
      run: () =>
        downloadCsv(`wildwoods-monthly-history`, toCsv(monthlyHistory(data, service), [
          { header: "Month", value: (r) => r.label },
          { header: "From", value: (r) => fmtDay(r.start) },
          { header: "To", value: (r) => fmtDay(r.end) },
          { header: "Visitors", value: (r) => r.visitors },
          { header: "Returning", value: (r) => r.returning },
          { header: "Returning share", value: (r) => fmtPercent(r.returningShare) },
          { header: "Inquiries", value: (r) => r.inquiries },
        ])),
    },
  ];

  return (
    <div className="space-y-5">
      <DemoNotice />
      <Card>
        <CardHeader
          title="Returning Visitors Who Submitted Inquiries for Different Services"
          description={`${fmtNumber(cross.length)} service changes where the later inquiry falls in ${fmtDay(range.start)} – ${fmtDay(range.end)}`}
          action={
            <Button size="sm" onClick={() => downloadCsv(`wildwoods-returning-different-services-${suffix}`, toCsv(cross, CROSS_SERVICE_COLUMNS))} disabled={!cross.length}>
              <Download className="size-3.5" aria-hidden="true" /> CSV
            </Button>
          }
        />
        <div className="mt-3 pb-2">
          <CrossServiceTable rows={cross} onOpen={setOpen} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <ReportCard key={r.title} title={r.title} description={r.description} meta={`${fmtNumber(r.rows)} rows · current filters`}>
            <Button size="sm" onClick={r.run}>
              <Download className="size-3.5" aria-hidden="true" /> Download CSV
            </Button>
          </ReportCard>
        ))}
      </div>
      <CustomerDrawer customerId={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function ReportCard({ title, description, meta, children }: { title: string; description: string; meta: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgb(19_28_32/0.04)]">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-100">
        <FileSpreadsheet className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-[0.8rem] text-gray-500">{description}</p>
        <p className="mt-1 text-[0.72rem] text-gray-400">{meta}</p>
      </div>
      {children}
    </div>
  );
}
