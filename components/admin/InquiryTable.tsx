"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { InquiryRow } from "@/lib/admin/analytics";
import { LEAD_STATUSES, serviceLabel, type LeadStatus } from "@/lib/admin/demoData";
import { fmtDay, fmtNumber } from "@/lib/admin/format";
import { Badge, Button, Card, CardHeader, EmptyState, Select, StatusBadge, Td, Th } from "./ui";

type SortKey = "submitted" | "name" | "service" | "firstVisit" | "latestVisit" | "visits" | "status";

export const INQUIRY_COLUMNS = [
  { header: "Inquiry ID", value: (r: InquiryRow) => r.id },
  { header: "Customer name", value: (r: InquiryRow) => r.name },
  { header: "Email", value: (r: InquiryRow) => r.email },
  { header: "Company", value: (r: InquiryRow) => r.company ?? "" },
  { header: "Service requested", value: (r: InquiryRow) => serviceLabel(r.service) },
  { header: "First visit", value: (r: InquiryRow) => fmtDay(r.firstVisit) },
  { header: "Latest visit", value: (r: InquiryRow) => fmtDay(r.latestVisit) },
  { header: "Submitted", value: (r: InquiryRow) => fmtDay(r.submitted) },
  { header: "Visitor type", value: (r: InquiryRow) => (r.visitorType === "new" ? "New" : "Returning") },
  { header: "Recorded visits", value: (r: InquiryRow) => r.visits },
  { header: "Lead status", value: (r: InquiryRow) => r.status },
  { header: "Sales rep", value: (r: InquiryRow) => r.rep },
];

/** Filtering, sorting and pagination are applied to `rows`; the filtered list is reported back for CSV export. */
export function useInquiryTable(rows: InquiryRow[]) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [type, setType] = useState<"all" | "new" | "returning">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "submitted", dir: "desc" });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (type === "all" || r.visitorType === type) &&
        (!q || `${r.name} ${r.email} ${r.company ?? ""} ${r.id}`.toLowerCase().includes(q)),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (r: InquiryRow) => (sort.key === "service" ? serviceLabel(r.service) : r[sort.key]);
    return [...list].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }, [rows, query, status, type, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  return {
    filtered,
    pageRows: filtered.slice(safePage * pageSize, safePage * pageSize + pageSize),
    state: { query, status, type, sort, page: safePage, pages, pageSize },
    set: {
      query: (v: string) => {
        setQuery(v);
        setPage(0);
      },
      status: (v: LeadStatus | "all") => {
        setStatus(v);
        setPage(0);
      },
      type: (v: "all" | "new" | "returning") => {
        setType(v);
        setPage(0);
      },
      sort: (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" })),
      page: setPage,
      pageSize: (n: number) => {
        setPageSize(n);
        setPage(0);
      },
    },
  };
}

export function InquiryTable({ table, total, onOpen }: { table: ReturnType<typeof useInquiryTable>; total: number; onOpen: (customerId: string) => void }) {
  const { state, set, pageRows, filtered } = table;
  const sortDir = (k: SortKey) => (state.sort.key === k ? state.sort.dir : null);

  return (
    <Card>
      <CardHeader title="Inquiries" description={`${fmtNumber(filtered.length)} of ${fmtNumber(total)} in this period · click a row to open the customer profile`} />
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Search inquiries</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={state.query}
            onChange={(e) => set.query(e.target.value)}
            placeholder="Search name, email, company or ID"
            className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
          />
        </label>
        <Select label="Lead status" value={state.status} onChange={set.status} options={[{ id: "all" as const, label: "All statuses" }, ...LEAD_STATUSES]} className="w-40" />
        <Select
          label="Visitor type"
          value={state.type}
          onChange={set.type}
          options={[
            { id: "all" as const, label: "New & returning" },
            { id: "new" as const, label: "New visitors" },
            { id: "returning" as const, label: "Returning visitors" },
          ]}
          className="w-44"
        />
      </div>

      <div className="mt-4 overflow-x-auto border-t border-gray-100">
        {pageRows.length === 0 ? (
          <EmptyState title="No inquiries match" description="Adjust the search, filters or date range." />
        ) : (
          <table className="w-full min-w-[1180px]">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <Th className="sticky left-0 z-10 bg-gray-50" sort={sortDir("name")} onSort={() => set.sort("name")}>Customer</Th>
                <Th sort={sortDir("service")} onSort={() => set.sort("service")}>Service</Th>
                <Th sort={sortDir("status")} onSort={() => set.sort("status")}>Status</Th>
                <Th sort={sortDir("submitted")} onSort={() => set.sort("submitted")}>Submitted</Th>
                <Th>Visitor</Th>
                <Th align="right" sort={sortDir("visits")} onSort={() => set.sort("visits")}>Visits</Th>
                <Th sort={sortDir("firstVisit")} onSort={() => set.sort("firstVisit")}>First visit</Th>
                <Th sort={sortDir("latestVisit")} onSort={() => set.sort("latestVisit")}>Latest visit</Th>
                <Th>Company</Th>
                <Th>Sales rep</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map((r) => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() => onOpen(r.customerId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(r.customerId);
                    }
                  }}
                  className="group cursor-pointer outline-none hover:bg-gray-50 focus-visible:bg-turquoise-50"
                  aria-label={`Open profile for ${r.name}`}
                >
                  <Td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 group-focus-visible:bg-turquoise-50">
                    <span className="block font-medium text-gray-900">{r.name}</span>
                    <span className="block text-[0.75rem] text-gray-500">{r.email}</span>
                  </Td>
                  <Td>{serviceLabel(r.service)}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>
                    <span className="block">{fmtDay(r.submitted)}</span>
                    <span className="block text-[0.72rem] text-gray-400">{r.id}</span>
                  </Td>
                  <Td>{r.visitorType === "returning" ? <Badge tone="orange">Returning</Badge> : <Badge tone="turquoise">New</Badge>}</Td>
                  <Td align="right">{r.visits}</Td>
                  <Td>{fmtDay(r.firstVisit)}</Td>
                  <Td>{fmtDay(r.latestVisit)}</Td>
                  <Td className="text-gray-600">{r.company ?? <span className="text-gray-400">—</span>}</Td>
                  <Td>{r.rep}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-[0.8rem] text-gray-500">
        <div className="flex items-center gap-2">
          Rows per page
          <Select label="Rows per page" value={String(state.pageSize)} onChange={(v) => set.pageSize(Number(v))} options={["10", "25", "50"].map((n) => ({ id: n, label: n }))} className="w-20" />
        </div>
        <div className="flex items-center gap-2">
          <span aria-live="polite">
            Page {state.page + 1} of {state.pages}
          </span>
          <Button size="sm" onClick={() => set.page(state.page - 1)} disabled={state.page === 0} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" onClick={() => set.page(state.page + 1)} disabled={state.page >= state.pages - 1} aria-label="Next page">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
