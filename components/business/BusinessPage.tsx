import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, BedDouble, CalendarDays, Megaphone, Newspaper, Phone } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { businessInfo, conventionCenter, type ResourceCard } from "@/data/business";
import { Accent } from "@/lib/cms/render";
import { cn } from "@/lib/utils";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const DAY = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });
const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });
const perkIcons = { listing: BadgeCheck, advertising: Megaphone, pr: Newspaper } as const;

/** Masthead with jump links to the two parts of the page. */
export function BusinessHero() {
  const jumps = [
    {
      href: "#business-info",
      n: "01",
      title: "Business Info",
      text: "Partner perks, listings, administration and the press room.",
      image: businessInfo.cards[0].image,
    },
    {
      href: "#convention-center",
      n: "02",
      title: "Convention Center",
      text: "260,000 sq ft on the boardwalk for meetings, shows and events.",
      image: conventionCenter.image,
    },
  ];
  return (
    <header id="top" className="relative overflow-hidden bg-teal-500 pb-24 pt-36 text-white md:pb-28 md:pt-44">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-10 size-44 rounded-full bg-linear-to-b from-sun-500 to-orange-500 opacity-90 md:-right-24 md:top-28 md:size-96"
      />
      <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-cream">
        <path d="M0 50c160-40 320-50 480-20s320 40 480 15 320-45 480-15v50H0z" fill="currentColor" />
      </svg>
      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end">
        <div>
          <p className="eyebrow text-sun-400">Business info</p>
          <h1 className="display mt-4 text-[clamp(3rem,8vw,6.75rem)]">
            <Accent text="Open for *business.*" className="text-sun-400" />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
            Marketing support for local businesses, and an oceanfront convention center for meetings, shows and events — all in one
            place.
          </p>
        </div>
        <nav aria-label="On this page" className="grid gap-3 sm:grid-cols-2">
          {jumps.map((j) => (
            <a
              key={j.href}
              href={j.href}
              className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-sm transition hover:bg-white hover:text-teal-700"
            >
              <span className="relative block aspect-[16/9] overflow-hidden">
                <Image src={j.image} alt="" fill sizes="280px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-sun-500 px-2.5 py-1 text-xs font-bold text-teal-700">{j.n}</span>
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="flex items-center justify-between gap-2 font-display text-lg font-bold">
                  {j.title}
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </span>
                <span className="mt-1 text-sm leading-snug text-white/75 group-hover:text-teal-700/75">{j.text}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

/** Part 1: wildwoodsnj.com/business-info. */
export function BusinessInfoSection() {
  return (
    <Reveal as="section" id="business-info" aria-labelledby="business-info-title" className="on-light scroll-mt-24 bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p data-reveal className="eyebrow text-coral-600">
              {businessInfo.eyebrow}
            </p>
            <h2 id="business-info-title" data-split className="display mt-4 max-w-[14ch] text-[clamp(2.75rem,6.6vw,5.75rem)] text-teal-500">
              <Accent text={businessInfo.title} className="text-coral-600" />
            </h2>
            <p data-reveal className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/75">
              {businessInfo.intro}
            </p>
          </div>
          <div data-reveal className="rounded-[2rem] bg-white p-6 ring-1 ring-teal-500/8 md:p-8">
            <p className="eyebrow text-[0.68rem] text-ocean-600">Marketing partner perks</p>
            <ul className="mt-5 flex flex-col gap-5">
              {businessInfo.perks.map((p) => {
                const Icon = perkIcons[p.id as keyof typeof perkIcons];
                return (
                  <li key={p.id} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sun-100 text-teal-600">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <p className="leading-relaxed text-ink/75">
                      <strong className="block font-display text-lg font-bold text-teal-600">{p.title}</strong>
                      {p.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <ResourceGrid cards={businessInfo.cards} className="mt-14 md:mt-20" />
      </div>
    </Reveal>
  );
}

/** Part 2: wildwoodsnj.com/convention-center. */
export function ConventionSection() {
  const c = conventionCenter;
  return (
    <section id="convention-center" aria-labelledby="convention-title" className="scroll-mt-24">
      {/* Intro on teal */}
      <Reveal className="relative overflow-hidden bg-teal-600 pb-24 pt-20 text-white md:pb-32 md:pt-28">
        <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full text-cream">
          <path d="M0 0h1440v20c-160 30-320 40-480 20S640-20 480 0 160 40 0 20z" fill="currentColor" />
        </svg>
        <div aria-hidden="true" className="absolute -left-32 bottom-10 size-[28rem] rounded-full bg-turquoise-500/10" />
        <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p data-reveal className="eyebrow text-sun-400">
              {c.eyebrow}
            </p>
            <h2 id="convention-title" data-split className="display mt-4 max-w-[13ch] text-[clamp(2.75rem,6.6vw,5.75rem)]">
              <Accent text={c.title} className="text-sun-400" />
            </h2>
            {c.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                {p}
              </p>
            ))}
            <ul data-reveal className="mt-8 flex flex-wrap gap-2" aria-label="Spaces available">
              {c.spaces.map((s) => (
                <li key={s} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-white/20">
                  {s} space
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal="right" className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.25rem] shadow-lift">
              <Image src={c.image} alt={c.imageAlt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-3xl bg-sun-500 px-5 py-4 text-teal-700 shadow-soft">
              <p className="display text-4xl">260,000</p>
              <p className="text-sm font-semibold">square feet on the boardwalk</p>
            </div>
          </div>
        </div>

        <dl className="relative mx-auto mt-20 grid max-w-[1320px] grid-cols-2 gap-3 px-5 sm:px-8 lg:grid-cols-4">
          {c.stats.map((s) => (
            <div key={s.label} data-reveal className="rounded-[1.75rem] bg-white/8 p-5 ring-1 ring-inset ring-white/15 md:p-6">
              <dt className="text-sm text-white/70">{s.label}</dt>
              <dd className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span className="display text-[clamp(1.9rem,4vw,2.75rem)] text-sun-400">{s.value}</span>
                {s.unit && <span className="text-sm font-semibold text-white/85">{s.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p data-reveal className="relative mx-auto mt-6 max-w-[1320px] px-5 text-sm text-white/70 sm:px-8">
          Built for {c.uses.map((u) => u.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}.
        </p>
      </Reveal>

      {/* Planner resources, accommodations, clients, events */}
      <Reveal className="on-light bg-cream pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h3 data-split className="display max-w-[18ch] text-[clamp(2.1rem,4.5vw,3.75rem)] text-teal-500">
              <Accent text="Plan, attend & *get to know us.*" className="text-coral-600" />
            </h3>
            <p data-reveal className="max-w-sm text-ink/70">
              Everything planners and attendees need, on the official Wildwoods Convention Center pages.
            </p>
          </div>
          <ResourceGrid cards={c.cards} className="mt-10" />

          <Accommodations />
          <Clients />
          <UpcomingEvents />
          <CallUs />

          <p className="mt-12 text-center text-xs text-ink/50">
            Content and photos on this page come from the official Wildwoods tourism site,{" "}
            <a href="https://wildwoodsnj.com/business-info/" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ocean-600">
              wildwoodsnj.com
            </a>
            .
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function ResourceGrid({ cards, className }: { cards: ResourceCard[]; className?: string }) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card) => (
        <li key={card.id} data-reveal className="flex">
          <a
            href={card.href}
            target="_blank"
            rel="noopener"
            className="group flex w-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-teal-500/8 transition-shadow duration-500 hover:shadow-lift"
          >
            <span className="relative block aspect-[16/10] overflow-hidden bg-teal-100">
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              />
              <span
                aria-hidden="true"
                className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/95 text-teal-600 shadow-soft transition-colors group-hover:bg-sun-500 group-hover:text-teal-700"
              >
                <ArrowUpRight className="size-4" />
              </span>
            </span>
            <span className="flex flex-1 flex-col p-5">
              <span className="eyebrow text-[0.62rem] text-coral-600">{card.tagline}</span>
              <span className="mt-2 font-display text-xl font-bold leading-tight text-teal-600 transition-colors group-hover:text-coral-600">{card.title}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-ocean-600">
                Visit page <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </span>
            <span className="sr-only"> (opens wildwoodsnj.com in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Accommodations() {
  const a = conventionCenter.accommodations;
  return (
    <div className="mt-20 grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-teal-500/8 md:mt-28 lg:grid-cols-2 lg:gap-0">
      <div data-reveal className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[28rem]">
        <Image src={a.image} alt={a.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="px-6 pb-10 sm:px-10 lg:py-14">
        <p data-reveal className="eyebrow text-coral-600">
          {a.eyebrow}
        </p>
        <h3 data-split className="display mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] text-teal-500">
          <Accent text={a.title} className="text-ocean-500" />
        </h3>
        {a.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} data-reveal className="mt-5 leading-relaxed text-ink/75">
            {p}
          </p>
        ))}
        <div data-reveal className="mt-8 flex flex-wrap gap-3">
          <a
            href={a.href}
            target="_blank"
            rel="noopener"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-teal-500 px-6 font-semibold text-white transition hover:bg-sun-500 hover:text-teal-700"
          >
            Visit page <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">(convention accommodations on wildwoodsnj.com, opens in a new tab)</span>
          </a>
          <Link
            href="/#stays"
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/30 transition hover:bg-teal-500 hover:text-white"
          >
            <BedDouble className="size-4" aria-hidden="true" /> Browse places to stay
          </Link>
        </div>
      </div>
    </div>
  );
}

function Clients() {
  const names = conventionCenter.clients;
  const half = Math.ceil(names.length / 2);
  const rows = [names.slice(0, half), names.slice(half)];
  return (
    <div className="mt-20 md:mt-28">
      <div className="text-center">
        <p data-reveal className="eyebrow text-coral-600">
          Our clients love us
        </p>
        <h3 data-split className="display mt-3 text-[clamp(2.1rem,4.2vw,3.5rem)] text-teal-500">
          <Accent text="Who we *work with.*" className="text-coral-600" />
        </h3>
      </div>
      <div data-reveal className="mt-10 flex flex-col gap-3">
        {rows.map((row, r) => (
          <div key={r} className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
            <div className={cn("marquee-track flex w-max gap-3", r === 1 && "marquee-reverse")}>
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className={cn("flex shrink-0 gap-3", copy === 1 && "marquee-copy")}>
                  {row.map((n) => (
                    <li key={n} className="whitespace-nowrap rounded-full bg-white px-5 py-3 font-display font-bold text-teal-600 ring-1 ring-teal-500/10">
                      {n}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingEvents() {
  const e = conventionCenter.events;
  return (
    <div className="mt-20 grid gap-10 md:mt-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <div>
        <p data-reveal className="eyebrow text-coral-600">
          Upcoming events
        </p>
        <h3 data-split className="display mt-3 max-w-[12ch] text-[clamp(2.1rem,4.2vw,3.5rem)] text-teal-500">
          <Accent text="What's going on *in the Wildwoods.*" className="text-coral-600" />
        </h3>
        <p data-reveal className="mt-5 max-w-md leading-relaxed text-ink/75">
          {e.intro}
        </p>
        <a
          data-reveal
          href={e.calendarHref}
          target="_blank"
          rel="noopener"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-sun-500 px-6 font-semibold text-teal-700 transition hover:bg-sun-300"
        >
          <CalendarDays className="size-4" aria-hidden="true" /> Events calendar
          <span className="sr-only">(convention center calendar on wildwoodsnj.com, opens in a new tab)</span>
        </a>
      </div>
      <div>
        <ol className="flex flex-col gap-3">
          {e.list.map((ev) => {
            const d = new Date(`${ev.date}T00:00:00Z`);
            return (
              <li key={ev.href} data-reveal>
                <a
                  href={ev.href}
                  target="_blank"
                  rel="noopener"
                  className={cn(
                    "group flex items-center gap-4 rounded-[1.5rem] bg-white p-3 pr-5 ring-1 ring-teal-500/8 transition hover:shadow-soft",
                    ev.cancelled && "opacity-70",
                  )}
                >
                  <span className="w-16 shrink-0 overflow-hidden rounded-2xl text-center ring-1 ring-teal-500/10">
                    <span className="block bg-coral-500 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">{MONTH.format(d)}</span>
                    <span className="display block py-1.5 text-3xl text-teal-600">{DAY.format(d)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={cn("font-display text-lg font-bold leading-tight text-teal-600 group-hover:text-coral-600", ev.cancelled && "line-through decoration-ink/30")}>
                        {ev.title}
                      </span>
                      {ev.cancelled && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-ink/70">Cancelled</span>}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink/60">{WEEKDAY.format(d)} · Wildwoods Convention Center</span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-ocean-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  <span className="sr-only">(opens wildwoodsnj.com in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-ink/55">
          As listed on wildwoodsnj.com on {e.asOf}. Dates can change, so check the official calendar before you travel.
        </p>
      </div>
    </div>
  );
}

function CallUs() {
  return (
    <div data-reveal className="relative mt-20 overflow-hidden rounded-[2.5rem] bg-sun-500 px-6 py-12 text-teal-700 sm:px-10 md:mt-28 md:py-14">
      <svg aria-hidden="true" viewBox="0 0 800 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full opacity-30">
        <path d="M0 60c90-40 170-40 260 0s170 40 260 0 170-40 280-6v66H0z" fill="#F47B20" />
      </svg>
      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="eyebrow text-teal-700/80">Planning a meeting or event?</p>
          <p className="display mt-3 text-[clamp(2rem,4.5vw,3.5rem)]">Give us a ring.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`tel:+1${conventionCenter.phone.replace(/\D/g, "")}`}
            className="inline-flex h-14 items-center gap-2 rounded-full bg-teal-600 px-7 text-lg font-bold text-white transition hover:bg-teal-700"
          >
            <Phone className="size-5" aria-hidden="true" /> {conventionCenter.phone}
          </a>
          <a
            href={conventionCenter.cards[0].href}
            target="_blank"
            rel="noopener"
            className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 font-semibold text-teal-600 transition hover:bg-cream"
          >
            Plan a meeting or event <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">(opens wildwoodsnj.com in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
