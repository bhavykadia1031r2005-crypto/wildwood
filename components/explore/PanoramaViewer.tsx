"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Hand, Info, Maximize, Minimize, X } from "lucide-react";
import { getMedia } from "@/data/media";
import { cn } from "@/lib/utils";

const ZOOM = 1.35;

export type PanoramaScene = {
  id: string;
  title: string;
  mediaId: string;
  caption: string;
  /**
   * "photo"  – a wide standard photograph; drag pans across it.
   * "360"    – a full equirectangular capture (not yet available; see README).
   */
  kind: "photo" | "360";
};

/**
 * Drag-to-look viewer for wide scenes. Supports mouse, touch and keyboard,
 * momentum, fullscreen and a position indicator. Scenes are honestly labelled:
 * the current media are wide standard photos, not 360° captures.
 */
export function PanoramaViewer({ scenes, onExit }: { scenes: PanoramaScene[]; onExit: () => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [hint, setHint] = useState(true);
  const [progress, setProgress] = useState(0.5);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const state = useRef({ x: 0, y: 0, min: 0, minY: 0, v: 0, vy: 0, dragging: false, lastX: 0, lastY: 0, lastT: 0, raf: 0 });

  const scene = scenes[index];
  const media = getMedia(scene.mediaId);

  const apply = useCallback(() => {
    const s = state.current;
    s.x = Math.min(0, Math.max(s.min, s.x));
    s.y = Math.min(0, Math.max(s.minY, s.y));
    if (strip.current) strip.current.style.transform = `translate3d(${s.x}px,${s.y}px,0)`;
    setProgress(s.min === 0 ? 0.5 : s.x / s.min);
  }, []);

  const measure = useCallback(
    (center = false) => {
      const f = frame.current;
      if (!f) return;
      // Render the scene larger than the frame so there is room to look around in both axes.
      const h = Math.max(f.clientHeight * ZOOM, f.clientWidth / (media.width / media.height));
      const imgW = h * (media.width / media.height);
      const s = state.current;
      const prevMin = s.min;
      const prevMinY = s.minY;
      s.min = Math.min(0, f.clientWidth - imgW);
      s.minY = Math.min(0, f.clientHeight - h);
      if (strip.current) {
        strip.current.style.width = `${imgW}px`;
        strip.current.style.height = `${h}px`;
      }
      s.x = center || prevMin === 0 ? s.min / 2 : (s.x / prevMin) * s.min;
      s.y = center || prevMinY === 0 ? s.minY / 2 : (s.y / prevMinY) * s.minY;
      apply();
    },
    [apply, media.height, media.width],
  );

  useEffect(() => {
    measure(true);
    const ro = new ResizeObserver(() => measure());
    if (frame.current) ro.observe(frame.current);
    return () => ro.disconnect();
  }, [measure, index]);

  useEffect(() => {
    const onFs = () => {
      setFullscreen(document.fullscreenElement === frame.current?.parentElement);
      requestAnimationFrame(() => measure());
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [measure]);

  useEffect(() => () => cancelAnimationFrame(state.current.raf), []);

  const glide = () => {
    const s = state.current;
    cancelAnimationFrame(s.raf);
    const step = () => {
      s.v *= 0.93;
      s.vy *= 0.9;
      s.x += s.v;
      s.y += s.vy;
      apply();
      if ((Math.abs(s.v) > 0.3 && s.x < 0 && s.x > s.min) || Math.abs(s.vy) > 0.3) s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  };

  const nudge = (dir: number, axis: "x" | "y" = "x") => {
    const s = state.current;
    if (axis === "x") s.v = dir * 22;
    else s.vy = dir * 16;
    setHint(false);
    glide();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Controls sit inside the frame; capturing their pointer would swallow the click.
    if ((e.target as HTMLElement).closest("button")) return;
    const s = state.current;
    cancelAnimationFrame(s.raf);
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastT = performance.now();
    s.v = 0;
    s.vy = 0;
    setHint(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dx = e.clientX - s.lastX;
    // Touch keeps vertical swipes for page scrolling (touch-action: pan-y).
    const dy = e.pointerType === "mouse" ? e.clientY - s.lastY : 0;
    s.x += dx;
    s.y += dy;
    s.v = (dx / Math.max(now - s.lastT, 1)) * 16;
    s.vy = (dy / Math.max(now - s.lastT, 1)) * 16;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastT = now;
    apply();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    state.current.dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    glide();
  };

  const toggleFullscreen = async () => {
    const host = frame.current?.parentElement;
    if (!host) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await host.requestFullscreen();
    } catch {
      /* Fullscreen not available (e.g. iOS Safari on iPhone) — the inline viewer still works. */
    }
  };

  const changeScene = (i: number) => {
    setIndex(i);
    setHint(true);
  };

  const isFailed = failed[scene.id];

  return (
    <div className={cn("relative flex h-full flex-col bg-teal-900", fullscreen && "p-0")}>
      <div
        ref={frame}
        tabIndex={0}
        role="region"
        aria-roledescription="panorama viewer"
        aria-label={`${scene.title}. ${media.alt}. Drag or use the arrow keys to look around.`}
        onKeyDown={(e) => {
          if (e.key.startsWith("Arrow")) e.preventDefault();
          if (e.key === "ArrowLeft") nudge(1);
          if (e.key === "ArrowRight") nudge(-1);
          if (e.key === "ArrowUp") nudge(1, "y");
          if (e.key === "ArrowDown") nudge(-1, "y");
          if (e.key === "f") toggleFullscreen();
        }}
        onPointerDown={isFailed ? undefined : onPointerDown}
        onPointerMove={isFailed ? undefined : onPointerMove}
        onPointerUp={isFailed ? undefined : onPointerUp}
        onPointerCancel={isFailed ? undefined : onPointerUp}
        className={cn(
          "relative min-h-0 flex-1 touch-pan-y overflow-hidden outline-none",
          !isFailed && "cursor-grab active:cursor-grabbing",
        )}
      >
        {isFailed ? (
          <Image src={media.src} alt={media.alt} fill sizes="100vw" className="object-cover" />
        ) : (
          <div ref={strip} className="absolute left-0 top-0 will-change-transform">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={media.src}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 400vw, 250vw"
                  loading="eager"
                  className="pointer-events-none object-cover"
                  onLoad={() => setLoaded((l) => ({ ...l, [scene.id]: true }))}
                  onError={() => setFailed((f) => ({ ...f, [scene.id]: true }))}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {!isFailed && !loaded[scene.id] && (
          <div className="absolute inset-0 grid place-items-center" role="status">
            <span className="flex items-center gap-3 rounded-full bg-teal-900/70 px-5 py-3 text-sm font-semibold text-white">
              <span className="size-4 animate-spin rounded-full border-2 border-sun-400 border-t-transparent" aria-hidden="true" />
              Loading scene…
            </span>
          </div>
        )}

        {/* Lens vignette */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_55%,rgb(4_23_28/0.55)_100%)]" />

        <div className="pointer-events-none absolute left-4 top-4 flex max-w-[calc(100%-6rem)] flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-500 px-3 py-1.5 text-xs font-bold text-teal-700">
            <Info className="size-3.5" aria-hidden="true" />
            {scene.kind === "360" ? "360° capture" : "Demo panorama · wide photo, not a 360° capture"}
          </span>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="absolute right-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-teal-600 shadow-soft transition hover:bg-sun-500"
        >
          <X className="size-4" aria-hidden="true" /> Exit
        </button>

        <AnimatePresence>
          {hint && !isFailed && loaded[scene.id] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-teal-900/70 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm"
            >
              <Hand className="size-5 text-sun-400" aria-hidden="true" /> Drag to look around
            </motion.div>
          )}
        </AnimatePresence>

        {isFailed && (
          <p className="absolute inset-x-4 bottom-20 rounded-2xl bg-white/95 p-4 text-sm text-ink" role="status">
            The panorama couldn&rsquo;t load, so you&rsquo;re seeing a standard photo instead.
          </p>
        )}

        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Look left"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-teal-600 transition hover:bg-sun-500"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="relative h-1.5 flex-1 rounded-full bg-white/25" aria-hidden="true">
            <div
              className="absolute top-1/2 h-3 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sun-500"
              style={{ left: `calc(1.75rem + (100% - 3.5rem) * ${progress})` }}
            />
          </div>
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Look right"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-teal-600 transition hover:bg-sun-500"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "View fullscreen"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-teal-600 transition hover:bg-sun-500"
          >
            {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-white/10 bg-teal-600 px-4 py-3">
        <span className="eyebrow mr-2 text-[0.65rem] text-turquoise-300">Scenes</span>
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => changeScene(i)}
            aria-pressed={i === index}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              i === index ? "bg-sun-500 text-teal-700" : "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {s.title}
          </button>
        ))}
        <p className="ml-auto hidden text-xs text-white/60 xl:block">{scene.caption}</p>
      </div>
    </div>
  );
}
