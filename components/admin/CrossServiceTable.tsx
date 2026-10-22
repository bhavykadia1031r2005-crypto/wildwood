"use client";

import { ArrowRight } from "lucide-react";
import type { CrossServiceRow } from "@/lib/admin/analytics";
import { serviceLabel, sourceLabel } from "@/lib/admin/demoData";
import { fmtDay, fmtDuration } from "@/lib/admin/format";
import { EmptyState, StatusBadge, Td, Th } from "./ui";

export const CROSS_SERVICE_COLUMNS = [
  { header: "Customer", value: (r: CrossServiceRow) => r.name },
  { header: "Previous service", value: (r: CrossServiceRow) => serviceLabel(r.previousService) },
  { header: "Previous inquiry", value: (r: CrossServiceRow) => fmtDay(r.previousDay) },
  { header: "New service", value: (r: CrossServiceRow) => serviceLabel(r.newService) },
  { header: "New inquiry", value: (r: CrossServiceRow) => fmtDay(r.newDay) },
  { header: "Days between inquiries", value: (r: CrossServiceRow) => r.daysBetween },
  { header: "Returned via", value: (r: CrossServiceRow) => sourceLabel(r.returnSource) },
  { header: "Current lead status", value: (r: CrossServiceRow) => r.status },
];

/** "Returning visitors who submitted inquiries for different services." */
export function CrossServiceTable({ rows, onOpen }: { rows: CrossServiceRow[]; onOpen?: (customerId: string) => void }) {
  if (!rows.length) {
    return <EmptyState title="No cross-service inquiries in this period" description="A person appears here when a later inquiry is for a different service than their previous one. Try a longer date range." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px]">
        <thead className="border-y border-gray-100 bg-gray-50/60">
          <tr>
            <Th>Customer</Th>
            <Th>Service change</Th>
            <Th align="right">Time between</Th>
            <Th>Returned via</Th>
            <Th>New inquiry</Th>
            <Th>Lead status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={`${r.customerId}-${r.newDay}`} className="hover:bg-gray-50/60">
              <Td>
                {onOpen ? (
                  <button type="button" onClick={() => onOpen(r.customerId)} className="font-medium text-gray-900 underline-offset-4 hover:text-teal-600 hover:underline">
                    {r.name}
                  </button>
                ) : (
                  <span className="font-medium text-gray-900">{r.name}</span>
                )}
              </Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  <span className="text-gray-500">{serviceLabel(r.previousService)}</span>
                  <ArrowRight className="size-3.5 text-orange-500" aria-label="then" />
                  <span className="font-medium text-gray-900">{serviceLabel(r.newService)}</span>
                </span>
              </Td>
              <Td align="right">{fmtDuration(r.daysBetween)}</Td>
              <Td>{sourceLabel(r.returnSource)}</Td>
              <Td>{fmtDay(r.newDay)}</Td>
              <Td>
                <StatusBadge status={r.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
