"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { stayAreas, stayTypeSingular } from "@/data/accommodations";
import { categoryMeta } from "@/data/attractions";
import { signatureEvents } from "@/data/events";
import { calendarEvents } from "@/data/eventsCalendar";
import { placeAreaName } from "@/components/explore/PlaceCard";
import { useCms } from "@/lib/cms/store";
import { emit, type SiteEvents } from "@/lib/events";
import type { SavedItem, SavedRef, SavedType } from "@/lib/wishlist";

export const typeLabels: Record<SavedType, { one: string; many: string }> = {
  stay: { one: "Place to stay", many: "Places to stay" },
  place: { one: "On the map", many: "On the map" },
  activity: { one: "Thing to do", many: "Things to do" },
  event: { one: "Event", many: "Events" },
  calendar: { one: "Calendar event", many: "Calendar events" },
};

const DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
/** "Oct 2 – Oct 4" or "Oct 10" for a calendar event's date range. */
export function eventRange(start: string, end: string) {
  const a = DAY.format(new Date(`${start}T00:00:00Z`));
  const b = DAY.format(new Date(`${end}T00:00:00Z`));
  return a === b ? a : `${a} – ${b}`;
}

export type SavedEntry = {
  ref: SavedItem;
  title: string;
  subtitle: string;
  image?: string;
  href: string;
  external: boolean;
  /** Signal for the homepage section that shows this item. */
  event?: { [K in keyof SiteEvents]: { name: K; detail: SiteEvents[K] } }[keyof SiteEvents];
  /** False when the item has since been removed from the site. */
  available: boolean;
  sample?: boolean;
};

/** Looks saved references up in the current site content (including demo CMS edits). */
export function useSavedEntries(refs: SavedItem[]): SavedEntry[] {
  const { content } = useCms();
  return useMemo(
    () =>
      refs.map((ref): SavedEntry => {
        const gone = { ref, title: ref.title, subtitle: "No longer listed on the site", href: "/", external: false, available: false };
        switch (ref.type) {
          case "stay": {
            const s = content.stays.find((x) => x.id === ref.id);
            if (!s) return gone;
            return {
              ref,
              title: s.name,
              subtitle: `${stayTypeSingular[s.type]} · ${stayAreas[s.area]} · from $${s.priceFrom}/night`,
              image: s.imageId,
              href: "/#stays",
              external: false,
              event: { name: "ww:open-stay", detail: { id: s.id } },
              available: true,
              sample: true,
            };
          }
          case "place": {
            const p = content.places.find((x) => x.id === ref.id);
            if (!p) return gone;
            return {
              ref,
              title: p.name,
              subtitle: `${categoryMeta[p.category].label} · ${placeAreaName(p)}`,
              image: p.imageId,
              href: "/#explore",
              external: false,
              event: { name: "ww:focus-place", detail: { id: p.id } },
              available: true,
            };
          }
          case "activity": {
            const c = content.categories.find((x) => x.id === ref.id);
            if (!c) return gone;
            return { ref, title: c.label, subtitle: c.description, image: c.image, href: c.href, external: /^https?:\/\//.test(c.href), available: true };
          }
          case "calendar": {
            const c = calendarEvents.find((x) => x.id === ref.id);
            if (!c) return gone;
            return {
              ref,
              title: c.title,
              subtitle: `${eventRange(c.start, c.end)}${c.free ? " · Free" : ""}${c.cancelled ? " · Cancelled" : ""}`,
              image: c.image,
              href: `/events#ev-${c.id}`,
              external: false,
              available: true,
            };
          }
          case "event": {
            const e = content.events.find((x) => x.id === ref.id);
            if (!e) return gone;
            const onEventsPage = signatureEvents.some((x) => x.id === e.id);
            return {
              ref,
              title: e.title,
              subtitle: `${e.season} · ${e.location}`,
              image: e.imageId,
              href: onEventsPage ? `/events#${e.id}` : "/#top",
              external: false,
              available: true,
            };
          }
        }
      }),
    [refs, content.stays, content.places, content.categories, content.events],
  );
}

/** Turns share-link references into list items, using live titles where possible. */
export function useResolvedRefs(refs: SavedRef[]): SavedItem[] {
  const { content } = useCms();
  return useMemo(
    () =>
      refs.map((r) => {
        const title =
          r.type === "stay"
            ? content.stays.find((x) => x.id === r.id)?.name
            : r.type === "place"
              ? content.places.find((x) => x.id === r.id)?.name
              : r.type === "activity"
                ? content.categories.find((x) => x.id === r.id)?.label
                : r.type === "calendar"
                  ? calendarEvents.find((x) => x.id === r.id)?.title
                  : content.events.find((x) => x.id === r.id)?.title;
        return { ...r, title: title ?? "Saved item", savedAt: 0 };
      }),
    [refs, content],
  );
}

/** Opens a saved item where it lives: scrolls the homepage section and signals it, or navigates. */
export function useOpenEntry() {
  const router = useRouter();
  return useCallback(
    (entry: SavedEntry) => {
      if (entry.external) {
        window.open(entry.href, "_blank", "noopener");
        return;
      }
      const onHome = window.location.pathname === "/";
      if (onHome && entry.href.startsWith("/#")) {
        const id = entry.href.slice(2);
        document.getElementById(id)?.scrollIntoView({ block: "start" });
        history.replaceState(null, "", `#${id}`);
      } else {
        router.push(entry.href);
      }
      if (entry.event) {
        const { name, detail } = entry.event;
        // Same timing as search: let the target section mount and settle first.
        window.setTimeout(() => emit(name, detail as never), onHome ? 350 : 900);
      }
    },
    [router],
  );
}
