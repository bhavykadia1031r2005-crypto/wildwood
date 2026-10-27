"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { useStopAnimations } from "@/lib/a11y";

/** Turns off Motion's UI animations when "Stop animations" is on (and follows the OS setting otherwise). */
export function A11yMotion({ children }: { children: ReactNode }) {
  const stop = useStopAnimations();
  return <MotionConfig reducedMotion={stop ? "always" : "user"}>{children}</MotionConfig>;
}
