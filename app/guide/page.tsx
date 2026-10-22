import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Car, Info, Plane, Ship, Sun, Umbrella } from "lucide-react";
import { Notice, PageShell } from "@/components/layout/PageShell";
import { areas } from "@/data/attractions";
import { galleryItems } from "@/data/gallery";
import { getMedia } from "@/data/media";

export const metadata: Metadata = {
  title: "Pocket Visitor Guide",
  description: "A mobile-friendly guide to the Wildwoods: the four towns, beach basics, getting here and the best photo spots.",
};

const photoSpots = ["sign-kites", "carousel-night", "lighthouse", "motel-doors", "sunrise-northeast", "tramcar"];

export default function GuidePage() {
  return (
    <PageShell
      eyebrow="Pocket visitor guide"
      title={
        <>
          The Wildwoods, <span className="display-accent text-sun-400">in your pocket.</span>
        </>
      }
      intro="Everything you need on the go: the four towns, beach basics, how to get here and where to point your camera."
    >
      <nav aria-label="On this page" className="-mt-2 flex flex-wrap gap-2">
        {[
          ["#towns", "The towns"],
          ["#beach-basics", "Beach basics"],
          ["#getting-here", "Getting here"],
          ["#photo-spots", "Photo spots"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-600 ring-1 ring-teal-500/15 hover:bg-sun-500">
            {label}
          </a>
        ))}
      </nav>

      <section id="towns" aria-labelledby="towns-title" className="mt-14">
        <h2 id="towns-title" className="display text-5xl text-teal-500 md:text-6xl">Four towns, one island</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {areas.map((a) => {
            const img = getMedia(a.imageId);
            return (
              <article key={a.id} className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-teal-500/8">
                <div className="relative aspect-[16/9]">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 540px, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="eyebrow text-[0.65rem] text-ocean-600">{a.nickname}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-teal-600">{a.name}</h3>
                  <p className="mt-2 leading-relaxed text-ink/70">{a.summary}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="beach-basics" aria-labelledby="beach-title" className="mt-20">
        <h2 id="beach-title" className="display text-5xl text-teal-500 md:text-6xl">Beach basics</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Umbrella, title: "Free beaches", text: "The Wildwoods' beaches are free to enjoy — no beach tags needed." },
            { icon: Sun, title: "Swim near a lifeguard", text: "Lifeguards are on duty in season. Swim at guarded beaches and follow flag warnings." },
            { icon: Info, title: "Know the local rules", text: "Each town sets its own rules for bikes, pets, umbrellas and alcohol. Check before you go." },
          ].map((t) => (
            <li key={t.title} className="rounded-[2rem] bg-white p-6 ring-1 ring-teal-500/8">
              <t.icon className="size-7 text-orange-500" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-bold text-teal-600">{t.title}</h3>
              <p className="mt-2 text-ink/70">{t.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="getting-here" aria-labelledby="getting-title" className="mt-20">
        <h2 id="getting-title" className="display text-5xl text-teal-500 md:text-6xl">Getting here</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Car,
              title: "By car",
              text: "From the Garden State Parkway, Exit 4 (Route 47) leads to Wildwood and Wildwood Crest; Exit 6 (Route 147) leads to North Wildwood.",
            },
            {
              icon: Plane,
              title: "By air",
              text: "Atlantic City International and Philadelphia International are the closest major airports; continue by car or shuttle.",
            },
            {
              icon: Ship,
              title: "By ferry",
              text: "Coming from Delaware? The Cape May–Lewes Ferry lands a short drive south of the island.",
            },
          ].map((t) => (
            <li key={t.title} className="rounded-[2rem] bg-teal-500 p-6 text-white">
              <t.icon className="size-7 text-sun-400" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-bold">{t.title}</h3>
              <p className="mt-2 text-white/80">{t.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Notice>Routes, schedules and travel times change with season and traffic. Confirm with your carrier or a live navigation app before you set out.</Notice>
        </div>
      </section>

      <section id="photo-spots" aria-labelledby="photo-title" className="mt-20">
        <h2 id="photo-title" className="display text-5xl text-teal-500 md:text-6xl">Photo spots</h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {photoSpots.map((id) => {
            const item = galleryItems.find((g) => g.id === id)!;
            const img = getMedia(item.mediaId);
            return (
              <li key={id} className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-teal-500/8">
                <div className="relative aspect-square">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 340px, 50vw" className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1.5 font-display font-bold text-teal-600">
                    <Camera className="size-4 text-coral-500" aria-hidden="true" /> {item.title}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">{item.location}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[2.5rem] bg-sun-500 p-8 text-teal-700 md:flex-row md:items-center md:p-10">
        <div>
          <p className="display text-4xl md:text-5xl">Plan your days in 30 seconds</p>
          <p className="mt-2 font-medium">Pick a style, a length and your interests — we&rsquo;ll map out the rest.</p>
        </div>
        <Link href="/#itinerary" className="inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-teal-500 px-7 font-semibold text-white transition hover:bg-teal-600">
          Build your trip <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </PageShell>
  );
}
