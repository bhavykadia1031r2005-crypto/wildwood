import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial section opener: numbered eyebrow, oversized display heading and lede.
 * Animation hooks (`data-split`, `data-reveal`) are picked up by `useReveal`.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  tone = "dark",
  align = "left",
  id,
  className,
  children,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  const light = tone === "light";
  return (
    <header
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <p
        data-reveal
        className={cn(
          "eyebrow flex items-center gap-3",
          light ? "text-turquoise-300" : "text-ocean-600",
        )}
      >
        <span
          className={cn(
            "inline-flex h-7 min-w-11 items-center justify-center rounded-full px-2.5 font-display text-[0.7rem] tracking-[0.12em]",
            light ? "bg-white/10 text-sun-400" : "bg-teal-500 text-sun-400",
          )}
        >
          {index}
        </span>
        {eyebrow}
      </p>
      <h2
        id={id}
        data-split
        className={cn(
          "display max-w-[16ch] text-[clamp(3rem,8.4vw,7.75rem)]",
          light ? "text-white" : "text-teal-500",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          data-reveal
          className={cn(
            "max-w-xl text-lg leading-relaxed md:text-xl",
            light ? "text-teal-50/85" : "text-ink/75",
          )}
        >
          {lede}
        </p>
      )}
      {children}
    </header>
  );
}
