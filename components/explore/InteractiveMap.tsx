"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { categoryMeta, islandBounds, type PointOfInterest } from "@/data/attractions";
import { markerIcons } from "@/lib/markerIcons";
import { siteConfig } from "@/lib/site";

/**
 * Leaflet map (loaded on demand) with brand-styled category markers.
 * Scroll-wheel zoom only engages after the visitor interacts with the map,
 * so scrolling the page never gets trapped.
 */
export default function InteractiveMap({
  places,
  selectedId,
  onSelect,
}: {
  places: PointOfInterest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Leaflet.Marker>());
  const onSelectRef = useRef(onSelect);
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    const markers = markersRef.current;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        zoomSnap: 0.25,
        minZoom: 11,
        maxZoom: 18,
      });
      map.fitBounds(islandBounds, { padding: [24, 24] });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer(siteConfig.map.tileUrl, {
        attribution: siteConfig.map.attribution,
        maxZoom: 19,
      }).addTo(map);
      map.on("click focus", () => map?.scrollWheelZoom.enable());
      map.on("mouseout blur", () => map?.scrollWheelZoom.disable());
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      LRef.current = L;
      setReady(true);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markers.clear();
    };
  }, []);

  // Rebuild markers when the visible set changes.
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();

    places.forEach((p, i) => {
      const meta = categoryMeta[p.category];
      const icon = L.divIcon({
        className: "",
        html: `<span class="ww-marker" style="--d:${i * 35}ms;display:grid;place-items:center;width:38px;height:38px;border-radius:999px 999px 999px 4px;transform-origin:bottom left;rotate:-45deg;background:${meta.color};color:${meta.text};box-shadow:0 8px 18px -6px rgb(4 23 28 / .55);border:2.5px solid #fff"><span style="rotate:45deg;width:18px;height:18px;display:block">${markerIcons[p.category]}</span></span>`,
        iconSize: [38, 38],
        iconAnchor: [4, 38],
        tooltipAnchor: [18, -34],
      });
      const marker = L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name, riseOnHover: true, keyboard: true })
        .bindTooltip(p.name, { className: "ww-tooltip", direction: "top", offset: [0, -4] })
        .on("click keypress", () => onSelectRef.current(p.id));
      marker.addTo(layer);
      markersRef.current.set(p.id, marker);
    });

    if (places.length) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]));
      const small = map.getSize().x < 640;
      const opts = { padding: (small ? [36, 36] : [70, 70]) as [number, number], maxZoom: 15.5 };
      // First fit is instant; later filter changes glide.
      if (fittedRef.current) map.flyToBounds(bounds, { ...opts, duration: 0.8 });
      else map.fitBounds(bounds, opts);
      fittedRef.current = true;
    }
  }, [places, ready]);

  // Highlight + fly to the selected place.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    markersRef.current.forEach((m, id) => {
      const node = m.getElement()?.querySelector(".ww-marker");
      node?.classList.toggle("is-active", id === selectedId);
      if (id === selectedId) m.setZIndexOffset(1000);
      else m.setZIndexOffset(0);
    });
    const selected = selectedId ? markersRef.current.get(selectedId) : null;
    if (selected) {
      map.flyTo(selected.getLatLng(), Math.max(map.getZoom(), 15.5), { duration: 0.9 });
    }
  }, [selectedId, ready, places]);

  return (
    <div className="ww-map absolute inset-0">
      <div
        ref={el}
        className="absolute inset-0"
        role="region"
        aria-label="Interactive map of the Wildwoods. Use the place list for a keyboard-friendly alternative."
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-turquoise-50 text-teal-600">
          <span className="flex items-center gap-3 font-semibold">
            <span className="size-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            Loading map…
          </span>
        </div>
      )}
    </div>
  );
}
