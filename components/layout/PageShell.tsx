import type { ReactNode } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/footer/Footer";

/** Layout for secondary pages: solid navigation, a teal masthead and the shared footer. */
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar overHero={false} />
      <main id="main">
        <header id="top" className="relative overflow-hidden bg-teal-500 pb-20 pt-40 text-white md:pb-24 md:pt-48">
          <div aria-hidden="true" className="absolute -right-28 top-32 size-80 rounded-full bg-linear-to-b from-sun-500 to-orange-500 opacity-90" />
          <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-cream">
            <path d="M0 50c160-40 320-50 480-20s320 40 480 15 320-45 480-15v50H0z" fill="currentColor" />
          </svg>
          <div className="relative mx-auto max-w-[1100px] px-5 sm:px-8">
            <p className="eyebrow text-sun-400">{eyebrow}</p>
            <h1 className="display mt-4 max-w-[14ch] text-[clamp(3rem,8vw,6.5rem)]">{title}</h1>
            {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">{intro}</p>}
          </div>
        </header>
        <div className="on-light bg-cream pb-24 pt-12 md:pb-32">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl bg-sun-50 p-5 text-sm leading-relaxed text-teal-700 ring-1 ring-sun-300">{children}</p>
  );
}
