"use client";

import type { MouseEvent } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { emit } from "@/lib/events";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { toggleSaved, useIsSaved, type SavedType } from "@/lib/wishlist";

/**
 * Heart toggle that adds an item to the visitor's wishlist.
 *  - "overlay": round white button over a photo
 *  - "pill":    labelled "Save" / "Saved" button
 *  - "mini":    small icon button for compact widgets
 */
export function SaveButton({
  type,
  id,
  title,
  variant = "overlay",
  size = "md",
  className,
}: {
  type: SavedType;
  id: string;
  title: string;
  variant?: "overlay" | "pill" | "mini";
  /** Pill height. */
  size?: "sm" | "md";
  className?: string;
}) {
  const saved = useIsSaved(type, id);
  const reduced = useReducedMotion();

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleSaved({ type, id, title })) emit("ww:wishlist-saved", { title });
  };

  const heart = (
    <motion.span
      key={saved ? "on" : "off"}
      initial={reduced ? false : { scale: saved ? 0.4 : 0.85 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 14 }}
      className="grid place-items-center"
    >
      <Heart
        className={cn(variant === "mini" ? "size-3.5" : "size-[1.1rem]", saved ? "fill-coral-500 text-coral-500" : "text-current")}
        strokeWidth={2.4}
        aria-hidden="true"
      />
    </motion.span>
  );

  const label = saved ? `Remove ${title} from your wishlist` : `Save ${title} to your wishlist`;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-full text-sm font-semibold transition-colors",
          size === "sm" ? "h-9 px-3.5" : "h-10 px-4",
          saved ? "bg-coral-100 text-coral-700 hover:bg-coral-100/70" : "bg-white text-teal-600 ring-1 ring-inset ring-teal-500/20 hover:ring-coral-500/50",
          className,
        )}
      >
        {heart}
        <span aria-hidden="true">{saved ? "Saved" : "Save"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved to your wishlist" : "Save to your wishlist"}
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-colors",
        variant === "mini"
          ? "size-7 bg-teal-50 text-teal-600 hover:bg-coral-100 hover:text-coral-600"
          : "size-10 bg-white/95 text-teal-600 shadow-soft hover:bg-white hover:text-coral-600",
        className,
      )}
    >
      {heart}
    </button>
  );
}
