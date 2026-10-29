"use client";

/**
 * Visitor wishlist. Saved items live in this browser's localStorage (no
 * account, nothing sent to a server) and stay in sync across open tabs.
 * Items are stored as references; titles are kept only as a fallback for
 * items that are later removed from the site.
 */

import { useSyncExternalStore } from "react";

export type SavedType = "stay" | "place" | "activity" | "event" | "calendar";
export type SavedRef = { type: SavedType; id: string };
export type SavedItem = SavedRef & { title: string; savedAt: number };

const STORAGE_KEY = "wildwoods-wishlist";
const VERSION = 1;
const TYPES: SavedType[] = ["stay", "place", "activity", "event", "calendar"];
const EMPTY: SavedItem[] = [];

let items: SavedItem[] | null = null;
const listeners = new Set<() => void>();

function read(): SavedItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as { v?: number; items?: unknown };
    if (saved?.v !== VERSION || !Array.isArray(saved.items)) return EMPTY;
    return saved.items.filter(
      (i): i is SavedItem =>
        Boolean(i) && TYPES.includes((i as SavedItem).type) && typeof (i as SavedItem).id === "string" && typeof (i as SavedItem).title === "string",
    );
  } catch {
    return EMPTY;
  }
}

function getItems() {
  if (!items) items = read();
  return items;
}

function commit(next: SavedItem[]) {
  items = next;
  try {
    if (next.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, items: next }));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage full or blocked: the list still works until the page is closed. */
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== STORAGE_KEY) return;
  items = read();
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

const same = (a: SavedRef, b: SavedRef) => a.type === b.type && a.id === b.id;

/** Newest first. Empty during SSR and hydration. */
export function useWishlist(): SavedItem[] {
  return useSyncExternalStore(subscribe, getItems, () => EMPTY);
}

export function useIsSaved(type: SavedType, id: string) {
  return useSyncExternalStore(
    subscribe,
    () => getItems().some((i) => i.type === type && i.id === id),
    () => false,
  );
}

/** Saves or un-saves an item; returns whether it's saved afterwards. */
export function toggleSaved(item: SavedRef & { title: string }): boolean {
  const list = getItems();
  if (list.some((i) => same(i, item))) {
    commit(list.filter((i) => !same(i, item)));
    return false;
  }
  commit([{ type: item.type, id: item.id, title: item.title, savedAt: Date.now() }, ...list]);
  return true;
}

export function removeSaved(ref: SavedRef) {
  commit(getItems().filter((i) => !same(i, ref)));
}

export function addSaved(list: SavedItem[]) {
  const current = getItems();
  const fresh = list.filter((i) => !current.some((c) => same(c, i)));
  if (fresh.length) commit([...fresh, ...current]);
}

export function replaceWishlist(list: SavedItem[]) {
  commit(list);
}

/* ---------- Share links: /wishlist?items=stay:tidewater-doo-wop-inn,place:wildwoods-sign ---------- */

export function encodeShare(list: SavedRef[]) {
  return list.map((i) => `${i.type}:${i.id}`).join(",");
}

export function decodeShare(value: string | null): SavedRef[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => {
      const [type, ...rest] = part.split(":");
      return { type: type as SavedType, id: rest.join(":") };
    })
    .filter((r) => TYPES.includes(r.type) && /^[\w-]{1,80}$/.test(r.id))
    .slice(0, 60);
}
