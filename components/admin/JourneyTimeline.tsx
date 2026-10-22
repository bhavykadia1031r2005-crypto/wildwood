import { BadgeCheck, CircleDot, Eye, FilePen, LogIn, PhoneCall, Send, Trophy, XCircle, type LucideIcon } from "lucide-react";
import type { TimelineEvent } from "@/lib/admin/analytics";
import { fmtDay, fmtDuration } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

const ICONS: Record<TimelineEvent["type"], LucideIcon> = {
  session_start: LogIn,
  service_view: Eye,
  inquiry_form_start: FilePen,
  inquiry_submit: Send,
  lead_contacted: PhoneCall,
  lead_qualified: BadgeCheck,
  lead_converted: Trophy,
  lead_lost: XCircle,
};

const TONE: Partial<Record<TimelineEvent["type"], string>> = {
  inquiry_submit: "bg-coral-500 text-white",
  lead_qualified: "bg-turquoise-500 text-white",
  lead_converted: "bg-teal-500 text-white",
  lead_lost: "bg-gray-400 text-white",
};

/**
 * Chronological journey grouped by visit. Anonymous activity (before the
 * person identified themselves) is drawn with a dashed rail.
 */
export function JourneyTimeline({ events, compact = false }: { events: TimelineEvent[]; compact?: boolean }) {
  const groups: { key: string; day: number; identified: boolean; gapDays: number | null; items: TimelineEvent[] }[] = [];
  let lastVisitDay: number | null = null;
  for (const e of events) {
    const isVisit = e.type === "session_start";
    const last = groups[groups.length - 1];
    if (isVisit || !last || (e.type.startsWith("lead_") && e.day !== last.day)) {
      groups.push({ key: `${e.day}-${e.type}-${groups.length}`, day: e.day, identified: e.identified, gapDays: isVisit && lastVisitDay !== null ? e.day - lastVisitDay : null, items: [e] });
      if (isVisit) lastVisitDay = e.day;
    } else {
      last.items.push(e);
    }
  }

  return (
    <ol className="relative">
      {groups.map((g, gi) => (
        <li key={g.key} className="relative pb-4 pl-7 last:pb-0">
          {gi < groups.length - 1 && (
            <span aria-hidden="true" className={cn("absolute left-[11px] top-6 bottom-0 w-0", g.identified ? "border-l-2 border-teal-200" : "border-l-2 border-dashed border-gray-300")} />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-0 top-0.5 grid size-6 place-items-center rounded-full ring-4 ring-white",
              g.identified ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-500",
            )}
          >
            <CircleDot className="size-3.5" />
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-semibold text-gray-900">{fmtDay(g.day)}</p>
            {g.gapDays !== null && g.gapDays > 0 && <span className="text-[0.72rem] font-medium text-orange-600">returned after {fmtDuration(g.gapDays)}</span>}
            <span className={cn("text-[0.68rem] font-medium uppercase tracking-wider", g.identified ? "text-teal-500" : "text-gray-400")}>
              {g.identified ? "Identified" : "Anonymous"}
            </span>
          </div>
          <ul className={cn("mt-1.5 space-y-1", compact ? "" : "rounded-lg bg-gray-50 p-2.5")}>
            {g.items.map((e, i) => {
              const Icon = ICONS[e.type];
              return (
                <li key={i} className="flex items-start gap-2 text-[0.82rem]">
                  <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded", TONE[e.type] ?? "text-gray-500")}>
                    <Icon className="size-3" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium text-gray-800">{e.label}</span>
                    {e.detail && <span className="text-gray-500"> · {e.detail}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
