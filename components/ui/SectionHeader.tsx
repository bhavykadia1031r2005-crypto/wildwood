import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial section opener: oversized display heading and optional lede.
 * Animation hooks (`data-split`, `data-reveal`) are picked up by `useReveal`.
 */
export function SectionHeader({
  title,
  lede,
  tone = "dark",
  align = "left",
  id,
  className,
  titleClassName,
  children,
}: {
  title: ReactNode;
  lede?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  id?: string;
  className?: string;
  /** Replaces the default title size and width limit. */
  titleClassName?: string;
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
      <h2
        id={id}
        data-split
        className={cn(
          "display",
          titleClassName ?? "max-w-[16ch] text-[clamp(3rem,8.4vw,7.75rem)]",
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
