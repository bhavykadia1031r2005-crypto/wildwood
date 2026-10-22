"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Bell,
  CalendarRange,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  Grid3x3,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Repeat,
  Route,
  Settings,
  X,
  type LucideIcon,
  Inbox,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { DEMO_END_DAY, SERVICES, dateToDay } from "@/lib/admin/demoData";
import { fmtDay, isoDay } from "@/lib/admin/format";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { DashboardProvider, RANGE_OPTIONS, useDashboard, type RangeKey } from "./DashboardProvider";
import { Button, Popover, Select, Switch } from "./ui";

type NavItem = { href: string; label: string; title: string; icon: LucideIcon };

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", title: "Analytics Overview", icon: LayoutDashboard },
  { href: "/admin/visitors", label: "Visitors & Traffic", title: "Visitors & Traffic", icon: BarChart3 },
  { href: "/admin/retention", label: "Customer Retention", title: "Customer Retention", icon: Repeat },
  { href: "/admin/inquiries", label: "Inquiries & Leads", title: "Inquiries & Leads", icon: Inbox },
  { href: "/admin/services", label: "Service Analytics", title: "Service Analytics", icon: Layers },
  { href: "/admin/journey", label: "Customer Journey", title: "Customer Journey", icon: Route },
  { href: "/admin/cohorts", label: "Cohort Analysis", title: "Cohort Analysis", icon: Grid3x3 },
  { href: "/admin/reports", label: "Reports", title: "Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", title: "Settings", icon: Settings },
];

const NOTIFICATIONS = [
  { title: "3 new inquiries today", detail: "2 for Groups & Conventions, 1 for Places to Stay", time: "Demo · 1h ago" },
  { title: "Lead qualified", detail: "Daniel Okafor · Amusements & Piers", time: "Demo · 5h ago" },
  { title: "Weekly report ready", detail: "Returning visitors up this week", time: "Demo · Mon" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <Shell>{children}</Shell>
    </DashboardProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const current = ADMIN_NAV.find((n) => n.href === pathname) ?? ADMIN_NAV[0];

  return (
    <div className="on-light min-h-dvh bg-gray-50 font-sans text-gray-900 antialiased">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-gray-200 bg-white transition-[width] duration-300 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="absolute -right-3 top-7 grid size-6 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:text-gray-900"
        >
          {collapsed ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
        </button>
      </aside>

      <MobileNav open={mobileOpen} onClose={closeMobile} pathname={pathname} />

      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header title={current.title} crumb={current.label} onMenu={() => setMobileOpen(true)} />
        <main id="main" className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ collapsed, pathname, onNavigate }: { collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className={cn("flex h-16 items-center gap-2.5 border-b border-gray-100", collapsed ? "justify-center px-0" : "px-5")}>
        {collapsed ? (
          <LogoMark className="size-9 shrink-0" />
        ) : (
          <>
            <Logo tone="dark" className="h-9 w-auto shrink-0" />
            <div className="min-w-0 border-l border-gray-200 pl-2.5 leading-tight">
              <p className="truncate text-sm font-semibold text-gray-900">Insights</p>
              <p className="text-[0.7rem] text-gray-500">Analytics · Admin</p>
            </div>
          </>
        )}
      </div>
      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && <p className="px-2 pb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-gray-400">Analytics</p>}
        <ul className="flex flex-col gap-0.5">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex h-9 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
                    collapsed ? "justify-center" : "px-2.5",
                    active ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className={cn("size-[1.05rem] shrink-0", active ? "text-teal-500" : "text-gray-400 group-hover:text-gray-600")} aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {collapsed && <span className="sr-only">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={cn("border-t border-gray-100 p-3", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-2.5 rounded-lg", !collapsed && "px-2 py-1.5")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-500 text-xs font-semibold text-white">DA</span>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-gray-900">Demo Admin</p>
              <p className="truncate text-[0.72rem] text-gray-500">admin@example.com</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MobileNav({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, open, onClose);
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <button type="button" onClick={onClose} aria-label="Close navigation" className="absolute right-3 top-4 grid size-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
              <X className="size-4" />
            </button>
            <SidebarContent collapsed={false} pathname={pathname} onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Header({ title, crumb, onMenu }: { title: string; crumb: string; onMenu: () => void }) {
  const { rangeKey, setRangeKey, range, setCustomRange, compare, setCompare, service, setService, runExport, canExport, prev } = useDashboard();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenu} aria-label="Open navigation" className="grid size-9 place-items-center rounded-lg border border-gray-200 text-gray-600 lg:hidden">
            <Menu className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="text-[0.75rem] text-gray-500">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/admin" className="hover:text-gray-800">Admin</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="truncate text-gray-700">{crumb}</li>
              </ol>
            </nav>
            <h1 className="truncate text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{title}</h1>
          </div>
          <span className="hidden items-center gap-1.5 rounded-md bg-sun-50 px-2 py-1 text-[0.72rem] font-semibold text-[#7a6400] ring-1 ring-inset ring-sun-200 md:inline-flex" title="UI preview with generated demo data — not connected to live analytics">
            <span className="size-1.5 rounded-full bg-sun-500" aria-hidden="true" />
            Demo data
          </span>
          <Popover
            label="Notifications"
            panelClassName="w-80"
            trigger={({ open, toggle, id }) => (
              <button type="button" onClick={toggle} aria-expanded={open} aria-controls={id} aria-label="Notifications" className="relative grid size-9 place-items-center rounded-lg text-gray-600 hover:bg-gray-100">
                <Bell className="size-[1.05rem]" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-coral-500" aria-hidden="true" />
              </button>
            )}
          >
            {() => (
              <div>
                <p className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Notifications</p>
                <ul>
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.title} className="rounded-lg px-2.5 py-2 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-[0.78rem] text-gray-500">{n.detail}</p>
                      <p className="mt-0.5 text-[0.7rem] text-gray-400">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Popover>
          <Popover
            label="Account"
            panelClassName="w-56"
            trigger={({ open, toggle, id }) => (
              <button type="button" onClick={toggle} aria-expanded={open} aria-controls={id} aria-label="Account menu" className="grid size-9 place-items-center rounded-full bg-teal-500 text-xs font-semibold text-white">
                DA
              </button>
            )}
          >
            {() => (
              <div>
                <div className="px-2.5 py-2">
                  <p className="text-sm font-medium text-gray-900">Demo Admin</p>
                  <p className="text-[0.75rem] text-gray-500">Administrator</p>
                </div>
                <Link href="/admin/settings" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="size-4 text-gray-400" /> Settings
                </Link>
                <button type="button" disabled className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-400" title="Authentication isn't connected in this UI preview">
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </Popover>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select<RangeKey>
            label="Date range"
            value={rangeKey}
            onChange={setRangeKey}
            options={RANGE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
            icon={<CalendarRange className="size-4" />}
            className="w-44"
          />
          {rangeKey === "custom" && <CustomRange start={range.start} end={range.end} onApply={setCustomRange} />}
          <Select
            label="Service"
            value={service}
            onChange={setService}
            options={[{ id: "all" as const, label: "All services" }, ...SERVICES.map((s) => ({ id: s.id, label: s.label }))]}
            className="w-48"
          />
          <Switch checked={compare} onChange={setCompare} label="Compare" />
          <p className="hidden text-[0.75rem] text-gray-500 xl:block">
            {fmtDay(range.start)} – {fmtDay(range.end)}
            {compare && (prev ? ` · vs ${fmtDay(prev.start)} – ${fmtDay(prev.end)}` : " · no earlier data to compare")}
          </p>
          <Button className="ml-auto" onClick={runExport} disabled={!canExport}>
            <Download className="size-4" aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </div>
    </header>
  );
}

function CustomRange({ start, end, onApply }: { start: number; end: number; onApply: (r: { start: number; end: number }) => void }) {
  const [from, setFrom] = useState(isoDay(start));
  const [to, setTo] = useState(isoDay(end));
  const min = isoDay(0);
  const max = isoDay(DEMO_END_DAY);
  const valid = from && to && from <= to && from >= min && to <= max;
  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onApply({ start: dateToDay(new Date(`${from}T00:00:00Z`)), end: dateToDay(new Date(`${to}T00:00:00Z`)) });
      }}
    >
      <label className="sr-only" htmlFor="range-from">From</label>
      <input id="range-from" type="date" min={min} max={max} value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-2 text-sm text-gray-700" />
      <span className="text-gray-400" aria-hidden="true">–</span>
      <label className="sr-only" htmlFor="range-to">To</label>
      <input id="range-to" type="date" min={min} max={max} value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-2 text-sm text-gray-700" />
      <Button type="submit" size="sm" variant="primary" disabled={!valid} className="h-9">Apply</Button>
    </form>
  );
}
