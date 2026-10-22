"use client";

import { useEffect, useRef } from "react";
import { downloadCsv, toCsv, type CsvColumn } from "@/lib/admin/csv";
import { isoDay } from "@/lib/admin/format";
import { useDashboard } from "./DashboardProvider";

/** Registers the current page's primary dataset with the header's "Export CSV" button. */
export function useExport<T>(name: string, rows: T[], columns: CsvColumn<T>[]) {
  const { registerExport, range } = useDashboard();
  const latest = useRef({ rows, columns });
  useEffect(() => {
    latest.current = { rows, columns };
  });

  useEffect(() => {
    const filename = `wildwoods-${name}-${isoDay(range.start)}_to_${isoDay(range.end)}`;
    registerExport({ filename, run: () => downloadCsv(filename, toCsv(latest.current.rows, latest.current.columns)) });
    return () => registerExport(null);
  }, [name, range.start, range.end, registerExport]);
}
