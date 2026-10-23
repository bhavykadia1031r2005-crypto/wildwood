import { Fragment } from "react";
import { allMedia, media } from "@/data/media";
import { moreToExplore } from "@/data/moreToExplore";
import { cn } from "@/lib/utils";

/** Renders "Stay a little *longer.*" with the starred words in the display-accent script. */
export function Accent({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className={cn("display-accent", className)}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export const plainText = (text: string) => text.replace(/\*/g, "");

/**
 * Single-line headings are sized to fit their default wording. Keep that
 * fitted size while the edited text is no longer than the default; otherwise
 * fall back to the standard wrapping heading so nothing overflows on phones.
 */
export function fittedTitleClass(text: string, defaultText: string, fitted: string) {
  return plainText(text).length <= plainText(defaultText).length ? fitted : undefined;
}

/* ---------- Images ---------- */

export type LibraryImage = { ref: string; src: string; alt: string; group: "Photography" | "Things to do" };

/** Images the editor can pick from: the photo registry plus the "More to explore" artwork. */
export const imageLibrary: LibraryImage[] = [
  ...allMedia
    .filter((m) => !m.id.startsWith("pano-"))
    .map((m) => ({ ref: m.id, src: m.src, alt: m.alt, group: "Photography" as const })),
  ...moreToExplore.map((c) => ({ ref: c.image, src: c.image, alt: c.alt, group: "Things to do" as const })),
];

/**
 * Content images are stored as a media id ("boardwalk-tramcar"), a local path
 * ("/images/explore/golf.jpg") or, for demo uploads, a data URL.
 */
export function resolveImage(ref: string | undefined, fallbackAlt = ""): { src: string; alt: string } | null {
  if (!ref) return null;
  const m = media[ref];
  if (m) return { src: m.src, alt: m.alt };
  if (ref.startsWith("data:image/") || ref.startsWith("/")) {
    return { src: ref, alt: imageLibrary.find((l) => l.src === ref)?.alt ?? fallbackAlt };
  }
  return null;
}

export const isUploadedImage = (ref: string | undefined) => Boolean(ref?.startsWith("data:"));
