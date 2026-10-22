import { Info } from "lucide-react";
import { DEMO_END_DAY } from "@/lib/admin/demoData";
import { fmtDay } from "@/lib/admin/format";

/** States plainly that the dashboard shows generated data, not live analytics. */
export function DemoNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-sun-200 bg-sun-50 px-3.5 py-2.5 text-[0.8rem] text-[#5c4b00]">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">UI preview with demo data.</strong> Visitors, inquiries and people shown here are generated for
        illustration (history Sep 22, 2025 – {fmtDay(DEMO_END_DAY)}). Connect the analytics database and tracking to see live numbers.
      </span>
    </p>
  );
}
