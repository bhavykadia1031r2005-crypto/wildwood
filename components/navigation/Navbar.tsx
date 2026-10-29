"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses, MagneticButton } from "@/components/ui/Button";
import { WishlistNav } from "@/components/wishlist/WishlistNav";
import { useNavigation } from "@/lib/cms/navigation";
import { useActiveSection, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { NavDropdown } from "./NavDropdown";
import { navItemClass } from "./navStyles";
import { SearchOverlay } from "./SearchOverlay";

/**
 * How much fits on one row at desktop widths, from most to least: links with both
 * buttons, links with the main button, links only, or the menu button. Measured, so
 * it adapts to larger text, accessibility spacing and longer CMS link labels.
 */
type Fit = "full" | "one" | "links" | "menu";

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
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { links, primaryCta, secondaryCta, sectionIds, version } = useNavigation();
  const active = useActiveSection(sectionIds, version);
  const pathname = usePathname();
  // Page links (not homepage anchors) light up on their own page.
  const onPage = (href: string) => !href.includes("#") && href !== "/" && pathname.startsWith(href);
  const reduced = useReducedMotion();
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const logo = useRef<HTMLAnchorElement>(null);
  const icons = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  // null until measured (and below lg), where the breakpoint classes apply.
  const [fit, setFit] = useState<Fit | null>(null);

  useEffect(() => {
    const row = nav.current;
    const probe = measure.current;
    if (!row || !probe) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const compute = () => {
      if (!desktop.matches) return setFit(null);
      const cs = getComputedStyle(row);
      const gap = parseFloat(cs.columnGap) || 12;
      const inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const [linksW, mainW, secondW] = Array.from(probe.children, (el) => (el as HTMLElement).offsetWidth);
      // Logo, search + wishlist, the gaps between groups and some breathing room around the links.
      const fixed = (logo.current?.offsetWidth ?? 0) + (icons.current?.offsetWidth ?? 0) + gap * 2 + 32;
      const next: Fit =
        fixed + linksW + mainW + secondW + 16 <= inner ? "full" : fixed + linksW + mainW + 8 <= inner ? "one" : fixed + linksW <= inner ? "links" : "menu";
      setFit(next);
      if (next !== "menu") setMenuOpen(false);
    };
    const observer = new ResizeObserver(compute);
    observer.observe(row);
    observer.observe(probe);
    desktop.addEventListener("change", compute);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", compute);
    };
  }, []);

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
  const tucked = hidden && !menuOpen && !searchOpen && !wishlistOpen;
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
            ref={nav}
            aria-label="Primary"
            className="relative flex h-[68px] items-center gap-3 pl-8 pr-3 sm:pl-10 lg:pl-11"
          >
            {/* Invisible copy of the menu items and buttons, measured to decide what fits. */}
            <div ref={measure} aria-hidden="true" inert className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-center">
              <ul className="flex shrink-0 items-center gap-0.5">
                {links.map((item) => (
                  <li key={item.id} className={cn(navItemClass, "flex items-center gap-1")}>
                    {item.label}
                    {item.children?.length ? <ChevronDown className="size-3.5" strokeWidth={2.6} /> : null}
                  </li>
                ))}
              </ul>
              <span className={buttonClasses("sun", "sm", "h-11 shrink-0 px-5")}>{primaryCta.label}</span>
              <span className={buttonClasses("outline-light", "sm", "h-11 shrink-0 px-5")}>{secondaryCta.label}</span>
            </div>

            <Link
              ref={logo}
              href="/#top"
              aria-label="The Wildwoods, New Jersey — home"
              className="shrink-0 rounded-full"
              onClick={closeMenu}
            >
              <Logo tone="light" preload className="h-11 w-auto sm:h-12" />
            </Link>

            <ul className={cn("mx-auto items-center gap-0.5", fit === "menu" ? "hidden" : "hidden lg:flex")}>
              {links.map((item) => {
                const isActive = (item.section !== null && item.section === active) || onPage(item.href);
                if (item.children?.length) return <NavDropdown key={item.id} item={item} active={isActive} />;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? (onPage(item.href) ? "page" : "location") : undefined}
                      className={cn(navItemClass, "block", isActive ? "text-teal-700" : "text-white/85 hover:text-white")}
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

            <div className={cn("ml-auto flex shrink-0 items-center gap-2", fit !== "menu" && "lg:ml-0")}>
              <div ref={icons} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search the Wildwoods"
                  aria-haspopup="dialog"
                  className="grid size-11 place-items-center rounded-full text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-teal-600"
                >
                  <Search className="size-[1.15rem]" strokeWidth={2.4} />
                </button>
                <WishlistNav onOpenChange={setWishlistOpen} />
              </div>
              <MagneticButton
                href={primaryCta.href}
                variant="sun"
                size="sm"
                wrapperClassName={
                  fit === null ? "hidden sm:inline-flex lg:hidden xl:inline-flex" : fit === "links" ? "hidden" : "hidden sm:inline-flex"
                }
                className="h-11 px-5"
              >
                {primaryCta.label}
              </MagneticButton>
              <MagneticButton
                href={secondaryCta.href}
                variant="outline-light"
                size="sm"
                wrapperClassName={fit === null ? "hidden min-[1360px]:inline-flex" : fit === "full" ? "inline-flex" : "hidden"}
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
                className={cn("relative grid size-11 place-items-center rounded-full bg-white text-teal-600", fit !== "menu" && "lg:hidden")}
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

      <MobileMenu open={menuOpen} onClose={closeMenu} activeSection={active} desktop={fit === "menu"} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
