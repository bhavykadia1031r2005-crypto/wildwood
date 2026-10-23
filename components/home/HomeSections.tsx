"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { DestinationCTA } from "@/components/cta/DestinationCTA";
import { ExploreByArea } from "@/components/explore/ExploreByArea";
import { MoreToExplore } from "@/components/gallery/MoreToExplore";
import { PhotoStripGuide } from "@/components/gallery/PhotoStripGuide";
import { VideoHero } from "@/components/hero/VideoHero";
import { ItineraryBuilder } from "@/components/itinerary/ItineraryBuilder";
import { Navbar } from "@/components/navigation/Navbar";
import { StaysSection } from "@/components/stays/StaysSection";
import { ScrollTrigger } from "@/lib/animation";
import { sectionContentKeys, type SectionId } from "@/lib/cms/content";
import { useCms } from "@/lib/cms/store";

const sections: Record<SectionId, ComponentType> = {
  hero: VideoHero,
  itinerary: ItineraryBuilder,
  explore: ExploreByArea,
  "things-to-do": MoreToExplore,
  stays: StaysSection,
  "pocket-guide": PhotoStripGuide,
  cta: DestinationCTA,
};

/**
 * Homepage sections in the order (and visibility) set in /admin/content.
 * A section remounts when its content changes, so GSAP's split-text headings
 * are rebuilt from the new copy instead of being patched in place.
 */
export function HomeSections() {
  const { content, rev } = useCms();
  const order = content.layout.filter((s) => s.visible).map((s) => s.id);
  const orderKey = order.join("|");
  const first = useRef(true);

  // Reordering moves sections without changing the page height, so re-measure scroll triggers.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [orderKey]);

  return (
    <>
      {order.map((id) => {
        const Section = sections[id];
        const version = sectionContentKeys[id].map((k) => rev[k] ?? 0).join(".");
        return <Section key={`${id}:${version}`} />;
      })}
    </>
  );
}

/** The nav sits transparent over the hero only while the hero is the first section. */
export function HomeNavbar() {
  const { content } = useCms();
  const first = content.layout.find((s) => s.visible)?.id;
  return <Navbar overHero={first === "hero"} />;
}
