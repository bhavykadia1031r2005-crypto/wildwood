"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { useReveal } from "./useReveal";

type RevealProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

/** Client wrapper that applies scroll reveals to `[data-reveal]` / `[data-split]` descendants. */
export function Reveal<T extends ElementType = "div">({ as, children, ...rest }: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
