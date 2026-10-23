"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { MagneticButton } from "@/components/ui/Button";
import { useNavigation } from "@/lib/cms/navigation";
import { useActiveSection, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

/**
 * Floating capsule navigation with wave-lip ends (see `.nav-shape`).
 * On the homepage it sits translucent over the hero, turns solid teal once
 * the page scrolls, and tucks away while scrolling down.
 */
export function Navbar({ overHero = true }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(!overHero);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { links, primaryCta, secondaryCta, sectionIds, version } = useNavigation();
  const active = useActiveSection(sectionIds, version);
  const reduced = useReducedMotion();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setScrolled(!overHero || y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > 520 && y > lastY);
        lastY = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  // "/" or ⌘K / Ctrl+K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable=true]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const tucked = hidden && !menuOpen && !searchOpen;
  const solid = scrolled || menuOpen;

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: tucked ? -128 : 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4"
      >
        <div className="nav-enter relative mx-auto max-w-[1320px]">
          {/* Drop shadow lives on a wrapper because filters run before masks. */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 transition-[filter] duration-500",
              solid && "drop-shadow-[0_18px_30px_rgb(4_23_28/0.28)]",
            )}
          >
            <div
              className={cn(
                "nav-shape absolute inset-0 transition-colors duration-500",
                solid ? "bg-teal-500" : "bg-teal-900/45",
              )}
            />
            <div
              className={cn(
                "nav-shape absolute inset-0 bg-linear-to-r from-turquoise-500/0 via-turquoise-500/0 to-turquoise-500/25 transition-opacity duration-500",
                solid ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          <nav
            aria-label="Primary"
            className="relative flex h-[68px] items-center gap-3 pl-8 pr-3 sm:pl-10 lg:pl-11"
          >
            <Link
              href="/#top"
              aria-label="The Wildwoods, New Jersey — home"
              className="shrink-0 rounded-full"
              onClick={closeMenu}
            >
              <Logo tone="light" preload className="h-11 w-auto sm:h-12" />
            </Link>

            <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
              {links.map((item) => {
                const isActive = item.section !== null && item.section === active;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "group relative block rounded-full px-3.5 py-2 text-[0.92rem] font-semibold transition-colors xl:px-4",
                        isActive ? "text-teal-700" : "text-white/85 hover:text-white",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-full bg-sun-500"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                      {!isActive && (
                        <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-sun-400 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search the Wildwoods"
                aria-haspopup="dialog"
                className="grid size-11 place-items-center rounded-full text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-teal-600"
              >
                <Search className="size-[1.15rem]" strokeWidth={2.4} />
              </button>
              <MagneticButton
                href={primaryCta.href}
                variant="sun"
                size="sm"
                wrapperClassName="hidden sm:inline-flex"
                className="h-11 px-5"
              >
                {primaryCta.label}
              </MagneticButton>
              <MagneticButton
                href={secondaryCta.href}
                variant="outline-light"
                size="sm"
                wrapperClassName="hidden xl:inline-flex"
                className="h-11 px-5"
              >
                {secondaryCta.label}
              </MagneticButton>
              <button
                ref={menuButton}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="relative grid size-11 place-items-center rounded-full bg-white text-teal-600 lg:hidden"
              >
                <span className="sr-only">Menu</span>
                <span aria-hidden="true" className="relative block h-3.5 w-5">
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300",
                      menuOpen && "translate-y-[6px] rotate-45",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-1.5 h-0.5 w-3.5 rounded-full bg-current transition-opacity duration-200",
                      menuOpen && "opacity-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-3 h-0.5 w-5 rounded-full bg-current transition-transform duration-300",
                      menuOpen && "-translate-y-[6px] -rotate-45",
                    )}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={closeMenu} activeSection={active} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
