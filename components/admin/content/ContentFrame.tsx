"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ExternalLink, Info, RotateCcw } from "lucide-react";
import type { ContentKey, SiteContent } from "@/lib/cms/content";
import { resetContent, saveContent, useCms, useCmsReady } from "@/lib/cms/store";
import { cn } from "@/lib/utils";
import { Button, Skeleton } from "../ui";
import { ConfirmDialog } from "./Dialog";
import { CONTENT_PAGES, type ContentPage } from "./nav";
import { useToast } from "./Toaster";

/** States plainly what the demo editor does and doesn't do. */
export function EditorNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-sun-200 bg-sun-50 px-3.5 py-2.5 text-[0.8rem] text-[#5c4b00]">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Demo content editor.</strong> Edits and deletions are saved in this browser only and show up on the
        homepage straight away (open it in another tab to watch). Other visitors still see the original site. Site search, the AI guide and
        other pages keep using the original content until a real CMS is connected.
      </span>
    </p>
  );
}

/** Sub-navigation, page heading and actions shared by every content editor page. */
export function ContentFrame({ href, children }: { href: string; children: ReactNode }) {
  const page = CONTENT_PAGES.find((p) => p.href === href)!;
  const ready = useCmsReady();

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
      <ContentNav current={page.href} />
      <div className="min-w-0 space-y-5">
        <EditorNotice />
        <PageHeading page={page} />
        {ready ? (
          children
        ) : (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}

function ContentNav({ current }: { current: string }) {
  const { edited } = useCms();
  return (
    <nav aria-label="Website content" className="min-w-0 xl:sticky xl:top-24 xl:self-start">
      <p className="hidden px-2 pb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-gray-400 xl:block">Homepage</p>
      <ul className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 xl:mx-0 xl:flex-col xl:gap-0.5 xl:overflow-visible xl:px-0">
        {CONTENT_PAGES.map((p) => {
          const active = p.href === current;
          const changed = p.keys.some((k) => edited[k]);
          return (
            <li key={p.href} className="shrink-0">
              <Link
                href={p.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors xl:px-2.5",
                  active ? "bg-teal-500 text-white xl:bg-teal-50 xl:text-teal-600" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-900 xl:bg-transparent xl:ring-0 xl:hover:bg-gray-100",
                )}
              >
                <p.icon className={cn("size-4 shrink-0", active ? "xl:text-teal-500" : "text-gray-400")} aria-hidden="true" />
                <span className="truncate">{p.label}</span>
                {changed && (
                  <span className="ml-auto size-1.5 shrink-0 rounded-full bg-sun-500" title="Edited">
                    <span className="sr-only">(edited)</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PageHeading({ page }: { page: ContentPage }) {
  const { content, edited } = useCms();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const changed = page.keys.some((k) => edited[k]);

  const restore = () => {
    const previous = page.keys.map((k) => [k, content[k]] as const);
    const result = resetContent(page.keys);
    if (!result.ok) return toast({ message: result.error, tone: "error" });
    toast({
      message: `${page.label} restored to the original content.`,
      action: {
        label: "Undo",
        run: () => previous.forEach(([k, v]) => saveContent(k as ContentKey, v as SiteContent[ContentKey])),
      },
    });
  };

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {page.title}
          {changed && (
            <span className="rounded-md bg-sun-50 px-1.5 py-0.5 text-[0.7rem] font-semibold text-[#7a6400] ring-1 ring-inset ring-sun-200">Edited</span>
          )}
        </h2>
        <p className="mt-0.5 max-w-2xl text-sm text-gray-500">{page.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!changed} onClick={() => setConfirm(true)}>
          <RotateCcw className="size-4" aria-hidden="true" /> Restore original
        </Button>
        <a
          href={page.preview}
          target="_blank"
          rel="noopener"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 text-sm font-medium text-white shadow-sm hover:bg-teal-600"
        >
          View on site <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={restore}
        title={`Restore ${page.label.toLowerCase()}?`}
        confirmLabel="Restore original"
        message="Your edits and deletions on this page will be replaced with the original homepage content. You can undo straight after."
      />
    </div>
  );
}
