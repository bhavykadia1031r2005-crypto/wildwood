"use client";

/**
 * Demo content store. Edits made in /admin/content are saved to this browser's
 * localStorage and read back by the homepage, so changes show up instantly —
 * including in other open tabs — without a backend. Nothing is sent anywhere,
 * and other visitors always see the defaults.
 *
 * To make it real, swap `read`/`write` for calls to a CMS or database; the
 * components only use `useCms`, `useContent`, `saveContent` and `resetContent`.
 */

import { useSyncExternalStore } from "react";
import { defaultContent, type ContentKey, type SiteContent } from "./content";

const STORAGE_KEY = "wildwoods-cms-demo";
const VERSION = 1;
const KEYS = Object.keys(defaultContent) as ContentKey[];

export type CmsState = {
  content: SiteContent;
  /** Keys that differ from the defaults. */
  edited: Partial<Record<ContentKey, true>>;
  /** Bumped whenever a key changes, so animated sections can remount cleanly. */
  rev: Partial<Record<ContentKey, number>>;
};

type Overrides = Partial<SiteContent>;

const serverState: CmsState = { content: defaultContent, edited: {}, rev: {} };
let overrides: Overrides = {};
let state: CmsState | null = null;
const listeners = new Set<() => void>();

function read(): Overrides {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw) as { v?: number; data?: Record<string, unknown> };
    if (saved?.v !== VERSION || !saved.data || typeof saved.data !== "object") return {};
    const clean: Record<string, unknown> = {};
    for (const key of KEYS) if (key in saved.data) clean[key] = saved.data[key];
    return clean as Overrides;
  } catch {
    return {};
  }
}

function write(next: Overrides) {
  if (Object.keys(next).length === 0) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, data: next }));
}

function build(next: Overrides, prev: CmsState | null): CmsState {
  const content = { ...defaultContent, ...next } as SiteContent;
  const edited: CmsState["edited"] = {};
  const rev: CmsState["rev"] = {};
  for (const key of KEYS) {
    if (key in next) edited[key] = true;
    const before = prev ? prev.content[key] : defaultContent[key];
    const changed = before !== content[key] && JSON.stringify(before) !== JSON.stringify(content[key]);
    rev[key] = (prev?.rev[key] ?? 0) + (changed ? 1 : 0);
  }
  return { content, edited, rev };
}

function getState(): CmsState {
  if (!state) {
    overrides = read();
    state = build(overrides, null);
  }
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== STORAGE_KEY) return;
  overrides = read();
  state = build(overrides, getState());
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function commit(next: Overrides): SaveResult {
  try {
    write(next);
  } catch {
    return {
      ok: false,
      error: "This browser's storage is full. Remove some uploaded images, or reset the demo edits, and try again.",
    };
  }
  overrides = next;
  state = build(next, getState());
  emit();
  return { ok: true };
}

export type SaveResult = { ok: true } | { ok: false; error: string };

/** Saves one piece of content. Saving the default value clears the override. */
export function saveContent<K extends ContentKey>(key: K, value: SiteContent[K]): SaveResult {
  getState();
  const next = { ...overrides };
  if (JSON.stringify(value) === JSON.stringify(defaultContent[key])) delete next[key];
  else next[key] = value;
  return commit(next);
}

/** Restores the given keys (or everything) to the published defaults. */
export function resetContent(keys?: ContentKey[]): SaveResult {
  getState();
  const next = { ...overrides };
  for (const key of keys ?? KEYS) delete next[key];
  return commit(next);
}

/** Approximate bytes the demo edits take up in localStorage. */
export function storageUsage() {
  try {
    return (window.localStorage.getItem(STORAGE_KEY)?.length ?? 0) * 2;
  } catch {
    return 0;
  }
}

/** Whole store. During SSR and hydration this is the defaults, then the saved edits. */
export function useCms(): CmsState {
  return useSyncExternalStore(subscribe, getState, () => serverState);
}

export function useContent<K extends ContentKey>(key: K): SiteContent[K] {
  return useCms().content[key];
}

/** True once the browser's saved edits have been read (always false on the server). */
export function useCmsReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
