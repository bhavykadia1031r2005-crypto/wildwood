"use client";

import { categoryMeta, type Area, type AreaId, type PointOfInterest } from "@/data/attractions";
import { cn } from "@/lib/utils";

/*
 * Stylised top-down illustration of the barrier island. Everything is placed
 * along one curved centreline: t = 0 (northern tip, Hereford Inlet) → 1
 * (southern tip), s = −1 (bay edge) → +1 (ocean edge).
 */
type Pt = [number, number];
const P0: Pt = [872, 70];
const P1: Pt = [150, 604];
const C: Pt = [548, 380];
const MAX_W = 54;

function at(t: number): Pt {
  const u = 1 - t;
  return [u * u * P0[0] + 2 * u * t * C[0] + t * t * P1[0], u * u * P0[1] + 2 * u * t * C[1] + t * t * P1[1]];
}
function normal(t: number): Pt {
  const tx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P1[0] - C[0]);
  const ty = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P1[1] - C[1]);
  const len = Math.hypot(tx, ty);
  return [ty / len, -tx / len]; // points toward the ocean (down-right)
}
function width(t: number) {
  return MAX_W * Math.pow(Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)), 0.42);
}
/** Map island coordinates (t along, s across in half-widths) to SVG space. */
export function project(t: number, s: number): Pt {
  const b = at(t);
  const n = normal(t);
  const w = Math.max(width(t), 14);
  return [b[0] + n[0] * s * w, b[1] + n[1] * s * w];
}
function edge(t: number, s: number): Pt {
  const b = at(t);
  const n = normal(t);
  const w = width(t);
  return [b[0] + n[0] * s * w, b[1] + n[1] * s * w];
}
function range(t0: number, t1: number, steps = 40) {
  return Array.from({ length: steps + 1 }, (_, i) => t0 + ((t1 - t0) * i) / steps);
}
/** Catmull-Rom spline through points, as a smooth SVG path. */
function smooth(points: Pt[], close = true) {
  const p = points;
  const n = p.length;
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return close ? `${d}Z` : d;
}
function band(t0: number, t1: number, sIn: number, sOut: number) {
  const outer = range(t0, t1).map((t) => edge(t, sOut));
  const inner = range(t0, t1).map((t) => edge(t, sIn)).reverse();
  return smooth([...outer, ...inner]);
}

const island = band(0, 1, -1, 1);
const beach = band(0.03, 0.97, 0.42, 1);
const oceanEdge = range(0, 1, 60).map((t) => edge(t, 1.02));
const ocean = `${smooth(oceanEdge, false)} L0 700 L1100 700 L1100 -60 Z`;
const boardwalk = smooth(range(0.2, 0.505, 20).map((t) => edge(t, 0.42)), false);
const streets = range(0.07, 0.93, 34).map((t) => [edge(t, -0.82), edge(t, 0.36)] as [Pt, Pt]);
const piers = [
  { t: 0.26, wheel: false },
  { t: 0.35, wheel: true },
  { t: 0.41, wheel: false },
];
const waves = [1.7, 2.6, 3.6].map((s) => smooth(range(0.12, 0.98, 30).map((t) => project(t, s)), false));
const westCentre = project(0.36, -2.15);
const tangentAngle = (t: number) => {
  const n = normal(t);
  return (Math.atan2(n[1], n[0]) * 180) / Math.PI - 90;
};
const sunsetLake = project(0.71, -0.66);

function areaPath(a: Area) {
  return band(a.span[0], a.span[1], -1, 1);
}

export function IllustratedMap({
  areas,
  places,
  selectedArea,
  selectedPlace,
  onSelectArea,
  onSelectPlace,
}: {
  areas: Area[];
  places: PointOfInterest[];
  selectedArea: AreaId | null;
  selectedPlace: string | null;
  onSelectArea: (id: AreaId) => void;
  onSelectPlace: (id: string) => void;
}) {
  const activate = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <svg
      viewBox="0 0 1000 640"
      className="h-full w-full select-none"
      role="group"
      aria-label="Illustrated map of the Wildwoods island. Choose an area or a place to learn more."
    >
      <defs>
        <linearGradient id="ww-ocean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5CCEDE" />
          <stop offset="1" stopColor="#087D9C" />
        </linearGradient>
        <pattern id="ww-marsh" width="26" height="22" patternUnits="userSpaceOnUse">
          <path d="M4 16c2-5 3-7 3-11M8 16c0-4 1-6 4-9M12 16c-1-3-1-5 1-8" stroke="#087D9C" strokeOpacity="0.22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </pattern>
        <filter id="ww-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#04171C" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Bay + marsh */}
      <rect width="1000" height="640" fill="#CBE7EF" />
      <rect width="1000" height="640" fill="url(#ww-marsh)" />
      {/* Ocean */}
      <path d={ocean} fill="url(#ww-ocean)" />
      {waves.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#FFFFFF" strokeOpacity={0.35 - i * 0.08} strokeWidth="2" strokeDasharray="14 18" strokeLinecap="round" />
      ))}

      {/* West Wildwood */}
      <g
        role="button"
        tabIndex={0}
        aria-label="West Wildwood"
        aria-pressed={selectedArea === "west-wildwood"}
        onClick={() => onSelectArea("west-wildwood")}
        onKeyDown={activate(() => onSelectArea("west-wildwood"))}
        className="group cursor-pointer outline-none"
      >
        <ellipse
          cx={westCentre[0]}
          cy={westCentre[1]}
          rx="54"
          ry="26"
          transform={`rotate(${tangentAngle(0.36)} ${westCentre[0]} ${westCentre[1]})`}
          fill="#FDF1D8"
          stroke={selectedArea === "west-wildwood" ? "#FFD400" : "#FFFFFF"}
          strokeWidth={selectedArea === "west-wildwood" ? 4 : 2}
          className="transition-[stroke] group-hover:stroke-[#FFD400] group-focus-visible:stroke-[#FFD400]"
          filter="url(#ww-shadow)"
        />
        <text x={westCentre[0]} y={westCentre[1] - 40} textAnchor="middle" className="fill-teal-600 font-display text-[19px] font-extrabold uppercase tracking-wide">
          West Wildwood
        </text>
      </g>

      {/* Island */}
      <path d={island} fill="#FDF1D8" filter="url(#ww-shadow)" />
      {streets.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#105665" strokeOpacity="0.07" strokeWidth="2" />
      ))}
      <path d={beach} fill="#FFEC80" fillOpacity="0.75" />
      <ellipse cx={sunsetLake[0]} cy={sunsetLake[1]} rx="16" ry="9" fill="#CBE7EF" transform={`rotate(${tangentAngle(0.71)} ${sunsetLake[0]} ${sunsetLake[1]})`} />
      <path d={boardwalk} fill="none" stroke="#D8661A" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 4" />
      {piers.map(({ t, wheel }) => {
        const a = edge(t, 0.42);
        const b = edge(t, 1.3);
        return (
          <g key={t}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#F15A24" strokeWidth="10" strokeLinecap="round" />
            {wheel && <circle cx={b[0]} cy={b[1]} r="9" fill="none" stroke="#FFD400" strokeWidth="3" />}
          </g>
        );
      })}

      {/* Area hit zones */}
      {areas
        .filter((a) => a.id !== "west-wildwood")
        .map((a) => {
          const selected = selectedArea === a.id;
          const label = project((a.span[0] + a.span[1]) / 2, 2.25);
          return (
            <g
              key={a.id}
              role="button"
              tabIndex={0}
              aria-label={a.name}
              aria-pressed={selected}
              onClick={() => onSelectArea(a.id)}
              onKeyDown={activate(() => onSelectArea(a.id))}
              className="group cursor-pointer outline-none"
            >
              <path
                d={areaPath(a)}
                className={cn(
                  "transition-[fill,stroke] duration-300",
                  selected
                    ? "fill-sun-500/25 stroke-sun-500"
                    : "fill-transparent stroke-transparent group-hover:fill-white/40 group-focus-visible:fill-white/40 group-focus-visible:stroke-sun-500",
                )}
                strokeWidth="3"
              />
              <text
                x={label[0]}
                y={label[1]}
                textAnchor="middle"
                className={cn(
                  "font-display text-[22px] font-extrabold uppercase tracking-wide transition-[fill] duration-300",
                  selected ? "fill-sun-400" : "fill-white group-hover:fill-sun-300",
                )}
                style={{ paintOrder: "stroke", stroke: "#105665", strokeWidth: 5, strokeLinejoin: "round" }}
              >
                {a.name}
              </text>
            </g>
          );
        })}

      {/* Places */}
      {places.map((p) => {
        const [x, y] = project(p.sketch[0], p.sketch[1]);
        const meta = categoryMeta[p.category];
        const selected = selectedPlace === p.id;
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`${p.name} (${meta.label})`}
            aria-pressed={selected}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPlace(p.id);
            }}
            onKeyDown={activate(() => onSelectPlace(p.id))}
            className="group cursor-pointer outline-none"
          >
            <circle cx={x} cy={y} r="18" fill="transparent" />
            {selected && <circle cx={x} cy={y} r="17" fill="none" stroke="#FFD400" strokeWidth="3" />}
            <circle
              cx={x}
              cy={y}
              r={selected ? 11 : 8}
              fill={meta.color}
              stroke="#FFFFFF"
              strokeWidth="2.5"
              className="transition-[r] duration-300 group-hover:[r:11px] group-focus-visible:[r:11px]"
            />
          </g>
        );
      })}

      {/* Labels & compass */}
      <text x="840" y="560" textAnchor="middle" className="fill-white/85 font-display text-[26px] font-extrabold uppercase tracking-[0.2em]">
        Atlantic Ocean
      </text>
      <text x="200" y="120" textAnchor="middle" className="fill-ocean-600/70 font-display text-[18px] font-bold uppercase tracking-[0.2em]">
        Back bay &amp; marshes
      </text>
      <text {...{ x: project(0.0, -1.8)[0], y: project(0.0, -1.8)[1] - 10 }} textAnchor="middle" className="fill-ocean-600/80 text-[13px] font-bold uppercase tracking-[0.15em]">
        Hereford Inlet
      </text>
      <g transform="translate(70 560)" aria-hidden="true">
        <circle r="30" fill="#FFFFFF" fillOpacity="0.85" />
        <path d="M0 -22 L7 0 L0 -4 L-7 0Z" fill="#F15A24" />
        <path d="M0 22 L7 0 L0 4 L-7 0Z" fill="#105665" />
        <text y="-34" textAnchor="middle" className="fill-teal-600 text-[13px] font-bold">
          N
        </text>
      </g>
    </svg>
  );
}
