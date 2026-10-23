"use client";

import { useMemo } from "react";
import { SECTION_IDS, sectionContentKeys, type SectionId } from "./content";
import { useCms } from "./store";

/** "/#stays" or "#stays" → "stays" when it points at a homepage section. */
export function homeSectionOf(href: string): SectionId | null {
  const match = /^\/?#([\w-]+)$/.exec(href.trim());
  const id = match?.[1] as SectionId | undefined;
  return id && (SECTION_IDS as readonly string[]).includes(id) ? id : null;
}

/** Editable nav links, minus any that point at a section hidden from the homepage. */
export function useNavigation() {
  const { content, rev } = useCms();
  const { navigation, layout } = content;

  const links = useMemo(() => {
    const hidden = new Set(layout.filter((s) => !s.visible).map((s) => s.id));
    return navigation.links
      .map((l) => ({ ...l, section: homeSectionOf(l.href) }))
      .filter((l) => !(l.section && hidden.has(l.section)));
  }, [navigation.links, layout]);

  const sectionIds = links.map((l) => l.section).filter((s): s is SectionId => s !== null);
  // Changes whenever homepage sections remount or move, so the active-link observer re-attaches.
  const version = [rev.layout ?? 0, ...SECTION_IDS.flatMap((id) => sectionContentKeys[id].map((k) => rev[k] ?? 0))].join(".");

  const primaryCta = { label: navigation.primaryLabel, href: navigation.primaryHref };
  const secondaryCta = { label: navigation.secondaryLabel, href: navigation.secondaryHref };
  return { links, primaryCta, secondaryCta, sectionIds, version };
}
