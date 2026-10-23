"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { uniqueId } from "@/lib/cms/content";
import type { SaveResult } from "@/lib/cms/store";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, CardHeader, EmptyState } from "../ui";
import { ConfirmDialog, Dialog } from "./Dialog";
import { FormFields, IconButton, validate, type Errors, type FieldDef } from "./fields";
import { Thumb } from "./ImagePicker";
import { useToast } from "./Toaster";

type Editing<T> = { index: number | null; draft: T };

/**
 * Manages one list of homepage items: add, edit, delete (with undo), bulk
 * delete, reorder and search. Every change is saved straight away.
 */
export function ListEditor<T extends { id: string }>({
  title,
  description,
  itemName,
  items,
  onSave,
  fields,
  create,
  prepare,
  row,
  searchable = false,
  max,
  dialogSize = "md",
  footnote,
}: {
  title: string;
  description?: string;
  /** Singular, lower case: "event", "place". */
  itemName: string;
  items: T[];
  onSave: (next: T[]) => SaveResult;
  fields: FieldDef<T>[];
  /** Blank item for "Add". */
  create: () => T;
  /** Final touches before saving an added or edited item (ids, derived fields). */
  prepare?: (item: T, previous: T | null) => T;
  row: { title: (item: T) => string; subtitle?: (item: T) => string; image?: (item: T) => string | undefined; badge?: (item: T) => ReactNode };
  searchable?: boolean;
  max?: number;
  dialogSize?: "md" | "lg";
  footnote?: ReactNode;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing<T> | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.map((item, index) => ({ item, index }));
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => `${row.title(item)} ${row.subtitle?.(item) ?? ""}`.toLowerCase().includes(q));
  }, [items, query, row]);

  const liveSelected = selected.filter((id) => items.some((i) => i.id === id));
  const full = max !== undefined && items.length >= max;

  const commit = (next: T[], message?: string, undo?: T[]) => {
    const result = onSave(next);
    if (!result.ok) {
      toast({ message: result.error, tone: "error" });
      return false;
    }
    if (message) toast({ message, action: undo ? { label: "Undo", run: () => onSave(undo) } : undefined });
    return true;
  };

  const openAdd = () => {
    setErrors({});
    setEditing({ index: null, draft: create() });
  };
  const openEdit = (index: number) => {
    setErrors({});
    setEditing({ index, draft: items[index] });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const errs = validate(fields, editing.draft);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const previous = editing.index === null ? null : items[editing.index];
    let item = prepare ? prepare(editing.draft, previous) : editing.draft;
    if (!item.id) item = { ...item, id: uniqueId(row.title(item), items) };
    const next = editing.index === null ? [...items, item] : items.map((x, i) => (i === editing.index ? item : x));
    const name = row.title(item);
    if (commit(next, editing.index === null ? `Added “${name}”.` : `Saved “${name}”.`, items)) setEditing(null);
  };

  const remove = (ids: string[]) => {
    const next = items.filter((i) => !ids.includes(i.id));
    const label = ids.length === 1 ? `“${row.title(items.find((i) => i.id === ids[0])!)}”` : `${ids.length} ${itemName}s`;
    if (commit(next, `Deleted ${label}.`, items)) setSelected((s) => s.filter((id) => !ids.includes(id)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    if (commit(next)) setAnnounce(`${row.title(items[index])} moved to position ${index + dir + 1} of ${items.length}.`);
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const confirmItem = confirm?.length === 1 ? items.find((i) => i.id === confirm[0]) : undefined;
  const confirmName = confirmItem ? row.title(confirmItem) : null;
  const allVisibleSelected = visible.length > 0 && visible.every(({ item }) => liveSelected.includes(item.id));

  return (
    <Card>
      <CardHeader
        title={
          <>
            {title} <Badge>{items.length}</Badge>
          </>
        }
        description={description}
        action={
          <Button variant="primary" onClick={openAdd} disabled={full} title={full ? `Up to ${max} ${itemName}s` : undefined}>
            <Plus className="size-4" aria-hidden="true" /> Add {itemName}
          </Button>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-gray-100 bg-gray-50/60 px-5 py-2.5">
        <label className="inline-flex items-center gap-2 text-[0.8rem] text-gray-600">
          <input
            type="checkbox"
            className="size-3.5 accent-teal-500"
            checked={allVisibleSelected}
            disabled={visible.length === 0}
            onChange={() =>
              setSelected(allVisibleSelected ? liveSelected.filter((id) => !visible.some((v) => v.item.id === id)) : [...new Set([...liveSelected, ...visible.map((v) => v.item.id)])])
            }
          />
          Select all
        </label>
        <AnimatePresence>
          {liveSelected.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Button size="sm" className="border-coral-200 text-coral-700 hover:bg-coral-100/40 hover:text-coral-700" onClick={() => setConfirm(liveSelected)}>
                <Trash2 className="size-3.5" aria-hidden="true" /> Delete {liveSelected.length} selected
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {searchable && (
          <label className="relative ml-auto w-full sm:w-64">
            <span className="sr-only">Search {itemName}s</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${itemName}s`}
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-[0.8rem] placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
            />
          </label>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? `No ${itemName}s on the homepage` : `No ${itemName}s match “${query}”`}
          description={items.length === 0 ? `Add one, or use “Restore original” above to bring back the defaults.` : undefined}
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {visible.map(({ item, index }) => {
            const name = row.title(item);
            const image = row.image?.(item);
            return (
              <motion.li layout="position" key={item.id} className={cn("flex items-center gap-3 px-5 py-3", liveSelected.includes(item.id) && "bg-teal-50/50")}>
                <input type="checkbox" className="size-3.5 shrink-0 accent-teal-500" checked={liveSelected.includes(item.id)} onChange={() => toggle(item.id)} aria-label={`Select ${name}`} />
                <span className="hidden w-5 shrink-0 text-right text-[0.75rem] tabular-nums text-gray-400 sm:block">{index + 1}</span>
                {row.image && <Thumb refValue={image} className="h-10 w-14 sm:h-11 sm:w-16" />}
                <button type="button" onClick={() => openEdit(index)} className="min-w-0 flex-1 text-left">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-teal-600 sm:truncate">{name}</span>
                    {row.badge?.(item)}
                  </span>
                  {row.subtitle && <span className="block truncate text-[0.78rem] text-gray-500">{row.subtitle(item)}</span>}
                </button>
                <div className="flex shrink-0 items-center">
                  <span className="hidden sm:contents">
                    <IconButton label={`Move ${name} up`} disabled={index === 0 || Boolean(query)} onClick={() => move(index, -1)}>
                      <ArrowUp className="size-4" />
                    </IconButton>
                    <IconButton label={`Move ${name} down`} disabled={index === items.length - 1 || Boolean(query)} onClick={() => move(index, 1)}>
                      <ArrowDown className="size-4" />
                    </IconButton>
                  </span>
                  <IconButton label={`Edit ${name}`} onClick={() => openEdit(index)}>
                    <Pencil className="size-4" />
                  </IconButton>
                  <IconButton label={`Delete ${name}`} danger onClick={() => setConfirm([item.id])}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
      {footnote && <p className="border-t border-gray-100 px-5 py-3 text-[0.75rem] text-gray-500">{footnote}</p>}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        size={dialogSize}
        title={editing?.index === null ? `Add ${itemName}` : `Edit ${itemName}`}
        description="Changes go live on the homepage in this browser when you save."
        footer={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="cms-item-form" variant="primary">
              {editing?.index === null ? `Add ${itemName}` : "Save changes"}
            </Button>
          </>
        }
      >
        {editing && (
          <form id="cms-item-form" onSubmit={submit} noValidate>
            <FormFields
              fields={fields}
              value={editing.draft}
              onChange={(draft) => {
                setEditing({ ...editing, draft });
                if (Object.keys(errors).length) setErrors(validate(fields, draft));
              }}
              errors={errors}
            />
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && remove(confirm)}
        title={confirm && confirm.length > 1 ? `Delete ${confirm.length} ${itemName}s?` : `Delete this ${itemName}?`}
        confirmLabel="Delete"
        message={
          <>
            {confirmName ? <strong className="font-semibold text-gray-900">“{confirmName}” </strong> : "They "}
            will be removed from the homepage in this browser. You can undo straight after, or use “Restore original” to bring back the defaults.
          </>
        }
      />
    </Card>
  );
}
