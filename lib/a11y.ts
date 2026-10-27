"use client";

/**
 * Accessibility menu state: saved in this browser, applied to <html> on every
 * change and kept in sync across open tabs.
 */

import { useSyncExternalStore } from "react";
import { A11Y_DEFAULTS, A11Y_STORAGE_KEY, applyA11ySettings, type A11ySettings } from "./a11y-apply";

export type { A11ySettings };
export { A11Y_DEFAULTS };

let state: A11ySettings | null = null;
const listeners = new Set<() => void>();

function read(): A11ySettings {
  try {
    const saved = JSON.parse(window.localStorage.getItem(A11Y_STORAGE_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return A11Y_DEFAULTS;
    const next = { ...A11Y_DEFAULTS };
    for (const key of Object.keys(A11Y_DEFAULTS) as (keyof A11ySettings)[]) {
      if (typeof saved[key] === typeof A11Y_DEFAULTS[key]) (next as Record<string, unknown>)[key] = saved[key];
    }
    return next;
  } catch {
    return A11Y_DEFAULTS;
  }
}

function getState() {
  if (!state) state = read();
  return state;
}

function commit(next: A11ySettings) {
  state = next;
  try {
    const changed = (Object.keys(next) as (keyof A11ySettings)[]).some((k) => next[k] !== A11Y_DEFAULTS[k]);
    if (changed) window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(A11Y_STORAGE_KEY);
  } catch {
    /* Storage blocked: settings still apply for this page view. */
  }
  applyA11ySettings(next, document.documentElement);
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== A11Y_STORAGE_KEY) return;
  state = read();
  applyA11ySettings(state, document.documentElement);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useA11y(): A11ySettings {
  return useSyncExternalStore(subscribe, getState, () => A11Y_DEFAULTS);
}

export function setA11y(patch: Partial<A11ySettings>) {
  commit({ ...getState(), ...patch });
}

export function resetA11y() {
  commit(A11Y_DEFAULTS);
}

/** True when the visitor turned on "Stop animations" in the accessibility menu. */
export function useStopAnimations() {
  return useSyncExternalStore(
    subscribe,
    () => getState().stopAnimations,
    () => false,
  );
}
