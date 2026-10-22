/**
 * Category icons for Leaflet map markers as SVG markup (Leaflet needs HTML strings).
 * Paths are from Lucide (ISC licence), generated from lucide-react v1.
 */

import type { PoiCategory } from "@/data/attractions";

const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const markerIcons: Record<PoiCategory, string> = {
  beaches: wrap("<path d=\"M12 13v7a2 2 0 0 0 4 0\"/><path d=\"M12 2v2\"/><path d=\"M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z\"/>"),
  boardwalk: wrap("<circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 2v4\"/><path d=\"m6.8 15-3.5 2\"/><path d=\"m20.7 7-3.5 2\"/><path d=\"M6.8 9 3.3 7\"/><path d=\"m20.7 17-3.5-2\"/><path d=\"m9 22 3-8 3 8\"/><path d=\"M8 22h8\"/><path d=\"M18 18.7a9 9 0 1 0-12 0\"/>"),
  dining: wrap("<path d=\"m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8\"/><path d=\"M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7\"/><path d=\"m2.1 21.8 6.4-6.3\"/><path d=\"m19 5-7 7\"/>"),
  shopping: wrap("<path d=\"M16 10a4 4 0 0 1-8 0\"/><path d=\"M3.103 6.034h17.794\"/><path d=\"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z\"/>"),
  family: wrap("<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>"),
  stay: wrap("<path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\"/><path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\"/><path d=\"M12 4v6\"/><path d=\"M2 18h20\"/>"),
  nature: wrap("<path d=\"M16 7h.01\"/><path d=\"M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20\"/><path d=\"m20 7 2 .5-2 .5\"/><path d=\"M10 18v3\"/><path d=\"M14 17.75V21\"/><path d=\"M7 18a6 6 0 0 0 3.84-10.61\"/>"),
};
