"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Building2, CalendarClock, EyeOff, Fingerprint, Mail, Phone, ShieldCheck, UserRound, X } from "lucide-react";
import { customerProfile, formatHours } from "@/lib/admin/analytics";
import { serviceLabel, sourceLabel } from "@/lib/admin/demoData";
import { fmtDay, fmtDuration, fmtNumber } from "@/lib/admin/format";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { useDashboard } from "./DashboardProvider";
import { JourneyTimeline } from "./JourneyTimeline";
import { Badge, StatusBadge } from "./ui";

export function CustomerDrawer({ customerId, onClose }: { customerId: string | null; onClose: () => void }) {
  return <AnimatePresence>{customerId && <Drawer key={customerId} customerId={customerId} onClose={onClose} />}</AnimatePresence>;
}

function Drawer({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data } = useDashboard();
  const panel = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  useFocusTrap(panel, true, onClose);
  useScrollLock(true);
  const p = useMemo(() => customerProfile(data, customerId), [data, customerId]);
  const latest = p.inquiries[p.inquiries.length - 1];
  const sources = [...new Set(p.sessions.map((s) => s.source))];

  return (
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        tabIndex={-1}
        aria-label="Close profile"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-name"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 40 }}
      >
        <header className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-semibold text-teal-600">
            {p.customer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="profile-name" className="truncate text-base font-semibold text-gray-900">{p.customer.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge tone="teal">
                <BadgeCheck className="size-3" aria-hidden="true" /> Verified via inquiry form
              </Badge>
              {latest && <StatusBadge status={latest.status} />}
              <Badge tone="sun">Demo record</Badge>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close profile" className="grid size-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section aria-labelledby="ident-h" className="rounded-xl border border-gray-200 p-4">
            <h3 id="ident-h" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">
              <ShieldCheck className="size-3.5 text-teal-500" aria-hidden="true" /> Verified customer data
            </h3>
            <dl className="mt-3 grid gap-x-4 gap-y-2.5 text-sm sm:grid-cols-2">
              <Field icon={UserRound} label="Name" value={p.customer.name} />
              <Field icon={Mail} label="Email" value={p.customer.email} />
              <Field icon={Building2} label="Company" value={p.customer.company ?? "—"} />
              <Field icon={Phone} label="Phone" value={p.customer.phoneOnFile ? "On file (hidden)" : "Not provided"} />
            </dl>
            <p className="mt-3 text-[0.72rem] text-gray-500">Contact details are visible to authorized admins only and never sent to public analytics endpoints.</p>
          </section>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="First seen" value={fmtDay(p.firstSeen)} />
            <Stat label="Last seen" value={fmtDay(p.lastSeen)} />
            <Stat label="Recorded visits" value={fmtNumber(p.sessions.length)} />
            <Stat label="First visit → inquiry" value={p.daysToFirstInquiry === null ? "—" : fmtDuration(p.daysToFirstInquiry)} />
          </dl>

          <section aria-labelledby="sources-h" className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 id="sources-h" className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Traffic sources</h3>
              <p className="mt-2 text-sm text-gray-700">
                First touch <strong className="font-semibold text-gray-900">{sourceLabel(p.firstTouch)}</strong> · Latest{" "}
                <strong className="font-semibold text-gray-900">{sourceLabel(p.latestTouch)}</strong>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sources.map((s) => (
                  <Badge key={s}>{sourceLabel(s)}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Services viewed</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.servicesViewed.length ? p.servicesViewed.map((s) => <Badge key={s} tone="ocean">{serviceLabel(s)}</Badge>) : <span className="text-sm text-gray-500">Homepage only</span>}
              </div>
            </div>
          </section>

          <section aria-labelledby="inq-h">
            <h3 id="inq-h" className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Inquiry history</h3>
            <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {p.inquiries.map((i, k) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">
                      {serviceLabel(i.service)}
                      {k > 0 && i.service !== p.inquiries[k - 1].service && <Badge tone="orange" className="ml-2">New service</Badge>}
                    </p>
                    <p className="text-[0.75rem] text-gray-500">
                      {i.id} · {fmtDay(i.day)} · {i.rep}
                      {i.responseHours !== undefined && ` · replied in ${formatHours(i.responseHours)}`}
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tl-h">
            <div className="flex items-center justify-between">
              <h3 id="tl-h" className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Activity timeline</h3>
              <span className="flex items-center gap-1 text-[0.72rem] text-gray-500">
                <Fingerprint className="size-3.5" aria-hidden="true" /> {p.anonymousVisitsBeforeInquiry} anonymous {p.anonymousVisitsBeforeInquiry === 1 ? "visit" : "visits"} linked by visitor ID
              </span>
            </div>
            <div className="mt-3">
              <JourneyTimeline events={p.events} compact />
            </div>
            <p className="mt-3 flex gap-1.5 text-[0.72rem] text-gray-500">
              <EyeOff className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Visits before the first inquiry were linked through the same browser&rsquo;s first-party ID, not personal data. Visits on other devices can&rsquo;t be linked and aren&rsquo;t shown.
            </p>
          </section>

          <section aria-labelledby="notes-h" className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div>
              <label htmlFor="notes" id="notes-h" className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Notes</label>
              <textarea
                id="notes"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={p.customer.note || "Add a note for the sales team… (not saved in this preview)"}
                className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
              />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500">Assigned rep</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                <CalendarClock className="size-4 text-gray-400" aria-hidden="true" /> {latest?.rep ?? "Unassigned"}
              </p>
            </div>
          </section>
        </div>
      </motion.aside>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[0.72rem] text-gray-500">{label}</dt>
        <dd className="truncate font-medium text-gray-900">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <dt className="text-[0.7rem] text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
