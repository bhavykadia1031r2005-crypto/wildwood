"use client";

import { AnimatePresence, motion } from "motion/react";
import { Briefcase, Building2 } from "lucide-react";
import { useActiveSection } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const PARTS = [
  { id: "business-info", label: "Business Info", icon: Briefcase },
  { id: "convention-center", label: "Convention Center", icon: Building2 },
];

/** Floating two-part switcher for the Business Info page: shows where you are and jumps between parts. */
export function BusinessSwitcher() {
  const active = useActiveSection(PARTS.map((p) => p.id));
  return (
    <AnimatePresence>
      {active && (
        <motion.nav
          aria-label="Parts of this page"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="page-switcher fixed inset-x-0 bottom-[5.75rem] z-[55] flex justify-center px-4 sm:bottom-6"
        >
          <ul className="flex gap-1 rounded-full bg-teal-700/95 p-1.5 shadow-[0_16px_40px_-12px_rgb(4_23_28/0.6)] ring-1 ring-white/15 backdrop-blur">
            {PARTS.map((p) => {
              const on = active === p.id;
              return (
                <li key={p.id}>
                  <a
                    href={`#${p.id}`}
                    aria-current={on ? "location" : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors",
                      on ? "text-teal-700" : "text-white/85 hover:text-white",
                    )}
                  >
                    {on && (
                      <motion.span layoutId="business-part" className="absolute inset-0 rounded-full bg-sun-500" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                    )}
                    <p.icon className="relative size-4" aria-hidden="true" />
                    <span className="relative">{p.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
