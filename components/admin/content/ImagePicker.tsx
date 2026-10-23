"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState, type ComponentProps } from "react";
import { Check, ImageUp, LoaderCircle, Search } from "lucide-react";
import { imageLibrary } from "@/lib/cms/render";
import { Thumb as BaseThumb } from "@/components/ui/Thumb";
import { cn } from "@/lib/utils";

const MAX_EDGE = 1280;

/** Downscales an uploaded photo to a JPEG data URL small enough for browser storage. */
async function toDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file (JPG, PNG, WebP or GIF).");
  if (file.size > 15 * 1024 * 1024) throw new Error("That image is over 15 MB. Choose a smaller one.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser couldn't process the image.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.8);
}

/**
 * Library grid plus "Upload from computer". Uploads are resized and kept in
 * this browser with the rest of the demo edits, never sent to a server.
 */
export function ImagePicker({
  value,
  onPick,
  multiple = false,
  selected = [],
}: {
  value?: string;
  onPick: (ref: string, alt: string) => void;
  multiple?: boolean;
  selected?: string[];
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const id = useId();

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? imageLibrary.filter((i) => `${i.alt} ${i.ref}`.toLowerCase().includes(q)) : imageLibrary;
  }, [query]);

  const upload = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      onPick(await toDataUrl(f), "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that image.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search images</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos (e.g. beach, neon, pier)"
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
          />
        </label>
        <input ref={file} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
        <label
          htmlFor={id}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-teal-500 px-3 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus-within:ring-2 focus-within:ring-ocean-500",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ImageUp className="size-4" aria-hidden="true" />}
          Upload
        </label>
      </div>
      {error && (
        <p role="alert" className="text-[0.8rem] text-coral-700">
          {error}
        </p>
      )}
      <p className="text-[0.75rem] text-gray-500">Uploads are resized to {MAX_EDGE}px and saved in this browser only.</p>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No photos match “{query}”.</p>
      ) : (
        <ul className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4" role="list">
          {items.map((img) => {
            const active = multiple ? selected.includes(img.ref) : value === img.ref || value === img.src;
            return (
              <li key={img.ref}>
                <button
                  type="button"
                  onClick={() => onPick(img.ref, img.alt)}
                  aria-pressed={active}
                  title={img.alt}
                  className={cn(
                    "group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500",
                    active && "ring-2 ring-teal-500",
                  )}
                >
                  <Image src={img.src} alt={img.alt} fill sizes="160px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  {active && (
                    <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-teal-500 text-white">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Thumbnail that marks demo uploads, for the editor's lists. */
export function Thumb(props: Omit<ComponentProps<typeof BaseThumb>, "uploadBadge">) {
  return <BaseThumb {...props} uploadBadge />;
}
