"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Briefcase, Building2, ChevronDown } from "lucide-react";
import type { NavLink } from "@/lib/cms/content";
import { cn } from "@/lib/utils";
import { navItemClass } from "./navStyles";

const iconFor = (href: string) => (href.includes("convention") ? Building2 : Briefcase);

/**
 * Menu item with a dropdown of related links (disclosure pattern): opens on hover
 * for mouse users and on click/Enter for everyone; Escape or clicking away closes it.
 */
export function NavDropdown({ item, active }: { item: NavLink; active: boolean }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const id = useId();
  const children = item.children ?? [];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const focusItem = (index: number) => {
    const links = wrap.current?.querySelectorAll<HTMLElement>("[data-menu-link]");
    if (links?.length) links[(index + links.length) % links.length].focus();
  };

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const links = Array.from(wrap.current?.querySelectorAll<HTMLElement>("[data-menu-link]") ?? []);
    const i = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i <= 0) button.current?.focus();
      else focusItem(i - 1);
    }
  };

  return (
    <li
      ref={wrap}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        window.clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        closeTimer.current = window.setTimeout(() => setOpen(false), 160);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
        className={cn(
          navItemClass,
          "flex items-center gap-1",
          active ? "text-teal-700" : "text-white/85 hover:text-white",
        )}
      >
        {active && (
          <motion.span layoutId="nav-active-pill" className="absolute inset-0 rounded-full bg-sun-500" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
        )}
        <span className="relative">{item.label}</span>
        <ChevronDown className={cn("relative size-3.5 transition-transform duration-300", open && "rotate-180")} strokeWidth={2.6} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onKeyDown={onMenuKey}
            className="on-light absolute left-1/2 top-full z-10 w-[22rem] -translate-x-1/2 pt-3"
          >
            <ul className="rounded-[1.5rem] bg-white p-2 text-ink shadow-[0_24px_60px_-20px_rgb(4_23_28/0.45)] ring-1 ring-teal-500/10">
              {children.map((c) => {
                const Icon = iconFor(c.href);
                return (
                  <li key={c.id}>
                    <Link
                      href={c.href}
                      data-menu-link
                      onClick={() => setOpen(false)}
                      className="group/item flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-cream focus-visible:bg-cream"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover/item:bg-sun-500 group-hover/item:text-teal-700">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display font-bold text-teal-600">{c.label}</span>
                        {c.description && <span className="block text-[0.8rem] leading-snug text-ink/60">{c.description}</span>}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ocean-600 opacity-0 transition group-hover/item:translate-x-0.5 group-hover/item:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
