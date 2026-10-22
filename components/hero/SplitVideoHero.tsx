"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowDownRight, MoveHorizontal, Pause, Play } from "lucide-react";
import { MagneticButton } from "@/components/ui/Button";
import { heroVideos } from "@/data/media";
import { gsap, MOTION_OK, REDUCED, SplitText, useGSAP } from "@/lib/animation";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { HeroVideoPanel } from "./HeroVideoPanel";

const MIN = 30;
const MAX = 70;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

/**
 * Cinematic 50/50 hero: beach days (left) and boardwalk nights (right).
 * Desktop visitors can drag (or arrow-key) the seam to favour either side;
 * on smaller screens the panels stack into a vertical story.
 */
export function SplitVideoHero() {
  const root = useRef<HTMLElement>(null);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reduced = useReducedMotion();
  const paused = userPaused ?? reduced;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const heading = q("[data-hero-title]")[0] as HTMLElement;
        const label = q("[data-hero-label]")[0] as HTMLElement;
        const titleSplit = SplitText.create(heading, { type: "lines", mask: "lines", linesClass: "split-line" });
        const labelSplit = SplitText.create(label, { type: "lines", mask: "lines", linesClass: "split-line" });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(
          q("[data-hero-panel='left']"),
          { autoAlpha: 1, clipPath: "inset(0% 0% 0% 100%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 },
        )
          .fromTo(
            q("[data-hero-panel='right']"),
            { autoAlpha: 1, clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 },
            "<",
          )
          .fromTo(q(".hero-zoom"), { scale: 1.28 }, { scale: 1, duration: 2.2 }, "<")
          .fromTo(q("[data-hero-eyebrow]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.45)
          .set(heading, { autoAlpha: 1 }, 0.5)
          .from(titleSplit.lines, { yPercent: 115, duration: 1.2, stagger: 0.1 }, 0.5)
          .fromTo(
            q("[data-hero-fade]"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 },
            0.85,
          )
          .set(label, { autoAlpha: 1 }, 0.9)
          .from(labelSplit.lines, { yPercent: 115, duration: 1.1, stagger: 0.08 }, 0.9)
          .fromTo(q("[data-hero-seam]"), { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 1.4 }, 0.7);

        // Scroll: media drifts down slower than the page.
        gsap.to(q(".hero-media"), {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      // Copy lifts away only when both panels share the viewport (desktop split).
      mm.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
        gsap.to(gsap.utils.selector(root)(".hero-copy"), {
          yPercent: -22,
          autoAlpha: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "35% top", end: "bottom top", scrub: true },
        });
      });

      mm.add(REDUCED, () => {
        gsap.set(gsap.utils.selector(root)("[data-intro]"), { autoAlpha: 1, clearProps: "clipPath" });
      });
    },
    { scope: root },
  );

  const setFromPointer = useCallback((clientX: number) => {
    const rect = root.current?.getBoundingClientRect();
    if (!rect) return;
    setSplit(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging) setFromPointer(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? split - step
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? split + step
          : e.key === "Home"
            ? MIN
            : e.key === "End"
              ? MAX
              : e.key === "Enter"
                ? 50
                : null;
    if (next !== null) {
      e.preventDefault();
      setSplit(clamp(next));
    }
  };

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-teal-900 text-white"
      style={{ "--split": `${split}%` } as React.CSSProperties}
    >
      <div
        className={cn(
          "grid grid-cols-1 lg:h-[100svh] lg:max-h-[1080px] lg:min-h-[700px] lg:grid-cols-[var(--split)_minmax(0,1fr)]",
          !dragging && "transition-[grid-template-columns] duration-700 ease-[var(--ease-out-expo)]",
        )}
      >
        {/* LEFT — Beach days */}
        <div
          data-hero-panel="left"
          data-intro
          className="@container relative min-h-[max(88svh,620px)] overflow-hidden lg:min-h-0"
        >
          <div className="hero-media absolute inset-0 will-change-transform">
            <div className="hero-zoom absolute inset-0">
              <HeroVideoPanel src={heroVideos.beach.src} poster={heroVideos.beach.poster} paused={paused} />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(4_23_28/0.88)_0%,rgb(4_23_28/0.45)_38%,rgb(4_23_28/0)_68%),linear-gradient(100deg,rgb(4_23_28/0.55)_0%,rgb(4_23_28/0)_60%),linear-gradient(to_bottom,rgb(4_23_28/0.5)_0%,rgb(4_23_28/0)_22%)]"
          />

          <div className="hero-copy absolute inset-x-0 bottom-0 px-6 pb-14 sm:px-10 lg:px-[clamp(2.5rem,5cqi,5rem)] lg:pb-[clamp(3rem,9vh,6.5rem)]">
            <p data-hero-eyebrow data-intro className="eyebrow mb-5 flex items-center gap-3 text-sun-400">
              <span className="h-px w-10 bg-sun-400" aria-hidden="true" />
              New Jersey&rsquo;s Coastal Escape
            </p>
            <h1
              id="hero-title"
              data-hero-title
              data-intro
              className="display max-w-[11ch] text-[clamp(3.6rem,15.5cqi,9.75rem)] text-white"
            >
              Make Waves <span className="display-accent text-sun-400">in the</span> Wildwoods
            </h1>
            <p
              data-hero-fade
              data-intro
              className="mt-6 max-w-[34ch] text-lg leading-relaxed text-white/90 md:text-xl"
            >
              Five miles of free beaches, an iconic boardwalk, and endless summer memories.
            </p>
            <div data-hero-fade data-intro className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton
                href="/#explore"
                variant="sun"
                size="lg"
                icon={<ArrowDownRight className="size-5" strokeWidth={2.4} />}
              >
                Discover Wildwoods
              </MagneticButton>
              <MagneticButton href="/#itinerary" variant="outline-light" size="lg">
                Plan Your Escape
              </MagneticButton>
            </div>
          </div>

          <ScrollCue className="absolute bottom-6 right-6 lg:hidden" />
        </div>

        {/* RIGHT — Boardwalk nights */}
        <div
          data-hero-panel="right"
          data-intro
          className="@container relative min-h-[max(62svh,460px)] overflow-hidden lg:min-h-0"
        >
          <div className="hero-media absolute inset-0 will-change-transform">
            <div className="hero-zoom absolute inset-0">
              <HeroVideoPanel src={heroVideos.boardwalk.src} poster={heroVideos.boardwalk.poster} paused={paused} />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(70%_55%_at_88%_88%,rgb(4_23_28/0.62)_0%,rgb(4_23_28/0)_70%),linear-gradient(to_top,rgb(4_23_28/0.82)_0%,rgb(4_23_28/0.25)_42%,rgb(4_23_28/0)_65%),linear-gradient(to_bottom,rgb(4_23_28/0.5)_0%,rgb(4_23_28/0)_22%)]"
          />
          {/* Mobile seam between the stacked panels */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 24"
            preserveAspectRatio="none"
            className="absolute inset-x-0 -top-px h-5 w-full text-sun-500 lg:hidden"
          >
            <path d="M0 4c50 14 100 14 150 4s100-12 150 0 70 12 100 6V0H0z" fill="currentColor" />
          </svg>

          <div className="hero-copy absolute inset-x-0 bottom-0 flex flex-col items-end px-6 pb-12 text-right sm:px-10 lg:px-[clamp(2rem,5cqi,4.5rem)] lg:pb-[clamp(3rem,9vh,6.5rem)]">
            <p data-hero-fade data-intro className="eyebrow mb-4 text-turquoise-100 [text-shadow:0_1px_10px_rgb(4_23_28/0.9)]">
              After dark on the boardwalk
            </p>
            <p
              data-hero-label
              data-intro
              className="display text-[clamp(2.6rem,11cqi,6.25rem)] text-white"
            >
              Beach days.
              <br />
              <span className="text-sun-400">Boardwalk nights.</span>
            </p>
            <ul data-hero-fade data-intro className="mt-6 flex flex-wrap justify-end gap-2 text-sm font-semibold">
              {["Morey's Piers", "Tram car rides", "Neon & pizza"].map((t) => (
                <li key={t} className="rounded-full bg-white/12 px-3.5 py-1.5 text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur-[2px]">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? "Play background videos" : "Pause background videos"}
            className="absolute right-4 top-24 grid size-10 place-items-center rounded-full bg-teal-900/50 text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-teal-600 lg:bottom-6 lg:top-auto lg:right-6"
          >
            {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
          </button>
        </div>
      </div>

      {/* Desktop seam + split slider */}
      <div
        data-hero-seam
        data-intro
        className="pointer-events-none absolute inset-y-0 z-10 hidden w-6 -translate-x-1/2 origin-center lg:block"
        style={{
          left: "var(--split)",
          transition: dragging ? "none" : "left 700ms var(--ease-out-expo)",
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path
            d="M12 0c9 55-9 110 0 165s9 110 0 165-9 110 0 165 9 110 0 165-9 110 0 165 9 110 0 175"
            fill="none"
            stroke="#FFD400"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <button
          type="button"
          role="slider"
          aria-label="Resize the beach and boardwalk video panels"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={Math.round(split)}
          aria-valuetext={`Beach ${Math.round(split)}%, boardwalk ${Math.round(100 - split)}%`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onDoubleClick={() => setSplit(50)}
          className={cn(
            "pointer-events-auto absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-full bg-sun-500 text-teal-700 shadow-[0_10px_30px_-8px_rgb(4_23_28/0.6)] ring-4 ring-sun-500/30 transition-transform duration-300 hover:scale-110",
            dragging ? "scale-110 cursor-grabbing" : "cursor-grab",
          )}
        >
          <MoveHorizontal className="size-6" strokeWidth={2.4} aria-hidden="true" />
        </button>
        <ScrollCue className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2" />
      </div>
    </section>
  );
}

function ScrollCue({ className }: { className?: string }) {
  return (
    <a
      href="#itinerary"
      className={cn("group flex flex-col items-center gap-2 text-white/85 hover:text-white", className)}
      aria-label="Scroll to the trip planner"
    >
      <span className="relative h-12 w-7 overflow-hidden rounded-full bg-teal-900/40 ring-1 ring-inset ring-white/50">
        <span
          className="absolute left-1/2 top-2 h-3 w-1 -translate-x-1/2 rounded-full bg-sun-400"
          style={{ animation: "scroll-cue 2.2s cubic-bezier(0.65,0,0.35,1) 1.6s 4" }}
        />
      </span>
      <span className="eyebrow text-[0.6rem]">Scroll</span>
    </a>
  );
}
