"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/animation";
import { getMedia } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * Cover image that drifts slightly slower than the page. The image is oversized
 * by `strength` so the movement never reveals an edge. The caller positions the
 * wrapper (e.g. `relative aspect-video` or `absolute inset-0`).
 */
export function ParallaxImage({
  mediaId,
  className,
  sizes = "100vw",
  strength = 12,
  imageClassName,
  alt,
  preload,
}: {
  mediaId: string;
  className?: string;
  sizes?: string;
  strength?: number;
  imageClassName?: string;
  alt?: string;
  preload?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const m = getMedia(mediaId);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          inner.current,
          { yPercent: -strength / 2 },
          {
            yPercent: strength / 2,
            ease: "none",
            scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={cn("overflow-hidden", className)}>
      <div
        ref={inner}
        data-scroll-motion
        className="absolute inset-x-0 will-change-transform"
        style={{ top: `-${strength / 2}%`, bottom: `-${strength / 2}%` }}
      >
        <Image
          src={m.src}
          alt={alt ?? m.alt}
          fill
          sizes={sizes}
          preload={preload}
          className={cn("object-cover", imageClassName)}
        />
      </div>
    </div>
  );
}
