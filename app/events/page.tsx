import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays } from "lucide-react";
import { BookStayCard } from "@/components/events/BookStayCard";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navigation/Navbar";
import { SaveButton } from "@/components/wishlist/SaveButton";
import { signatureEvents } from "@/data/events";
import { getMedia } from "@/data/media";
import { Accent } from "@/lib/cms/render";

export const metadata: Metadata = {
  title: "Events Calendar",
  description:
    "The Wildwoods calendar of events: festivals, holiday celebrations, races, concerts and family fun, plus a quick way to find a place to stay.",
};

/** Events calendar (from wildwoodsnj.com/events-calendar) with "Book your stay" alongside, then the signature events. */
export default function EventsPage() {
  return (
    <>
      <Navbar overHero={false} />
      <main id="main">
        <header id="top" className="relative overflow-hidden bg-teal-500 pb-20 pt-36 text-white md:pb-24 md:pt-44">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-10 size-44 rounded-full bg-linear-to-b from-sun-500 to-orange-500 opacity-90 md:-right-24 md:top-28 md:size-80"
          />
          <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-cream">
            <path d="M0 50c160-40 320-50 480-20s320 40 480 15 320-45 480-15v50H0z" fill="currentColor" />
          </svg>
          <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
            <p className="eyebrow text-sun-400">Events calendar</p>
            <h1 className="display mt-4 max-w-[16ch] text-[clamp(3rem,7.5vw,6.25rem)]">
              <Accent text="Events in *the Wildwoods.*" className="text-sun-400" />
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 md:text-xl">
              Welcome to the Wildwoods calendar of events, your go-to guide for all the exciting things happening in the area. Whether you&rsquo;re planning a
              weekend getaway or a family vacation, our comprehensive event calendar ensures you won&rsquo;t miss any of the must-see Wildwoods events.
            </p>
            <nav aria-label="More calendars" className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/business-info#convention-center"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-teal-700"
              >
                <Building2 className="size-4" aria-hidden="true" /> Convention Center events
              </Link>
              <a
                href="#signature-events"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-teal-700"
              >
                <CalendarDays className="size-4" aria-hidden="true" /> Signature events by season
              </a>
            </nav>
          </div>
        </header>

        <section aria-label="Calendar and booking" className="on-light bg-cream pb-20 pt-10 md:pb-28 md:pt-14">
          <div className="mx-auto grid max-w-[1320px] gap-6 px-5 sm:px-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
            <EventsCalendar />
            {/* Below the events on phones, a bar above them on tablets, a sticky right-hand sidebar on wide screens
                (scrolling on its own if it's ever taller than the window, e.g. with larger text). */}
            <aside className="order-last md:order-first xl:sticky xl:top-28 xl:order-last xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto xl:overscroll-contain xl:rounded-[1.75rem]">
              <BookStayCard />
            </aside>
          </div>
        </section>

        <section id="signature-events" aria-labelledby="signature-title" className="on-light scroll-mt-24 bg-white py-20 md:py-28">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
            <p className="eyebrow text-coral-600">Year after year</p>
            <h2 id="signature-title" className="display mt-3 text-[clamp(2.4rem,5vw,4.25rem)] text-teal-500">
              <Accent text="Signature *events.*" className="text-coral-600" />
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
              Long-running favourites described by season. Exact dates change every year, so check the calendar above or the organiser.
            </p>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {signatureEvents.map((e) => {
                const img = getMedia(e.imageId);
                return (
                  <li key={e.id} id={e.id} className="flex scroll-mt-28 flex-col overflow-hidden rounded-[1.75rem] bg-cream ring-1 ring-teal-500/8">
                    <div className="relative aspect-[16/10]">
                      <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                      <SaveButton type="event" id={e.id} title={e.title} className="absolute right-3 top-3" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="eyebrow text-[0.62rem] text-coral-600">{e.season}</p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-tight text-teal-600">{e.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70">{e.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-10 text-xs text-ink/55">
              Calendar listings, descriptions and photos come from the official Wildwoods events calendar at{" "}
              <a href="https://wildwoodsnj.com/events-calendar/" target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-ocean-600">
                wildwoodsnj.com <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
