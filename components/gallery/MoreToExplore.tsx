"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useReveal } from "@/components/animation/useReveal";
import { defaultContent } from "@/lib/cms/content";
import { Accent, fittedTitleClass, resolveImage } from "@/lib/cms/render";
import { useContent } from "@/lib/cms/store";

/** "More to explore" — the official things-to-do categories as cards with titles and descriptions. */
export function MoreToExplore() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const copy = useContent("thingsToDo");
  const categories = useContent("categories");

  return (
    <section
      id="things-to-do"
      ref={root}
      aria-labelledby="explore-more-title"
      className="on-light relative overflow-x-clip bg-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHeader
          id="explore-more-title"
          titleClassName={fittedTitleClass(
            copy.title,
            defaultContent.thingsToDo.title,
            "whitespace-nowrap text-[clamp(1.25rem,calc((100vw_-_4.5rem)/12.4),6.35rem)]",
          )}
          title={<Accent text={copy.title} className="text-coral-600" />}
          lede={copy.intro || undefined}
        />
      </div>

      <div className="mx-auto mt-14 max-w-[1320px] px-5 sm:px-8">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-5 lg:gap-y-12">
          {categories.map((c) => {
            const img = resolveImage(c.image, c.alt);
            const external = /^https?:\/\//.test(c.href);
            return (
              <li key={c.id} data-reveal className="flex">
                <a
                  href={c.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener" : undefined}
                  className="group flex w-full flex-col rounded-[1.25rem]"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-teal-100">
                    {img && (
                      <Image
                        src={img.src}
                        alt={c.alt}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute right-2.5 top-2.5 hidden size-9 place-items-center rounded-full bg-white/95 text-teal-600 shadow-soft transition-colors duration-300 group-hover:bg-sun-500 group-hover:text-teal-700 sm:grid"
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                  </span>
                  <span className="mt-4 flex flex-1 flex-col">
                    <span aria-hidden="true" className="h-1 w-6 rounded-full bg-coral-600 transition-[width] duration-300 group-hover:w-10" />
                    <h3 className="mt-3 font-display text-base font-bold leading-tight text-teal-600 transition-colors duration-300 group-hover:text-coral-600 sm:text-lg lg:text-xl">
                      {c.label}
                    </h3>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/70 sm:text-[0.92rem]">{c.description}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-ocean-600">
                      Explore
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                  {external && <span className="sr-only"> (opens {hostOf(c.href)} in a new tab)</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "another site";
  }
}
