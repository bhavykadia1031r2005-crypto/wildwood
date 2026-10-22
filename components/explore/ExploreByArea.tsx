"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Info, Layers, MapPinned, Rotate3d, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useReveal } from "@/components/animation/useReveal";
import {
  areas,
  categoryMeta,
  pointsOfInterest,
  type AreaId,
  type PoiCategory,
} from "@/data/attractions";
import { getMedia } from "@/data/media";
import { listen } from "@/lib/events";
import { cn } from "@/lib/utils";
import { IllustratedMap } from "./IllustratedMap";
import { PanoramaViewer, type PanoramaScene } from "./PanoramaViewer";
import { categoryIcons, PlaceCard } from "./PlaceCard";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-turquoise-50 font-semibold text-teal-600">Loading map…</div>
  ),
});

type View = "map" | "2d" | "vr";

const views: { id: View; label: string; short: string; icon: typeof MapPinned }[] = [
  { id: "map", label: "Interactive Map", short: "Map", icon: MapPinned },
  { id: "2d", label: "Explore in 2D", short: "2D", icon: Layers },
  { id: "vr", label: "360° / VR Experience", short: "360°", icon: Rotate3d },
];

const scenes: PanoramaScene[] = [
  {
    id: "boardwalk",
    title: "Boardwalk bites",
    mediaId: "pano-boardwalk-pier",
    caption: "Classic boardwalk food stand, Wildwood.",
    kind: "photo",
  },
  {
    id: "beach",
    title: "North Wildwood beach",
    mediaId: "pano-north-wildwood-beach",
    caption: "A summer afternoon on the sand in North Wildwood.",
    kind: "photo",
  },
  {
    id: "piers",
    title: "Above the piers",
    mediaId: "pano-piers-from-above",
    caption: "Looking across the amusement piers toward the bay.",
    kind: "photo",
  },
];

const allCategories = Object.keys(categoryMeta) as PoiCategory[];
const ease = [0.16, 1, 0.3, 1] as const;

export function ExploreByArea() {
  const root = useRef<HTMLElement>(null);
  const [view, setView] = useState<View>("map");
  const [categories, setCategories] = useState<PoiCategory[]>([]);
  const [areaFilter, setAreaFilter] = useState<AreaId | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaId>("wildwood");
  const [mapActivated, setMapActivated] = useState(false);
  useReveal(root);

  // Defer loading Leaflet until the section approaches the viewport.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapActivated(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(
    () =>
      listen("ww:focus-place", ({ id }) => {
        setView("map");
        setCategories([]);
        setAreaFilter(null);
        setSelectedPlace(id);
        setMapActivated(true);
      }),
    [],
  );

  const visible = useMemo(
    () =>
      pointsOfInterest.filter(
        (p) =>
          (categories.length === 0 || categories.includes(p.category)) &&
          (!areaFilter || p.area === areaFilter),
      ),
    [categories, areaFilter],
  );

  const place = pointsOfInterest.find((p) => p.id === selectedPlace) ?? null;
  const area = areas.find((a) => a.id === selectedArea)!;
  const areaPlaces = pointsOfInterest.filter((p) => p.area === selectedArea);

  const toggleCategory = (c: PoiCategory) => {
    setSelectedPlace(null);
    setCategories((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  };

  const selectPlace = useCallback((id: string) => setSelectedPlace(id), []);

  const showAreaOnMap = (id: AreaId) => {
    setAreaFilter(id);
    setCategories([]);
    setSelectedPlace(null);
    setView("map");
  };

  return (
    <section
      id="explore"
      ref={root}
      aria-labelledby="explore-title"
      className="relative overflow-hidden bg-teal-500 py-24 text-white md:py-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-40 size-[34rem] rounded-full bg-turquoise-500/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 size-[26rem] rounded-full bg-ocean-500/30" />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeader
            id="explore-title"
            index="02"
            tone="light"
            eyebrow="Explore by area"
            title={
              <>
                Find your <br className="hidden md:block" />
                <span className="display-accent text-sun-400">kind of</span> Wildwoods.
              </>
            }
            lede="Four shore towns share one barrier island. Browse the live map, wander the illustrated guide, or step into a scene."
          />

          <div
            role="tablist"
            aria-label="Choose how to explore"
            data-reveal
            className="flex w-full gap-1 rounded-full bg-teal-700/70 p-1.5 ring-1 ring-inset ring-white/10 sm:w-auto"
          >
            {views.map((v) => {
              const active = view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  id={`explore-tab-${v.id}`}
                  aria-selected={active}
                  aria-controls="explore-panel"
                  onClick={() => setView(v.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors sm:flex-none sm:px-5",
                    active ? "text-teal-700" : "text-white/80 hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="explore-tab"
                      className="absolute inset-0 rounded-full bg-sun-500"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <v.icon className="relative size-4" aria-hidden="true" />
                  <span className="relative hidden sm:inline">{v.label}</span>
                  <span className="relative sm:hidden">{v.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="explore-panel"
          role="tabpanel"
          aria-labelledby={`explore-tab-${view}`}
          data-reveal="scale"
          className="mt-12 overflow-hidden rounded-[2.5rem] bg-teal-700 ring-1 ring-white/10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {view === "map" && (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:h-[680px] lg:grid-cols-[340px_minmax(0,1fr)]"
              >
                <div className="flex min-h-0 min-w-0 flex-col gap-5 p-5 sm:p-6">
                  <fieldset className="min-w-0">
                    <legend className="eyebrow mb-3 text-[0.65rem] text-turquoise-300">Filter by category</legend>
                    <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
                      <button
                        type="button"
                        aria-pressed={categories.length === 0}
                        onClick={() => {
                          setCategories([]);
                          setSelectedPlace(null);
                        }}
                        className={cn(
                          "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                          categories.length === 0 ? "bg-white text-teal-600" : "bg-white/10 text-white hover:bg-white/20",
                        )}
                      >
                        All
                      </button>
                      {allCategories.map((c) => {
                        const meta = categoryMeta[c];
                        const Icon = categoryIcons[c];
                        const on = categories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleCategory(c)}
                            className={cn(
                              "inline-flex shrink-0 items-center gap-2 rounded-full py-2 pl-2 pr-3.5 text-sm font-semibold transition-colors",
                              on ? "bg-white text-teal-600" : "bg-white/10 text-white hover:bg-white/20",
                            )}
                          >
                            <span className="grid size-6 place-items-center rounded-full" style={{ background: meta.color, color: meta.text }}>
                              <Icon className="size-3.5" aria-hidden="true" />
                            </span>
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {areaFilter && (
                    <button
                      type="button"
                      onClick={() => setAreaFilter(null)}
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-sun-500 px-3.5 py-1.5 text-sm font-semibold text-teal-700"
                    >
                      Area: {areas.find((a) => a.id === areaFilter)?.name}
                      <X className="size-3.5" aria-label="Clear area filter" />
                    </button>
                  )}

                  <div className="hidden min-h-0 flex-1 flex-col lg:flex">
                    <p className="eyebrow mb-2 text-[0.65rem] text-turquoise-300" aria-live="polite">
                      {visible.length} places
                    </p>
                    <ul className="scrollbar-none -mx-2 flex-1 overflow-y-auto">
                      {visible.map((p) => {
                        const meta = categoryMeta[p.category];
                        const active = p.id === selectedPlace;
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedPlace(p.id)}
                              aria-current={active ? "true" : undefined}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors",
                                active ? "bg-white/15" : "hover:bg-white/8",
                              )}
                            >
                              <span className="size-2.5 shrink-0 rounded-full ring-2 ring-white/40" style={{ background: meta.color }} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[0.95rem] font-semibold">{p.name}</span>
                                <span className="block truncate text-xs text-white/55">{meta.label}</span>
                              </span>
                              <ArrowRight className={cn("size-4 shrink-0 transition", active ? "text-sun-400" : "text-white/30")} aria-hidden="true" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="relative isolate h-[72vh] min-h-[460px] overflow-hidden bg-turquoise-50 lg:h-auto lg:rounded-l-[2rem]">
                  {mapActivated && <InteractiveMap places={visible} selectedId={selectedPlace} onSelect={selectPlace} />}
                  <p className="pointer-events-none absolute left-4 top-4 z-[500] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-teal-600 shadow-soft">
                    <Info className="size-3.5" aria-hidden="true" /> Curated sample points · locations approximate
                  </p>
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex justify-start sm:inset-x-4 sm:bottom-4">
                    <AnimatePresence mode="wait">
                      {place && <PlaceCard key={place.id} place={place} onClose={() => setSelectedPlace(null)} />}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "2d" && (
              <motion.div
                key="2d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:h-[680px] lg:grid-cols-[minmax(0,1fr)_380px]"
              >
                <div className="relative bg-ocean-100">
                  <div className="aspect-[1000/640] w-full lg:absolute lg:inset-0 lg:aspect-auto">
                    <IllustratedMap
                      areas={areas}
                      places={pointsOfInterest}
                      selectedArea={selectedArea}
                      selectedPlace={selectedPlace}
                      onSelectArea={(id) => {
                        setSelectedArea(id);
                        setSelectedPlace(null);
                      }}
                      onSelectPlace={(id) => {
                        const p = pointsOfInterest.find((x) => x.id === id);
                        setSelectedPlace(id);
                        if (p && p.area !== "nearby") setSelectedArea(p.area);
                      }}
                    />
                  </div>
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 hidden justify-start lg:flex">
                    <AnimatePresence mode="wait">
                      {place && <PlaceCard key={place.id} place={place} onClose={() => setSelectedPlace(null)} />}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto p-5 sm:p-6">
                  <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Areas">
                    {areas.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={a.id === selectedArea}
                        onClick={() => {
                          setSelectedArea(a.id);
                          setSelectedPlace(null);
                        }}
                        className={cn(
                          "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                          a.id === selectedArea ? "bg-sun-500 text-teal-700" : "bg-white/10 text-white hover:bg-white/20",
                        )}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.45, ease }}
                      className="flex flex-col gap-4"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
                        <Image
                          src={getMedia(area.imageId).src}
                          alt={getMedia(area.imageId).alt}
                          fill
                          sizes="(min-width: 1024px) 380px, 100vw"
                          className="object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-teal-900/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {area.nickname}
                        </span>
                      </div>
                      <div>
                        <h3 className="display text-5xl">{area.name}</h3>
                        <p className="mt-3 leading-relaxed text-white/80">{area.summary}</p>
                      </div>
                      <ul className="flex flex-wrap gap-2" aria-label="Known for">
                        {area.knownFor.map((k) => (
                          <li key={k} className="rounded-full bg-turquoise-500/20 px-3 py-1 text-xs font-semibold text-turquoise-100">
                            {k}
                          </li>
                        ))}
                      </ul>
                      {areaPlaces.length > 0 && (
                        <div>
                          <p className="eyebrow mb-2 text-[0.65rem] text-turquoise-300">Places here</p>
                          <ul className="flex flex-col">
                            {areaPlaces.map((p) => (
                              <li key={p.id}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPlace(p.id)}
                                  aria-current={p.id === selectedPlace ? "true" : undefined}
                                  className={cn(
                                    "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm font-semibold transition-colors",
                                    p.id === selectedPlace ? "bg-white/15" : "hover:bg-white/8",
                                  )}
                                >
                                  <span className="size-2.5 rounded-full" style={{ background: categoryMeta[p.category].color }} />
                                  {p.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {place && (
                        <div className="lg:hidden">
                          <AnimatePresence mode="wait">
                            <PlaceCard key={place.id} place={place} onClose={() => setSelectedPlace(null)} />
                          </AnimatePresence>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => showAreaOnMap(area.id)}
                        className="mt-1 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-5 font-semibold text-teal-600 transition hover:bg-sun-500 hover:text-teal-700"
                      >
                        See {area.name} on the map <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {view === "vr" && (
              <motion.div
                key="vr"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="h-[72vh] min-h-[480px] lg:h-[680px]"
              >
                <PanoramaViewer scenes={scenes} onExit={() => setView("map")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
