"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/animation";

/**
 * ScrollTrigger caches trigger positions. Interactive sections (itinerary
 * results, filters, "show more") change the page height, so recalculate
 * whenever the document resizes — otherwise reveals below a shrinking section
 * could wait for a scroll position that no longer exists.
 */
export function ScrollRefresh() {
  useEffect(() => {
    let timer = 0;
    let lastHeight = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastHeight) < 2) return;
      lastHeight = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
  return null;
}
