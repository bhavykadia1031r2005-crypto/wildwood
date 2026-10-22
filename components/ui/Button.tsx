"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "sun" | "light" | "outline-light" | "teal" | "outline-dark" | "coral";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  sun: "bg-sun-500 text-teal-700 hover:bg-sun-300 shadow-[0_12px_30px_-12px_rgb(255_212_0/0.7)]",
  light: "bg-white text-teal-600 hover:bg-cream",
  "outline-light":
    "bg-white/0 text-white ring-1 ring-inset ring-white/60 hover:bg-white hover:text-teal-600 hover:ring-white",
  teal: "bg-teal-500 text-white hover:bg-teal-600",
  "outline-dark": "text-teal-600 ring-1 ring-inset ring-teal-500/30 hover:bg-teal-500 hover:text-white",
  coral: "bg-coral-500 text-white hover:bg-coral-600",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-12 px-6 text-[0.95rem] gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
};

export function buttonClasses(variant: Variant = "sun", size: Size = "md", className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.005em] transition-[background-color,color,box-shadow] duration-300",
    variants[variant],
    sizes[size],
    className,
  );
}

/** True only for precise, hover-capable pointers — magnetic motion is skipped on touch. */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * Pill button/link with a subtle magnetic pull on desktop pointers.
 * Renders a Next <Link> when `href` is given, otherwise a <button>.
 */
export function MagneticButton({
  href,
  children,
  variant = "sun",
  size = "md",
  className,
  icon,
  strength = 0.28,
  wrapperClassName,
  ...rest
}: {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Replaces the outer wrapper's default `inline-flex`, e.g. "hidden sm:inline-flex". */
  wrapperClassName?: string;
  icon?: ReactNode;
  strength?: number;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <>
      <span className="relative">{children}</span>
      {icon && (
        <span className="relative transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
          {icon}
        </span>
      )}
    </>
  );

  const cls = buttonClasses(variant, size, className);

  return (
    <motion.span
      ref={ref}
      className={wrapperClassName ?? "inline-flex"}
      style={fine ? { x, y } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {href ? (
        href.startsWith("http") ? (
          <a href={href} className={cls} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          <Link href={href} className={cls}>
            {content}
          </Link>
        )
      ) : (
        <button type="button" className={cls} {...rest}>
          {content}
        </button>
      )}
    </motion.span>
  );
}
