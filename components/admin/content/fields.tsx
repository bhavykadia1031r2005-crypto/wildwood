"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { isSafeHref, uniqueId, type LinkItem } from "@/lib/cms/content";
import { Accent } from "@/lib/cms/render";
import { cn } from "@/lib/utils";
import { ImagePicker, Thumb } from "./ImagePicker";

export type Option = { id: string; label: string };
type Key<T> = Extract<keyof T, string>;

type BaseField<T> = { key: Key<T>; label: string; hint?: string; required?: boolean; maxLength?: number; wide?: boolean };

/** Declarative field list: the editor renders and validates forms from these. */
export type FieldDef<T> = BaseField<T> &
  (
    | { type: "text"; accent?: boolean; placeholder?: string }
    | { type: "textarea"; rows?: number; placeholder?: string }
    | { type: "number"; min: number; max: number; step?: number; prefix?: string }
    | { type: "select"; options: Option[] }
    | { type: "checkboxes"; options: Option[] }
    | { type: "toggle"; description?: string }
    | { type: "link"; placeholder?: string }
    | { type: "image"; altKey?: Key<T> }
    | { type: "links"; max?: number }
  );

export type Errors = Partial<Record<string, string>>;

export function validate<T>(fields: FieldDef<T>[], value: T): Errors {
  const errors: Errors = {};
  for (const f of fields) {
    const v = value[f.key] as unknown;
    if (f.type === "text" || f.type === "textarea" || f.type === "link") {
      const s = String(v ?? "").trim();
      if (f.required && !s) errors[f.key] = `${f.label} is required.`;
      else if (f.maxLength && s.length > f.maxLength) errors[f.key] = `Keep it to ${f.maxLength} characters or fewer.`;
      else if (f.type === "link" && s && !isSafeHref(s)) errors[f.key] = "Use a site path like /#stays or a full https:// link.";
      else if (f.type === "text" && f.accent && (s.match(/\*/g)?.length ?? 0) % 2 === 1) errors[f.key] = "Close the highlighted words with a second *.";
    } else if (f.type === "number") {
      const n = v as number;
      if (!Number.isFinite(n)) errors[f.key] = "Enter a number.";
      else if (n < f.min || n > f.max) errors[f.key] = `Enter a value from ${f.min} to ${f.max}.`;
    } else if (f.type === "image") {
      if (f.required && !v) errors[f.key] = "Choose an image.";
    } else if (f.type === "checkboxes") {
      if (f.required && !(v as string[]).length) errors[f.key] = "Pick at least one.";
    } else if (f.type === "links") {
      const links = v as LinkItem[];
      if (f.required && links.length === 0) errors[f.key] = "Add at least one link.";
      else if (links.some((l) => !l.label.trim())) errors[f.key] = "Every link needs a label.";
      else if (links.some((l) => !isSafeHref(l.href))) errors[f.key] = "Links must be a site path like /#stays or a full https:// link.";
    }
  }
  return errors;
}

export function FormFields<T>({
  fields,
  value,
  onChange,
  errors,
}: {
  fields: FieldDef<T>[];
  value: T;
  onChange: (next: T) => void;
  errors: Errors;
}) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f) => (
        <FieldControl key={f.key} field={f} value={value} onChange={onChange} error={errors[f.key]} />
      ))}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-[0_1px_1px_rgb(19_28_32/0.04)] placeholder:text-gray-400 focus:border-ocean-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500/30 aria-[invalid=true]:border-coral-500";

function FieldControl<T>({ field: f, value, onChange, error }: { field: FieldDef<T>; value: T; onChange: (next: T) => void; error?: string }) {
  const id = useId();
  const v = value[f.key] as unknown;
  const set = (next: unknown) => onChange({ ...value, [f.key]: next });
  const wide = f.wide ?? ["textarea", "image", "links", "checkboxes", "toggle"].includes(f.type);
  const described = [f.hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": described };
  const length = typeof v === "string" ? v.length : 0;

  let control: ReactNode;
  switch (f.type) {
    case "text":
    case "link":
      control = (
        <>
          <input
            {...common}
            type="text"
            inputMode={f.type === "link" ? "url" : undefined}
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={f.placeholder}
            className={cn(inputClass, "h-10")}
          />
          {f.type === "text" && f.accent && String(v ?? "").trim() && (
            <p className="mt-2 rounded-lg bg-teal-500 px-3 py-2 font-display text-lg font-bold leading-tight text-white" aria-hidden="true">
              <Accent text={String(v)} className="text-sun-400" />
            </p>
          )}
        </>
      );
      break;
    case "textarea":
      control = (
        <textarea
          {...common}
          rows={f.rows ?? 3}
          value={String(v ?? "")}
          onChange={(e) => set(e.target.value)}
          placeholder={f.placeholder}
          className={cn(inputClass, "resize-y py-2 leading-relaxed")}
        />
      );
      break;
    case "number":
      control = (
        <div className="relative">
          {f.prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{f.prefix}</span>}
          <input
            {...common}
            type="number"
            min={f.min}
            max={f.max}
            step={f.step ?? 1}
            value={Number.isFinite(v as number) ? (v as number) : ""}
            onChange={(e) => set(e.target.value === "" ? Number.NaN : Number(e.target.value))}
            className={cn(inputClass, "h-10 tabular-nums", f.prefix && "pl-7")}
          />
        </div>
      );
      break;
    case "select":
      control = (
        <select {...common} value={String(v)} onChange={(e) => set(e.target.value)} className={cn(inputClass, "h-10")}>
          {f.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "checkboxes": {
      const list = v as string[];
      control = (
        <div role="group" aria-labelledby={`${id}-label`} aria-describedby={described} className="flex flex-wrap gap-2">
          {f.options.map((o) => {
            const on = list.includes(o.id);
            return (
              <label
                key={o.id}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ocean-500",
                  on ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-700 hover:bg-gray-50",
                )}
              >
                <input
                  type="checkbox"
                  className="size-3.5 accent-teal-500"
                  checked={on}
                  onChange={() => set(on ? list.filter((x) => x !== o.id) : [...list, o.id])}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
      break;
    }
    case "toggle":
      control = (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-3 py-2.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ocean-500">
          <input type="checkbox" role="switch" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} className="peer sr-only" aria-describedby={described} />
          <span aria-hidden="true" className={cn("relative mt-0.5 block h-5 w-9 shrink-0 rounded-full transition-colors", v ? "bg-teal-500" : "bg-gray-300")}>
            <span className={cn("absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform", v ? "translate-x-4" : "translate-x-0")} />
          </span>
          <span className="text-sm">
            <span className="font-medium text-gray-900">{f.label}</span>
            {f.description && <span className="block text-[0.8rem] text-gray-500">{f.description}</span>}
          </span>
        </label>
      );
      break;
    case "image":
      control = (
        <ImageControl
          value={v as string}
          alt={f.altKey ? String(value[f.altKey] ?? "") : ""}
          onPick={(ref, alt) => {
            const next = { ...value, [f.key]: ref } as T;
            // Library photos come with a description; uploads keep whatever was typed.
            if (f.altKey && alt) (next as Record<string, unknown>)[f.altKey] = alt;
            onChange(next);
          }}
        />
      );
      break;
    case "links":
      control = <LinksControl links={v as LinkItem[]} max={f.max} onChange={set} />;
      break;
  }

  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      {f.type !== "toggle" && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label id={`${id}-label`} htmlFor={["checkboxes", "image", "links"].includes(f.type) ? undefined : id} className="text-[0.8rem] font-medium text-gray-700">
            {f.label}
            {f.required && <span className="text-coral-600"> *</span>}
          </label>
          {f.maxLength && (f.type === "text" || f.type === "textarea") && (
            <span className={cn("text-[0.7rem] tabular-nums", length > f.maxLength ? "text-coral-600" : "text-gray-400")}>
              {length}/{f.maxLength}
            </span>
          )}
        </div>
      )}
      {control}
      {f.hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.75rem] text-gray-500">
          {f.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[0.75rem] font-medium text-coral-700">
          {error}
        </p>
      )}
    </div>
  );
}

function ImageControl({ value, alt, onPick }: { value: string; alt: string; onPick: (ref: string, alt: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <Thumb refValue={value} alt={alt} className="h-16 w-24" />
        <div className="min-w-0 flex-1 text-[0.8rem] text-gray-500">{value ? alt || "Image selected" : "No image yet"}</div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="h-8 shrink-0 rounded-lg border border-gray-200 px-2.5 text-[0.8rem] font-medium text-gray-700 hover:bg-gray-50"
        >
          {open ? "Done" : value ? "Change" : "Choose"}
          <span className="sr-only"> image</span>
        </button>
      </div>
      {open && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <ImagePicker
            value={value}
            onPick={(ref, a) => {
              onPick(ref, a);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function LinksControl({ links, max = 8, onChange }: { links: LinkItem[]; max?: number; onChange: (next: LinkItem[]) => void }) {
  const update = (i: number, patch: Partial<LinkItem>) => onChange(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const move = (i: number, d: number) => {
    const next = [...links];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {links.map((l, i) => (
        <div key={l.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2 sm:flex-nowrap">
          <input aria-label={`Link ${i + 1} label`} value={l.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className={cn(inputClass, "h-9 sm:w-44")} />
          <input aria-label={`Link ${i + 1} address`} value={l.href} onChange={(e) => update(i, { href: e.target.value })} placeholder="/#stays" className={cn(inputClass, "h-9 min-w-0 flex-1")} />
          <div className="flex shrink-0 items-center">
            <IconButton label={`Move link ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp className="size-3.5" />
            </IconButton>
            <IconButton label={`Move link ${i + 1} down`} disabled={i === links.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown className="size-3.5" />
            </IconButton>
            <IconButton label={`Remove link ${i + 1}`} danger onClick={() => onChange(links.filter((_, j) => j !== i))}>
              <Trash2 className="size-3.5" />
            </IconButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={links.length >= max}
        onClick={() => onChange([...links, { id: uniqueId("link", links), label: "", href: "/#" }])}
        className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg px-2 text-[0.8rem] font-medium text-teal-600 hover:bg-teal-50 disabled:opacity-40"
      >
        <Plus className="size-3.5" aria-hidden="true" /> Add link {links.length >= max && `(max ${max})`}
      </button>
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-gray-500 transition-colors disabled:pointer-events-none disabled:opacity-30",
        danger ? "hover:bg-coral-100/60 hover:text-coral-700" : "hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      {children}
    </button>
  );
}
