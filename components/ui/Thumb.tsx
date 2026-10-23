import Image from "next/image";
import { isUploadedImage, resolveImage } from "@/lib/cms/render";
import { cn } from "@/lib/utils";

/** Small preview tile for a content image reference. */
export function Thumb({
  refValue,
  className,
  alt = "",
  uploadBadge = false,
}: {
  refValue?: string;
  className?: string;
  alt?: string;
  /** Marks demo uploads (admin only). */
  uploadBadge?: boolean;
}) {
  const img = resolveImage(refValue, alt);
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-lg bg-gray-100", className)}>
      {img && <Image src={img.src} alt={alt} fill sizes="120px" className="object-cover" />}
      {uploadBadge && isUploadedImage(refValue) && (
        <span className="absolute bottom-0.5 left-0.5 rounded bg-gray-900/70 px-1 text-[0.55rem] font-semibold uppercase tracking-wide text-white">Upload</span>
      )}
    </span>
  );
}
