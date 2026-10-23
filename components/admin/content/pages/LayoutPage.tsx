"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, PanelBottom, PanelTop, Pencil, RotateCcw, TriangleAlert } from "lucide-react";
import { sectionContentKeys, type SiteContent } from "@/lib/cms/content";
import { resetContent, saveContent, storageUsage, useCms } from "@/lib/cms/store";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, CardHeader } from "../../ui";
import { ContentFrame } from "../ContentFrame";
import { ConfirmDialog } from "../Dialog";
import { IconButton } from "../fields";
import { pageForSection } from "../nav";
import { useToast } from "../Toaster";

export function LayoutPage() {
  return (
    <ContentFrame href="/admin/content">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionsCard />
        <SummaryCard />
      </div>
    </ContentFrame>
  );
}

function SectionsCard() {
  const { content, edited } = useCms();
  const toast = useToast();
  const [announce, setAnnounce] = useState("");
  const layout = content.layout;
  const shown = layout.filter((s) => s.visible).length;

  const save = (next: SiteContent["layout"], message?: string) => {
    const previous = layout;
    const result = saveContent("layout", next);
    if (!result.ok) return toast({ message: result.error, tone: "error" });
    if (message) toast({ message, action: { label: "Undo", run: () => saveContent("layout", previous) } });
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...layout];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    save(next);
    setAnnounce(`${pageForSection(layout[i].id).label} moved to position ${i + dir + 1}.`);
  };

  const toggle = (i: number) => {
    const s = layout[i];
    const label = pageForSection(s.id).label;
    save(
      layout.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)),
      s.visible ? `“${label}” removed from the homepage.` : `“${label}” is back on the homepage.`,
    );
  };

  return (
    <Card>
      <CardHeader
        title="Homepage sections"
        description="Use the arrows to reorder. Hiding a section removes it from the homepage, and from the menu, until you show it again."
        action={<Badge tone="teal">{shown} of {layout.length} shown</Badge>}
      />
      {shown === 0 && (
        <p className="mx-5 mt-4 flex items-center gap-2 rounded-lg bg-coral-100/50 px-3 py-2 text-[0.8rem] text-coral-700">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" /> Every section is hidden, so the homepage only shows the menu and footer.
        </p>
      )}
      <ol className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
        <FixedRow icon={PanelTop} label="Navigation" note="Always at the top" href="/admin/content/navigation" edited={Boolean(edited.navigation)} />
        {layout.map((s, i) => {
          const page = pageForSection(s.id);
          const changed = sectionContentKeys[s.id].some((k) => edited[k]);
          return (
            <motion.li layout="position" key={s.id} className={cn("flex items-center gap-3 px-5 py-3", !s.visible && "bg-gray-50")}>
              <span className="w-5 shrink-0 text-right text-[0.75rem] tabular-nums text-gray-400">{i + 1}</span>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", s.visible ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-400")}>
                <page.icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className={cn("text-sm font-medium", s.visible ? "text-gray-900" : "text-gray-500 line-through decoration-gray-300")}>{page.label}</span>
                  {!s.visible && <Badge>Hidden</Badge>}
                  {changed && <Badge tone="sun">Edited</Badge>}
                </p>
                <p className="hidden truncate text-[0.78rem] text-gray-500 sm:block">{page.description}</p>
              </div>
              <div className="flex shrink-0 items-center">
                <IconButton label={`Move ${page.label} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton label={`Move ${page.label} down`} disabled={i === layout.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="size-4" />
                </IconButton>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={!s.visible}
                  aria-label={s.visible ? `Hide ${page.label} from the homepage` : `Show ${page.label} on the homepage`}
                  title={s.visible ? "Hide from homepage" : "Show on homepage"}
                  className={cn(
                    "ml-1 inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium transition-colors",
                    s.visible ? "text-gray-600 hover:bg-coral-100/50 hover:text-coral-700" : "bg-teal-500 text-white hover:bg-teal-600",
                  )}
                >
                  {s.visible ? <EyeOff className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
                  <span className="hidden sm:inline">{s.visible ? "Hide" : "Show"}</span>
                </button>
                <Link
                  href={page.href}
                  className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-[0.8rem] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Edit</span>
                  <span className="sr-only sm:hidden">Edit {page.label}</span>
                </Link>
              </div>
            </motion.li>
          );
        })}
        <FixedRow icon={PanelBottom} label="Footer" note="Always at the bottom" href="/admin/content/navigation" edited={Boolean(edited.footer)} />
      </ol>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </Card>
  );
}

function FixedRow({ icon: Icon, label, note, href, edited }: { icon: typeof PanelTop; label: string; note: string; href: string; edited: boolean }) {
  return (
    <li className="flex items-center gap-3 bg-gray-50/60 px-5 py-2.5">
      <span className="w-5 shrink-0" />
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {edited && <Badge tone="sun" className="ml-1.5">Edited</Badge>}
        <span className="block text-[0.78rem] text-gray-400">{note}</span>
      </p>
      <Link href={href} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-[0.8rem] font-medium text-gray-700 hover:bg-gray-50">
        <Pencil className="size-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Edit</span>
        <span className="sr-only sm:hidden">Edit {label}</span>
      </Link>
    </li>
  );
}

function SummaryCard() {
  const { content, edited } = useCms();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const editedCount = Object.keys(edited).length;
  const kb = Math.max(0, Math.round(storageUsage() / 1024));

  const counts = [
    { label: "Events", value: content.events.length },
    { label: "Map places", value: content.places.length },
    { label: "Things-to-do cards", value: content.categories.length },
    { label: "Stays (sample)", value: content.stays.length },
    { label: "Strip photos", value: content.pocketGuide.photos.length },
    { label: "Menu links", value: content.navigation.links.length },
  ];

  const resetAll = () => {
    const previous = { ...content };
    const keys = Object.keys(edited) as (keyof SiteContent)[];
    const result = resetContent();
    if (!result.ok) return toast({ message: result.error, tone: "error" });
    toast({
      message: "All demo edits cleared. The homepage is back to the original.",
      action: { label: "Undo", run: () => keys.forEach((k) => saveContent(k, previous[k] as never)) },
    });
  };

  return (
    <Card className="self-start">
      <CardHeader title="Demo status" description="What's been changed in this browser." />
      <dl className="grid grid-cols-2 gap-px overflow-hidden border-y border-gray-100 bg-gray-100 mt-4">
        <div className="bg-white px-5 py-3">
          <dt className="text-[0.75rem] text-gray-500">Edited areas</dt>
          <dd className="text-xl font-semibold tabular-nums text-gray-900">{editedCount}</dd>
        </div>
        <div className="bg-white px-5 py-3">
          <dt className="text-[0.75rem] text-gray-500">Browser storage</dt>
          <dd className="text-xl font-semibold tabular-nums text-gray-900">
            {kb} <span className="text-sm font-normal text-gray-500">KB</span>
          </dd>
        </div>
        {counts.map((c) => (
          <div key={c.label} className="bg-white px-5 py-3">
            <dt className="text-[0.75rem] text-gray-500">{c.label}</dt>
            <dd className="text-xl font-semibold tabular-nums text-gray-900">{c.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2 p-5">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-teal-500 px-3.5 text-sm font-medium text-white shadow-sm hover:bg-teal-600"
        >
          Open homepage <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <Button disabled={editedCount === 0} onClick={() => setConfirm(true)} className="text-coral-700 hover:text-coral-700">
          <RotateCcw className="size-4" aria-hidden="true" /> Reset all demo edits
        </Button>
        <p className="text-[0.75rem] leading-relaxed text-gray-500">
          Browsers allow roughly 5 MB per site, so keep uploaded photos to a handful.
        </p>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={resetAll}
        title="Reset all demo edits?"
        confirmLabel="Reset everything"
        message="Every edit, deletion, upload and layout change in this browser will be cleared and the homepage will return to the original content. You can undo straight after."
      />
    </Card>
  );
}
