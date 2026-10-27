"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, Clock, Sun } from "lucide-react";
import { activityHeatmap, WEEKDAYS } from "@/lib/admin/analytics";
import { fmtDay, fmtNumber, fmtPercent } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { useDashboard } from "./DashboardProvider";
import { Card, CardHeader, EmptyState } from "./ui";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
/**
 * Heat scale: white (no visits) → yellow → orange → red, from the brand sun, orange and coral
 * steps. Lightness falls steadily so "darker = busier" still holds; cells carry a faint
 * outline because the palest yellow is close to the white card.
 */
const LEVELS = ["bg-sun-100", "bg-sun-400", "bg-orange-300", "bg-orange-500", "bg-coral-600", "bg-coral-700"];
const COLS = "grid grid-cols-[2.25rem_repeat(24,minmax(0,1fr))] gap-[2px] sm:grid-cols-[2.75rem_repeat(24,minmax(0,1fr))]";

const hourName = (h: number) => (h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);
const hourShort = (h: number) => (h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`);
const hourRange = (h: number) => `${hourName(h)}–${hourName((h + 1) % 24)}`;
const levelOf = (v: number, max: number) => (v === 0 || max === 0 ? -1 : Math.min(LEVELS.length - 1, Math.floor((v / max) * LEVELS.length)));

type Cell = { d: number; h: number };
type Shown = Cell & { x: number; y: number };

/** Visits by day of week × hour for the selected period and service. */
export function ActivityHeatmap({ className }: { className?: string }) {
  const { data, range, service } = useDashboard();
  const heat = useMemo(() => activityHeatmap(data, range, service), [data, range, service]);
  const [active, setActive] = useState<Cell>({ d: 0, h: 12 });
  const [shown, setShown] = useState<Shown | null>(null);
  // Tooltip anchors to the cell's top-centre inside the positioned wrapper.
  const show = (d: number, h: number, el: HTMLElement) => setShown({ d, h, x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop });
  const grid = useRef<HTMLDivElement>(null);

  const move = (e: KeyboardEvent) => {
    const step: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    let next: Cell | null = null;
    if (step[e.key]) next = { d: Math.min(6, Math.max(0, active.d + step[e.key][0])), h: Math.min(23, Math.max(0, active.h + step[e.key][1])) };
    else if (e.key === "Home") next = { d: active.d, h: 0 };
    else if (e.key === "End") next = { d: active.d, h: 23 };
    else if (e.key === "Escape") setShown(null);
    if (!next) return;
    e.preventDefault();
    setActive(next);
    grid.current?.querySelector<HTMLElement>(`[data-cell="${next.d}-${next.h}"]`)?.focus();
  };

  const tip = shown && heat.total > 0 ? { ...shown, v: heat.grid[shown.d][shown.h] } : null;

  return (
    <Card className={className}>
      <CardHeader
        title="When visitors come"
        description={`Visits by day of week and hour (Eastern Time), ${fmtDay(range.start)} – ${fmtDay(range.end)}`}
        info="Each visit counts in the hour it started. With a service filter, only visits that viewed that service are counted. White means no visits; the scale runs yellow → orange → red as hours get busier."
        action={<Legend max={heat.max} />}
      />
      {heat.total === 0 ? (
        <EmptyState title="No visits in this period" description="Try a longer date range or a different service." />
      ) : (
        <div className="grid gap-5 px-5 pb-5 pt-4 xl:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative min-w-0" onPointerLeave={() => setShown(null)}>
            <div ref={grid} role="grid" aria-label="Visits by day of week and hour" aria-rowcount={8} aria-colcount={25} onKeyDown={move} className="flex flex-col gap-[2px]">
              <div role="row" className={COLS}>
                <span role="columnheader" aria-label="Day" />
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h} role="columnheader" aria-label={hourRange(h)} className="text-center text-[0.65rem] tabular-nums text-gray-500">
                    <span aria-hidden="true" className={cn(h % 3 !== 0 && "invisible", h % 6 !== 0 && "max-sm:invisible")}>
                      {hourShort(h)}
                    </span>
                  </span>
                ))}
              </div>
              {heat.grid.map((row, d) => (
                <div key={d} role="row" className={COLS}>
                  <span role="rowheader" aria-label={DAY_NAMES[d]} className="flex items-center text-[0.72rem] font-medium text-gray-600">
                    {WEEKDAYS[d]}
                  </span>
                  {row.map((v, h) => {
                    const lvl = levelOf(v, heat.max);
                    const isActive = active.d === d && active.h === h;
                    return (
                      <span
                        key={h}
                        role="gridcell"
                        data-cell={`${d}-${h}`}
                        tabIndex={isActive ? 0 : -1}
                        aria-label={`${DAY_NAMES[d]} ${hourRange(h)}: ${fmtNumber(v)} visit${v === 1 ? "" : "s"}`}
                        onPointerEnter={(e) => show(d, h, e.currentTarget)}
                        onFocus={(e) => {
                          setActive({ d, h });
                          show(d, h, e.currentTarget);
                        }}
                        onBlur={() => setShown(null)}
                        className={cn(
                          "block h-6 rounded-[3px] outline-none transition-shadow sm:h-7",
                          "inset-ring inset-ring-gray-900/10",
                          lvl < 0 ? "bg-white" : LEVELS[lvl],
                          "hover:ring-2 hover:ring-gray-900 hover:ring-offset-1 focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-1",
                          tip && tip.d === d && tip.h === h && "ring-2 ring-gray-900 ring-offset-1",
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {tip && <Tooltip cell={tip} />}
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 xl:content-start">
            <Insight icon={Clock} label="Busiest hour" value={`${WEEKDAYS[heat.peak.day]} ${hourRange(heat.peak.hour)}`} sub={`${fmtNumber(heat.max)} visits`} />
            <Insight
              icon={CalendarDays}
              label="Busiest day"
              value={DAY_NAMES[heat.busiestDay]}
              sub={`${fmtPercent(heat.grid[heat.busiestDay].reduce((a, b) => a + b, 0) / heat.total)} of visits`}
            />
            <Insight icon={Sun} label="Weekends" value={fmtPercent(heat.weekendShare)} sub="of visits fall on Sat–Sun" />
          </dl>
        </div>
      )}
    </Card>
  );
}

function Tooltip({ cell }: { cell: Shown & { v: number } }) {
  const align = cell.h < 3 ? "translate-x-[-15%]" : cell.h > 20 ? "translate-x-[-85%]" : "-translate-x-1/2";
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute z-10 -translate-y-full whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-white shadow-lg", align)}
      style={{ left: cell.x, top: cell.y - 6 }}
    >
      <p className="text-sm font-semibold tabular-nums">
        {fmtNumber(cell.v)} visit{cell.v === 1 ? "" : "s"}
      </p>
      <p className="text-[0.72rem] text-gray-300">
        {DAY_NAMES[cell.d]} · {hourRange(cell.h)}
      </p>
    </div>
  );
}

function Legend({ max }: { max: number }) {
  return (
    <div className="flex items-center gap-1.5 text-[0.7rem] text-gray-500" aria-label={`Colour scale from no visits to ${fmtNumber(max)} visits in an hour`}>
      <span className="mr-1 inline-flex items-center gap-1">
        <span className="size-3 rounded-[3px] bg-white inset-ring inset-ring-gray-900/15" aria-hidden="true" /> None
      </span>
      <span>Fewer</span>
      {LEVELS.map((c) => (
        <span key={c} className={cn("size-3 rounded-[3px] inset-ring inset-ring-gray-900/10", c)} aria-hidden="true" />
      ))}
      <span>More</span>
    </div>
  );
}

function Insight({ icon: Icon, label, value, sub }: { icon: typeof Clock; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-3.5 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-[0.75rem] text-gray-500">{label}</dt>
        <dd className="text-sm font-semibold text-gray-900">{value}</dd>
        <dd className="text-[0.72rem] text-gray-500">{sub}</dd>
      </div>
    </div>
  );
}
