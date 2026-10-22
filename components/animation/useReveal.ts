"use client";

import type { RefObject } from "react";
import { gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/animation";

/**
 * Scroll reveals for everything inside `scope`:
 *  - `[data-split]`   headings are split into masked lines that rise into view.
 *  - `[data-reveal]`  elements fade and drift in, batched for a natural stagger.
 *    Optional value sets direction: "up" (default) | "left" | "right" | "scale".
 *
 * Content is only hidden once JS runs and motion is allowed, so nothing is lost
 * without JavaScript or with prefers-reduced-motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const root = scope.current;
        if (!root) return;

        gsap.utils.toArray<HTMLElement>("[data-split]", root).forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 112,
                duration: 1.15,
                ease: "expo.out",
                stagger: 0.085,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            },
          });
        });

        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
        // Sideways entrances only on wide screens; offsetting off-canvas on phones widens the layout viewport.
        const wide = window.matchMedia("(min-width: 1024px)").matches;
        items.forEach((el) => {
          const raw = el.dataset.reveal;
          const dir = !wide && (raw === "left" || raw === "right") ? "up" : raw;
          // Opacity only (not visibility) so unrevealed controls stay focusable and in the a11y tree.
          gsap.set(el, {
            opacity: 0,
            y: dir === "left" || dir === "right" ? 0 : dir === "scale" ? 0 : 42,
            x: dir === "left" ? -56 : dir === "right" ? 56 : 0,
            scale: dir === "scale" ? 0.94 : 1,
          });
        });

        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              stagger: 0.09,
              overwrite: true,
              clearProps: "transform",
            }),
        });
      });
    },
    { scope },
  );
}
