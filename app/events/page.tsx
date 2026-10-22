import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { Notice, PageShell } from "@/components/layout/PageShell";
import { getMedia } from "@/data/media";

export const metadata: Metadata = {
  title: "Events & Festivals",
  description: "Signature seasonal happenings across the Wildwoods, from kite festivals to boardwalk parades.",
};

/**
 * Recurring, well-established happenings described by season only.
 * Dates, venues and line-ups change every year — connect the official events
 * calendar feed here before launch.
 */
const events = [
  {
    title: "Wildwoods International Kite Festival",
    season: "Late spring",
    text: "Giant show kites, stunt teams and colourful windsocks fill the sky above the wide Wildwood beach.",
    imageId: "kite-festival",
  },
  {
    title: "National Marbles Tournament",
    season: "Early summer",
    text: "Young players from across the country compete in a tradition long hosted on the Wildwood beachfront.",
    imageId: "beach-near-mariners",
  },
  {
    title: "Boardwalk parades & summer nights",
    season: "Summer",
    text: "Evening parades, live music and fireworks bring families to the boardwalk throughout the season.",
    imageId: "family-fun-night",
  },
  {
    title: "Irish Fall Festival",
    season: "Early fall",
    text: "North Wildwood celebrates Irish music, dancing and food as the summer crowds give way to autumn.",
    imageId: "hereford-lighthouse",
  },
  {
    title: "Convention Center shows",
    season: "Year-round",
    text: "The Wildwoods Convention Center on the boardwalk hosts expos, sports, concerts and festivals.",
    imageId: "wildwoods-sign-night",
  },
];

export default function EventsPage() {
  return (
    <PageShell
      eyebrow="Events & festivals"
      title={
        <>
          Something&rsquo;s always <span className="display-accent text-sun-400">happening.</span>
        </>
      }
      intro="A taste of the signature happenings that bring the island to life through the seasons."
    >
      <Notice>
        Dates, locations and programmes change every year. Always confirm details with the official event organiser
        before planning travel. A live events calendar will appear here once connected.
      </Notice>
      <ol className="mt-10 grid gap-6">
        {events.map((e, i) => {
          const img = getMedia(e.imageId);
          return (
            <li key={e.title} className="grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-teal-500/8 md:grid-cols-[320px_1fr]">
              <div className="relative aspect-[16/10] md:aspect-auto">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 320px, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8">
                <p className="eyebrow flex items-center gap-2 text-[0.68rem] text-coral-600">
                  <CalendarDays className="size-4" aria-hidden="true" /> {e.season}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-teal-600 md:text-3xl">
                  <span className="mr-2 text-ink/25">{String(i + 1).padStart(2, "0")}</span>
                  {e.title}
                </h2>
                <p className="mt-3 max-w-xl leading-relaxed text-ink/70">{e.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
