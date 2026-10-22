"use client";

import Link from "next/link";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { navCtas, primaryNav } from "@/lib/site";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function MobileMenu({
  open,
  onClose,
  activeSection,
}: {
  open: boolean;
  onClose: () => void;
  activeSection: string | null;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, open, onClose);
  useScrollLock(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-teal-600 px-6 pb-10 pt-28 text-white lg:hidden"
          initial={{ clipPath: "circle(0% at calc(100% - 3.5rem) 3.5rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 3.5rem) 3.5rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 3.5rem) 3.5rem)" }}
          transition={{ duration: 0.65, ease }}
        >
          {/* Decorative sun & wave, drawn from the brand palette */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-24 size-72 rounded-full bg-linear-to-b from-sun-500 to-orange-500 opacity-90" />
          <svg
            aria-hidden="true"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-turquoise-500"
          >
            <path d="M0 60c60-40 110-40 170 0s120 40 230-10v70H0z" fill="currentColor" opacity="0.9" />
            <path d="M0 90c70-30 130-25 190 5s120 25 210-15v40H0z" fill="#087D9C" />
          </svg>

          <nav aria-label="Mobile" className="relative">
            <ul className="flex flex-col gap-1">
              {primaryNav.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
                  transition={{ delay: 0.18 + i * 0.06, duration: 0.6, ease }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={item.section === activeSection ? "location" : undefined}
                    className={cn(
                      "display flex items-center justify-between border-b border-white/15 py-4 text-[clamp(2.4rem,11vw,3.6rem)]",
                      item.section === activeSection ? "text-sun-400" : "text-white",
                    )}
                  >
                    {item.label}
                    <ArrowUpRight className="size-7 text-turquoise-300" aria-hidden="true" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="relative mt-10 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease }}
          >
            <Link
              href={navCtas.primary.href}
              onClick={onClose}
              className="inline-flex h-14 items-center justify-center rounded-full bg-sun-500 px-7 font-semibold text-teal-700"
            >
              {navCtas.primary.label}
            </Link>
            <Link
              href={navCtas.secondary.href}
              onClick={onClose}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 font-semibold text-teal-600"
            >
              {navCtas.secondary.label}
            </Link>
          </motion.div>
          <button
            type="button"
            onClick={onClose}
            className="sr-only rounded-full bg-white px-5 py-3 font-semibold text-teal-600 focus:not-sr-only focus:relative focus:mt-6 focus:self-start"
          >
            Close menu
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
