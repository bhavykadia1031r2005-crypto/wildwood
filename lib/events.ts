"use client";

/**
 * Lightweight cross-section signals (e.g. a search result asking the map to
 * focus a place). Keeps sections decoupled without a global store.
 */
export type SiteEvents = {
  "ww:focus-place": { id: string };
  "ww:search-stays": { query: string };
  "ww:open-stay": { id: string };
  /** From the "Book your stay" card: area ("all" or a stay area id) and party size. */
  "ww:filter-stays": { area: string; guests: number };
  /** From an event's "Stay for this event" button: dates for the "Book your stay" card. */
  "ww:prefill-dates": { checkIn: string; checkOut: string };
  "ww:wishlist-saved": { title: string };
};

export function emit<K extends keyof SiteEvents>(name: K, detail: SiteEvents[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listen<K extends keyof SiteEvents>(
  name: K,
  handler: (detail: SiteEvents[K]) => void,
) {
  const fn = (e: Event) => handler((e as CustomEvent<SiteEvents[K]>).detail);
  window.addEventListener(name, fn);
  return () => window.removeEventListener(name, fn);
}
