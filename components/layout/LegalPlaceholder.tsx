import type { ReactNode } from "react";
import { Notice, PageShell } from "./PageShell";

/** Placeholder for policy pages until the official text (or URL in lib/site.ts) is supplied. */
export function LegalPlaceholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <PageShell eyebrow="Legal" title={title}>
      <Notice>
        Placeholder page. The official {title.toLowerCase()} will be published by the Wildwoods tourism team. To link to an
        existing policy instead, set its URL in <code>lib/site.ts</code> (or the matching environment variable).
      </Notice>
      {children && <div className="mt-10 max-w-3xl space-y-4 text-lg leading-relaxed text-ink/75">{children}</div>}
    </PageShell>
  );
}
