"use client";

import { useState } from "react";
import { CircleAlert, Database, Radar, ShieldCheck } from "lucide-react";
import { REPS } from "@/lib/admin/demoData";
import { Badge, Button, Card, CardHeader, Select, Switch } from "../ui";

const ENV_VARS = [
  { name: "DATABASE_URL", purpose: "PostgreSQL connection for analytics and inquiries (server only)" },
  { name: "ANALYTICS_INGEST_SECRET", purpose: "Signs events accepted by the collection endpoint (server only)" },
  { name: "ADMIN_AUTH_SECRET", purpose: "Session secret for admin sign-in (server only)" },
  { name: "NEXT_PUBLIC_ANALYTICS_ENABLED", purpose: "Turns the consent-aware tracker on in the browser" },
];

export function SettingsPage() {
  const [consentRequired, setConsentRequired] = useState(true);
  const [truncateIp, setTruncateIp] = useState(true);
  const [retention, setRetention] = useState("26");
  const [cookieDays, setCookieDays] = useState("395");

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[0.8rem] text-gray-600">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-orange-500" aria-hidden="true" />
        Settings below are a UI preview. Changes aren&rsquo;t saved, and nothing is collected until the database, tracking and admin sign-in are connected.
      </p>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Connections" description="What the dashboard needs to show live data" />
          <ul className="divide-y divide-gray-100 px-5 pb-3 pt-2">
            {[
              { icon: Database, label: "Analytics database", detail: "PostgreSQL via Prisma" },
              { icon: Radar, label: "Website tracking", detail: "Consent-aware first-party tracker" },
              { icon: ShieldCheck, label: "Admin authentication", detail: "Required before deploying /admin" },
            ].map((c) => (
              <li key={c.label} className="flex items-center gap-3 py-3">
                <span className="grid size-9 place-items-center rounded-lg bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-100">
                  <c.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{c.label}</span>
                  <span className="block text-[0.75rem] text-gray-500">{c.detail}</span>
                </span>
                <Badge tone="sun">Not connected</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Privacy & consent" description="How visitor data is collected and kept" />
          <div className="space-y-4 px-5 pb-5 pt-4">
            <Row label="Require analytics consent" hint="Only consenting browsers get a persistent visitor ID; others count as single anonymous visits.">
              <Switch checked={consentRequired} onChange={setConsentRequired} label={consentRequired ? "On" : "Off"} />
            </Row>
            <Row label="Truncate IP addresses" hint="Store only coarse location; never the full IP.">
              <Switch checked={truncateIp} onChange={setTruncateIp} label={truncateIp ? "On" : "Off"} />
            </Row>
            <Row label="Visitor ID lifetime" hint="How long a returning browser can be recognised.">
              <Select label="Visitor ID lifetime" value={cookieDays} onChange={setCookieDays} options={[{ id: "180", label: "6 months" }, { id: "395", label: "13 months" }]} className="w-36" />
            </Row>
            <Row label="Raw event retention" hint="Older events are deleted; monthly aggregates are kept.">
              <Select label="Raw event retention" value={retention} onChange={setRetention} options={[{ id: "14", label: "14 months" }, { id: "26", label: "26 months" }, { id: "38", label: "38 months" }]} className="w-36" />
            </Row>
          </div>
        </Card>

        <Card>
          <CardHeader title="Sales team" description="Reps who can be assigned inquiries" action={<Button size="sm" disabled>Invite</Button>} />
          <ul className="divide-y divide-gray-100 px-5 pb-3 pt-2">
            {REPS.map((r) => (
              <li key={r} className="flex items-center gap-3 py-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-gray-100 text-[0.7rem] font-semibold text-gray-600">
                  {r.split(" ").map((w) => w[0]).join("")}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-900">{r}</span>
                <Badge>Sales</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Environment variables" description="Needed when connecting real data" />
          <ul className="divide-y divide-gray-100 px-5 pb-3 pt-2">
            {ENV_VARS.map((v) => (
              <li key={v.name} className="py-2.5">
                <code className="text-[0.8rem] font-semibold text-teal-600">{v.name}</code>
                <p className="text-[0.75rem] text-gray-500">{v.purpose}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 max-w-sm">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-[0.75rem] text-gray-500">{hint}</p>
      </div>
      {children}
    </div>
  );
}
