"use client";

/**
 * Single entry point for GSAP. Scroll storytelling (reveals, parallax, pinned
 * or scrubbed motion) is owned by GSAP; Motion for React handles UI state
 * transitions (menus, dialogs, filters). Never let both drive the same element.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export const EASE = {
  out: "power3.out",
  expo: "expo.out",
  inOut: "power2.inOut",
} as const;

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const REDUCED = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
