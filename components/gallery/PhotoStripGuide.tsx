"use client";

import Image from "next/image";
import { useRef } from "react";
import { useReveal } from "@/components/animation/useReveal";
import { getMedia } from "@/data/media";
import { gsap, MOTION_OK, useGSAP } from "@/lib/animation";
import { cn } from "@/lib/utils";
import { TravelQRCode } from "./TravelQRCode";

const filmstrip = [
  "wildwoods-sign-kites",
  "carousel-ferris-wheel-night",
  "sunrise-northeast",
  "doo-wop-motel-doors",
  "boardwalk-tramcar",
  "beach-lifeguard-rainbow",
  "macks-neon",
  "hereford-lighthouse",
  "kite-festival",
  "lollipop-motel-sign",
];

/** Scroll-driven photo strip followed by the "Take Wildwoods with you" QR pocket guide. */
export function PhotoStripGuide() {
  const root = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  useReveal(root);

  // Horizontal storytelling: the filmstrip glides sideways as the page scrolls.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = strip.current;
        if (!el) return;
        gsap.fromTo(
          el,
          { x: () => -Math.max(0, el.scrollWidth - window.innerWidth) * 0.1 },
          {
            x: () => -Math.max(0, el.scrollWidth - window.innerWidth) * 0.9,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section id="pocket-guide" ref={root} className="on-light relative overflow-x-clip bg-white pb-24 pt-2 md:pb-32 md:pt-4">
      <div aria-hidden="true" className="overflow-hidden">
        <div ref={strip} className="flex w-max gap-4 pl-5 will-change-transform sm:pl-8">
          {filmstrip.map((id, i) => {
            const m = getMedia(id);
            return (
              <div
                key={id}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-[1.75rem]",
                  i % 3 === 0 ? "h-56 w-80 md:h-72 md:w-[26rem]" : i % 3 === 1 ? "h-56 w-44 md:h-72 md:w-56" : "h-56 w-64 md:h-72 md:w-80",
                )}
              >
                <Image src={m.src} alt="" fill sizes="(min-width: 768px) 420px, 320px" className="object-cover" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <TravelQRCode />
      </div>
    </section>
  );
}
