"use client";

import { useRef, useState } from "react";
import { ArrowDownRight, Pause, Play } from "lucide-react";
import { MagneticButton } from "@/components/ui/Button";
import { heroVideo } from "@/data/media";
import { gsap, MOTION_OK, REDUCED, SplitText, useGSAP } from "@/lib/animation";
import { defaultContent } from "@/lib/cms/content";
import { Accent, plainText } from "@/lib/cms/render";
import { useContent } from "@/lib/cms/store";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { EventCalendar } from "./EventCalendar";
import { HeroVideoPanel } from "./HeroVideoPanel";

/**
 * Full-bleed cinematic hero: one day-to-night background video, the headline
 * block anchored bottom-left and the events calendar bottom-right (stacked on
 * smaller screens).
 */
export function VideoHero() {
  const root = useRef<HTMLElement>(null);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reduced = useReducedMotion();
  const paused = userPaused ?? reduced;
  const hero = useContent("hero");
  const events = useContent("events");
  const showCalendar = hero.showCalendar && events.length > 0;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const heading = q("[data-hero-title]")[0] as HTMLElement;
        const titleSplit = SplitText.create(heading, { type: "lines", mask: "lines", linesClass: "split-line" });

        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .fromTo(
            q("[data-hero-frame]"),
            { autoAlpha: 1, clipPath: "inset(9% 6% 9% 6% round 48px)" },
            { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.6 },
          )
          .fromTo(q(".hero-zoom"), { scale: 1.25 }, { scale: 1, duration: 2.3 }, "<")
          .set(heading, { autoAlpha: 1 }, 0.55)
          .from(titleSplit.lines, { yPercent: 115, duration: 1.2, stagger: 0.1 }, 0.55)
          .fromTo(q("[data-hero-fade]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 0.9)
          .fromTo(
            q("[data-hero-calendar]"),
            { autoAlpha: 0, y: 70, rotate: 3 },
            { autoAlpha: 1, y: 0, rotate: 0, duration: 1.3 },
            1,
          );

        gsap.to(q(".hero-media"), {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      // On large screens the copy and calendar lift away as the hero scrolls out.
      mm.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
        gsap.to(gsap.utils.selector(root)(".hero-copy"), {
          yPercent: -18,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "40% top", end: "bottom top", scrub: true },
        });
      });

      mm.add(REDUCED, () => {
        gsap.set(gsap.utils.selector(root)("[data-intro]"), { autoAlpha: 1, clearProps: "clipPath" });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-teal-900 text-white lg:h-[100svh] lg:max-h-[1100px] lg:min-h-[560px]"
    >
      <div data-hero-frame data-intro className="absolute inset-0 overflow-hidden">
        <div className="hero-media absolute inset-0 will-change-transform">
          <div className="hero-zoom absolute inset-0">
            <HeroVideoPanel src={heroVideo.src} mobileSrc={heroVideo.mobileSrc} poster={heroVideo.poster} paused={paused} />
          </div>
        </div>
        {/* Even tint for legibility over bright footage; stronger on phones where the copy sits mid-frame. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[rgb(4_23_28/0.42)] lg:bg-[rgb(4_23_28/0.14)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(4_23_28/0.9)_0%,rgb(4_23_28/0.55)_30%,rgb(4_23_28/0.1)_60%,rgb(4_23_28/0)_75%),linear-gradient(95deg,rgb(4_23_28/0.55)_0%,rgb(4_23_28/0)_55%),linear-gradient(to_bottom,rgb(4_23_28/0.55)_0%,rgb(4_23_28/0)_20%)]"
        />
      </div>

      <div className={cn(
          "relative z-10 mx-auto mt-auto grid w-full max-w-[1320px] items-end gap-12 px-5 pb-16 pt-36 sm:px-8 lg:gap-12 lg:pb-[clamp(2.25rem,5vh,3.5rem)]",
          showCalendar && "lg:grid-cols-[minmax(0,1fr)_290px] lg:pr-[max(2rem,calc(6rem_-_(100vw_-_1320px)/2))]",
        )}>
        <div className="hero-copy">
          <h1
            id="hero-title"
            data-hero-title
            data-intro
            className="display text-[clamp(2.4rem,10.5vw,3.6rem)] text-white md:text-[clamp(3.6rem,6vw,6.3rem)]"
          >
            <HeroLine text={hero.line1} fallback={defaultContent.hero.line1} />{" "}
            <HeroLine text={hero.line2} fallback={defaultContent.hero.line2} />
          </h1>
          {hero.intro && (
            <p data-hero-fade data-intro className="mt-4 max-w-[36ch] text-base leading-relaxed text-white/90 md:text-lg">
              {hero.intro}
            </p>
          )}
          <div data-hero-fade data-intro className="mt-6 flex flex-wrap items-center gap-3">
            {hero.primaryLabel && (
              <MagneticButton href={hero.primaryHref} variant="sun" size="md" icon={<ArrowDownRight className="size-4" strokeWidth={2.4} />}>
                {hero.primaryLabel}
              </MagneticButton>
            )}
            {hero.secondaryLabel && (
              <MagneticButton href={hero.secondaryHref} variant="outline-light" size="md">
                {hero.secondaryLabel}
              </MagneticButton>
            )}
          </div>
        </div>

        {showCalendar && (
          <div className="hero-copy flex lg:justify-end">
            <div data-hero-calendar data-intro className="w-full max-w-[290px]">
              <EventCalendar paused={paused} />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setUserPaused(!paused)}
        aria-pressed={paused}
        aria-label={paused ? "Play background video and calendar" : "Pause background video and calendar"}
        className="absolute right-4 top-24 z-10 grid size-10 place-items-center rounded-full bg-teal-900/50 text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-teal-600 sm:right-6 lg:top-28"
      >
        {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
      </button>

      <ScrollCue className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 lg:flex" />
    </section>
  );
}

/** One headline line; kept on a single line unless the edited copy is much longer than the default. */
function HeroLine({ text, fallback }: { text: string; fallback: string }) {
  if (!text) return null;
  const nowrap = plainText(text).length <= plainText(fallback).length + 2;
  return (
    <span className={cn("block", nowrap && "whitespace-nowrap")}>
      <Accent text={text} className="text-sun-400" />
    </span>
  );
}

function ScrollCue({ className }: { className?: string }) {
  return (
    <a
      href="#itinerary"
      className={cn("group flex-col items-center gap-2 text-white/85 hover:text-white", className)}
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
