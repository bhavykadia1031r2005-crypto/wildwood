"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { useStopAnimations } from "./a11y";

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside `ref` while `active`, closes on Escape and
 * returns focus to whatever was focused before opening.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const raf = requestAnimationFrame(() => {
      const target = initialFocus?.current ?? node?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [active, ref, onEscape, initialFocus]);
}

/** Locks page scroll (without layout shift from the disappearing scrollbar). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [active]);
}

export function useMediaQuery(query: string, serverDefault = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}

/** OS "reduce motion" setting, or "Stop animations" in the site's accessibility menu. */
export function useReducedMotion() {
  const system = useMediaQuery("(prefers-reduced-motion: reduce)");
  return useStopAnimations() || system;
}

/**
 * Returns the id of the section currently crossing the upper part of the viewport.
 * Bump `version` when the sections themselves are re-rendered so they're observed again.
 */
export function useActiveSection(ids: string[], version: string | number = 0) {
  const [active, setActive] = useState<string | null>(null);
  const key = `${version}#${ids.join("|")}`;

  useEffect(() => {
    const els = key
      .slice(key.indexOf("#") + 1)
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const current = els.find((el) => visible.get(el.id));
        setActive(current?.id ?? null);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}

/** Browser origin, available after hydration (null during SSR). */
export function useOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null,
  );
}
