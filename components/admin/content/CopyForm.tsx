"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ContentKey, SiteContent } from "@/lib/cms/content";
import { saveContent, useCms } from "@/lib/cms/store";
import { cn } from "@/lib/utils";
import { Button, Card, CardHeader } from "../ui";
import { FormFields, validate, type Errors, type FieldDef } from "./fields";
import { useToast } from "./Toaster";

/** Warns before leaving the page with unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

const trimStrings = <T,>(obj: T): T =>
  Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])) as T;

/**
 * Card with a draft form for some fields of one content object. Only the
 * listed fields are saved, so several forms can edit the same object.
 */
export function CopyForm<K extends ContentKey>({
  contentKey,
  fields,
  title,
  description,
}: {
  contentKey: K;
  fields: FieldDef<SiteContent[K]>[];
  title: string;
  description?: string;
}) {
  const { content } = useCms();
  const saved = content[contentKey];
  const fingerprint = JSON.stringify(fields.map((f) => saved[f.key]));
  // Remount (resetting the draft) when the saved values change: after a save, undo or reset elsewhere.
  return <Form key={fingerprint} contentKey={contentKey} fields={fields} saved={saved} title={title} description={description} />;
}

function Form<K extends ContentKey>({
  contentKey,
  fields,
  saved,
  title,
  description,
}: {
  contentKey: K;
  fields: FieldDef<SiteContent[K]>[];
  saved: SiteContent[K];
  title: string;
  description?: string;
}) {
  const [draft, setDraft] = useState(saved);
  const [errors, setErrors] = useState<Errors>({});
  const toast = useToast();
  const dirty = fields.some((f) => JSON.stringify(draft[f.key]) !== JSON.stringify(saved[f.key]));
  useUnsavedWarning(dirty);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(fields, draft);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const picked = Object.fromEntries(fields.map((f) => [f.key, draft[f.key]]));
    const previous = saved;
    const result = saveContent(contentKey, trimStrings({ ...saved, ...picked }));
    if (!result.ok) return toast({ message: result.error, tone: "error" });
    toast({ message: `${title} saved. It's live on the homepage in this browser.`, action: { label: "Undo", run: () => saveContent(contentKey, previous) } });
  };

  return (
    <Card>
      <form onSubmit={submit} noValidate>
        <CardHeader title={title} description={description} />
        <div className="px-5 pb-5 pt-4">
          <FormFields
            fields={fields}
            value={draft}
            onChange={(next) => {
              setDraft(next);
              if (Object.keys(errors).length) setErrors(validate(fields, next));
            }}
            errors={errors}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <p className={cn("mr-auto text-[0.78rem]", dirty ? "font-medium text-[#7a6400]" : "text-gray-400")} aria-live="polite">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <Button
            disabled={!dirty}
            onClick={() => {
              setDraft(saved);
              setErrors({});
            }}
          >
            Discard
          </Button>
          <Button type="submit" variant="primary" disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
