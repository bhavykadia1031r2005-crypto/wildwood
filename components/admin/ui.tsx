"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Info, Minus } from "lucide-react";
import type { LeadStatus } from "@/lib/admin/demoData";
import { fmtChange } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/* ---------- Card ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgb(19_28_32/0.04)]", className)}>{children}</section>
  );
}

export function CardHeader({
  title,
  description,
  action,
  info,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  info?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-gray-900">
          {title}
          {info && <InfoTip text={info} />}
        </h2>
        {description && <p className="mt-0.5 text-[0.8rem] text-gray-500">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/* ---------- Button ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" };

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-[0.8rem]" : "h-9 px-3.5 text-sm",
        variant === "primary" && "bg-teal-500 text-white shadow-sm hover:bg-teal-600",
        variant === "secondary" && "border border-gray-200 bg-white text-gray-700 shadow-[0_1px_1px_rgb(19_28_32/0.04)] hover:bg-gray-50 hover:text-gray-900",
        variant === "ghost" && "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className,
      )}
    />
  );
}

/* ---------- Badge ---------- */

const badgeTones = {
  neutral: "bg-gray-100 text-gray-700 ring-gray-200",
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
  turquoise: "bg-turquoise-50 text-turquoise-700 ring-turquoise-100",
  sun: "bg-sun-50 text-[#7a6400] ring-sun-200",
  orange: "bg-orange-100/60 text-orange-600 ring-orange-200",
  coral: "bg-coral-100/60 text-coral-700 ring-coral-100",
  ocean: "bg-ocean-100/60 text-ocean-700 ring-ocean-100",
} as const;

export function Badge({ tone = "neutral", className, children }: { tone?: keyof typeof badgeTones; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.72rem] font-medium ring-1 ring-inset", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

const statusTone: Record<LeadStatus, keyof typeof badgeTones> = {
  pending: "sun",
  contacted: "ocean",
  qualified: "turquoise",
  converted: "teal",
  lost: "coral",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge tone={statusTone[status]}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  );
}

/* ---------- Change indicator ---------- */

export function Delta({ value, invert = false, unavailable, points = false }: { value: number | null; invert?: boolean; unavailable?: string; points?: boolean }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[0.75rem] font-medium text-gray-400" title={unavailable ?? "No comparable previous period"}>
        <Minus className="size-3" aria-hidden="true" /> n/a
      </span>
    );
  }
  const good = invert ? value < 0 : value > 0;
  const flat = Math.abs(value) < 0.0005;
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[0.75rem] font-semibold tabular-nums",
        flat ? "text-gray-500" : good ? "bg-turquoise-50 text-teal-600" : "bg-coral-100/50 text-coral-700",
      )}
    >
      {!flat && <Icon className="size-3" aria-hidden="true" />}
      {points ? `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(1)} pts` : fmtChange(value)}
    </span>
  );
}

/* ---------- Form controls ---------- */

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  icon,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{label}</span>
      {icon && <span className="pointer-events-none absolute left-2.5 text-gray-400">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white pr-8 text-sm font-medium text-gray-700 shadow-[0_1px_1px_rgb(19_28_32/0.04)] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500",
          icon ? "pl-8" : "pl-3",
        )}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute right-2.5 size-3.5 text-gray-400">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "sm",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-gray-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "sm" ? "px-2.5 py-1 text-[0.78rem]" : "px-3 py-1.5 text-sm",
            value === o.id ? "bg-white text-gray-900 shadow-[0_1px_2px_rgb(19_28_32/0.12)]" : "text-gray-500 hover:text-gray-800",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-[0_1px_1px_rgb(19_28_32/0.04)] hover:bg-gray-50"
    >
      <span aria-hidden="true" className={cn("relative block h-4 w-7 shrink-0 rounded-full transition-colors", checked ? "bg-teal-500" : "bg-gray-300")}>
        <span className={cn("absolute left-0.5 top-0.5 size-3 rounded-full bg-white shadow transition-transform", checked ? "translate-x-3" : "translate-x-0")} />
      </span>
      {label}
    </button>
  );
}

/* ---------- Tooltip (hover + keyboard focus) ---------- */

export function InfoTip({ text, className }: { text: string; className?: string }) {
  const id = useId();
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      <button type="button" aria-describedby={id} aria-label="What this means" className="grid size-4 place-items-center rounded-full text-gray-400 hover:text-gray-600">
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-1.5 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-[0.75rem] font-normal normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-lg transition-opacity group-hover/tip:visible group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

/* ---------- Popover ---------- */

export function Popover({
  trigger,
  children,
  align = "end",
  label,
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  label: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute top-full z-40 mt-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_32px_-8px_rgb(19_28_32/0.22)]",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/* ---------- States ---------- */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={style} className={cn("animate-pulse rounded-md bg-gray-100", className)} />;
}

export function EmptyState({ title, description, icon, className }: { title: string; description?: string; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)} role="status">
      {icon && <span className="grid size-10 place-items-center rounded-full bg-gray-100 text-gray-500">{icon}</span>}
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {description && <p className="max-w-sm text-[0.8rem] text-gray-500">{description}</p>}
    </div>
  );
}

/** Mounted flag: charts measure the DOM, so they render after hydration behind a skeleton. */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* ---------- Stat card (single figure) ---------- */

export function StatCard({ label, value, sub, info, delta, points }: { label: string; value: string; sub?: string; info?: string; delta?: number | null; points?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgb(19_28_32/0.04)]">
      <p className="flex items-center gap-1.5 text-[0.8rem] font-medium text-gray-500">
        {label}
        {info && <InfoTip text={info} />}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-gray-900">{value}</p>
        {delta !== undefined && <Delta value={delta} points={points} />}
      </div>
      {sub && <p className="mt-0.5 text-[0.75rem] text-gray-500">{sub}</p>}
    </div>
  );
}

/* ---------- Table helpers ---------- */

export function Th({ children, align = "left", sort, onSort, className }: { children: ReactNode; align?: "left" | "right"; sort?: "asc" | "desc" | null; onSort?: () => void; className?: string }) {
  const content = onSort ? (
    <button type="button" onClick={onSort} className={cn("inline-flex items-center gap-1 hover:text-gray-900", align === "right" && "flex-row-reverse")}>
      {children}
      <span aria-hidden="true" className={cn("text-[0.6rem]", sort ? "text-teal-500" : "text-gray-300")}>{sort === "asc" ? "▲" : sort === "desc" ? "▼" : "▲▼"}</span>
    </button>
  ) : (
    children
  );
  return (
    <th
      scope="col"
      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
      className={cn("whitespace-nowrap px-4 py-2.5 text-[0.75rem] font-medium text-gray-500", align === "right" ? "text-right" : "text-left", className)}
    >
      {content}
    </th>
  );
}

export function Td({ children, align = "left", className }: { children: ReactNode; align?: "left" | "right"; className?: string }) {
  return <td className={cn("whitespace-nowrap px-4 py-3 text-sm text-gray-700", align === "right" && "text-right tabular-nums", className)}>{children}</td>;
}
