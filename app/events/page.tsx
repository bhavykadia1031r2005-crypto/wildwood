import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { Notice, PageShell } from "@/components/layout/PageShell";
import { SaveButton } from "@/components/wishlist/SaveButton";
import { signatureEvents as events } from "@/data/events";
import { getMedia } from "@/data/media";

export const metadata: Metadata = {
  title: "Events & Festivals",
  description: "Signature seasonal happenings across the Wildwoods, from kite festivals to boardwalk parades.",
};

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
            <li key={e.id} id={e.id} className="grid scroll-mt-28 overflow-hidden rounded-[2rem] bg-white ring-1 ring-teal-500/8 md:grid-cols-[320px_1fr]">
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
                <SaveButton type="event" id={e.id} title={e.title} variant="pill" className="mt-5 self-start" />
              </div>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
