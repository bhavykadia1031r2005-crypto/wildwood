"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { DEMO_END_DAY, getDemoDataset, type DemoDataset } from "@/lib/admin/demoData";
import { previousRange, type DayRange, type ServiceFilter } from "@/lib/admin/analytics";

export type RangeKey = "7d" | "30d" | "90d" | "12m" | "custom";

export const RANGE_OPTIONS: { id: RangeKey; label: string; days?: number }[] = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "12m", label: "Last 12 months", days: 365 },
  { id: "custom", label: "Custom range" },
];

type Exporter = { filename: string; run: () => void } | null;

type DashboardState = {
  data: DemoDataset;
  rangeKey: RangeKey;
  range: DayRange;
  prev: DayRange | null;
  compare: boolean;
  service: ServiceFilter;
  setRangeKey: (k: RangeKey) => void;
  setCustomRange: (r: DayRange) => void;
  setCompare: (v: boolean) => void;
  setService: (s: ServiceFilter) => void;
  registerExport: (e: Exporter) => void;
  runExport: () => void;
  canExport: boolean;
};

const Ctx = createContext<DashboardState | null>(null);

/** Global dashboard filters, shared by every admin page. */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const data = useMemo(() => getDemoDataset(), []);
  const [rangeKey, setRangeKey] = useState<RangeKey>("30d");
  const [custom, setCustom] = useState<DayRange>({ start: DEMO_END_DAY - 44, end: DEMO_END_DAY - 15 });
  const [compare, setCompare] = useState(true);
  const [service, setService] = useState<ServiceFilter>("all");
  const exporter = useRef<Exporter>(null);
  const [canExport, setCanExport] = useState(false);

  const range = useMemo<DayRange>(() => {
    if (rangeKey === "custom") return custom;
    const days = RANGE_OPTIONS.find((o) => o.id === rangeKey)!.days!;
    return { start: DEMO_END_DAY - days + 1, end: DEMO_END_DAY };
  }, [rangeKey, custom]);

  const registerExport = useCallback((e: Exporter) => {
    exporter.current = e;
    setCanExport(Boolean(e));
  }, []);

  const value = useMemo<DashboardState>(
    () => ({
      data,
      rangeKey,
      range,
      prev: previousRange(range),
      compare,
      service,
      setRangeKey,
      setCustomRange: (r) => {
        setCustom(r);
        setRangeKey("custom");
      },
      setCompare,
      setService,
      registerExport,
      runExport: () => exporter.current?.run(),
      canExport,
    }),
    [data, rangeKey, range, compare, service, registerExport, canExport],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}
