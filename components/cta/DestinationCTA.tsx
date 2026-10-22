"use client";

import { useRef } from "react";
import { ArrowUpRight, CalendarHeart } from "lucide-react";
import { ParallaxImage } from "@/components/animation/ParallaxImage";
import { useReveal } from "@/components/animation/useReveal";
import { MagneticButton } from "@/components/ui/Button";
import { gsap, MOTION_OK, useGSAP } from "@/lib/animation";

/** Retro boardwalk sun: horizontal cut-outs across its lower half. */
const sunStripes =
  "linear-gradient(to bottom, #000 0 54%, transparent 54% 58%, #000 58% 66%, transparent 66% 70.5%, #000 70.5% 77%, transparent 77% 82%, #000 82% 87%, transparent 87% 93%, #000 93%)";

export function DestinationCTA() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        gsap.fromTo(
          q("[data-cta-sun]"),
          { yPercent: 35, scale: 0.92 },
          {
            yPercent: -12,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom 40%", scrub: 0.8 },
          },
        );
        q("[data-cta-wave]").forEach((el, i) => {
          gsap.fromTo(
            el,
            { xPercent: i % 2 ? -4 : 4 },
            {
              xPercent: i % 2 ? 2 : -2,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="plan" ref={root} aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-teal-700 text-white">
      <ParallaxImage mediaId="sunrise-northeast" className="absolute inset-0 -z-20" strength={16} alt="" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(6_34_42/0.94)_0%,rgb(16_86_101/0.82)_32%,rgb(8_125_156/0.45)_58%,rgb(244_123_32/0.45)_82%,rgb(255_212_0/0.55)_100%)]"
      />

      <div
        data-cta-sun
        aria-hidden="true"
        className="absolute -right-24 bottom-28 -z-10 size-64 rounded-full bg-[linear-gradient(to_bottom,#FFD400_0%,#F47B20_62%,#F15A24_100%)] opacity-95 md:bottom-auto md:-right-[10%] md:top-[34%] md:size-[46vw] lg:right-[3%] lg:size-[min(36vw,36rem)]"
        style={{ WebkitMaskImage: sunStripes, maskImage: sunStripes }}
      />

      <div className="mx-auto max-w-[1320px] px-5 pb-48 pt-28 sm:px-8 md:pb-60 md:pt-40">
        <h2 id="cta-title" data-split className="display max-w-[13ch] text-[clamp(3.4rem,10vw,9.5rem)]">
          Your next great story <span className="display-accent text-sun-400">starts here.</span>
        </h2>
        <p data-reveal className="mt-8 max-w-xl text-xl leading-relaxed text-white/90 md:text-2xl">
          Salt in the air. Sand between your toes. A little more Wildwoods in your life.
        </p>
        <div data-reveal className="mt-10 flex flex-wrap gap-3">
          <MagneticButton href="/#itinerary" variant="sun" size="lg" icon={<CalendarHeart className="size-5" />}>
            Plan Your Trip
          </MagneticButton>
          <MagneticButton href="/#things-to-do" variant="light" size="lg" icon={<ArrowUpRight className="size-5" />}>
            Explore Things to Do
          </MagneticButton>
        </div>
      </div>

      {/* Layered waves flowing into the footer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-52">
        <svg data-cta-wave viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute -inset-x-[5%] bottom-10 h-full w-[110%] text-turquoise-500/70">
          <path d="M0 120c120-50 240-60 360-30s240 70 360 40 240-90 360-70 240 60 360 30v110H0z" fill="currentColor" />
        </svg>
        <svg data-cta-wave viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute -inset-x-[5%] bottom-4 h-[80%] w-[110%] text-ocean-500">
          <path d="M0 110c140-40 260-40 380 0s240 50 360 10 260-70 380-40 220 50 320 20v100H0z" fill="currentColor" />
        </svg>
        <svg data-cta-wave viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute -inset-x-[5%] -bottom-px h-[55%] w-[110%] text-teal-600">
          <path d="M0 90c160-50 300-50 440 0s280 50 420 0 300-50 580 0v110H0z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
