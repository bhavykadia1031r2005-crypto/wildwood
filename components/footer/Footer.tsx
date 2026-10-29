"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/animation/Reveal";
import { useCms } from "@/lib/cms/store";
import { legalHref, siteConfig } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";
import { SocialIcons } from "./SocialIcons";

/** Remounts when the footer copy changes so the scroll reveal starts from fresh elements. */
export function Footer() {
  const { rev } = useCms();
  return <FooterContent key={rev.footer ?? 0} />;
}

function FooterContent() {
  const { blurb, newsletterTitle, columns } = useCms().content.footer;
  const { contact } = siteConfig;
  const hasContact = Boolean(contact.email || contact.phone || contact.address);

  return (
    <footer className="relative overflow-hidden bg-teal-600 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <Reveal className="mx-auto max-w-[1320px] px-5 pb-10 pt-16 sm:px-8 md:pt-20">
        <div
          className="grid grid-cols-1 gap-12 lg:grid-cols-[var(--footer-cols)] lg:gap-10"
          style={{
            "--footer-cols":
              columns.length === 3 ? "1.25fr 0.8fr 1fr 0.85fr 1.45fr" : `1.25fr repeat(${columns.length}, minmax(0, 0.9fr)) 1.45fr`,
          } as CSSProperties}
        >
          <div data-reveal className="flex flex-col gap-6">
            <Logo tone="light" className="h-16 w-auto self-start" />
            {blurb && <p className="max-w-xs leading-relaxed text-white/75">{blurb}</p>}
            <SocialIcons />
          </div>

          {columns.map((col) => (
            <nav key={col.id} data-reveal aria-label={col.title}>
              <p className="eyebrow mb-5 text-[0.68rem] text-turquoise-300">{col.title}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.id}>
                    <Link href={l.href} className="group inline-flex items-center text-white/85 transition-colors hover:text-sun-400">
                      <span className="h-px w-0 bg-sun-400 transition-all duration-300 group-hover:mr-2 group-hover:w-3" aria-hidden="true" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div data-reveal>
            <p className="eyebrow mb-5 text-[0.68rem] text-turquoise-300">Newsletter</p>
            <p className="mb-5 font-display text-2xl font-bold leading-tight">{newsletterTitle}</p>
            <NewsletterForm />
          </div>
        </div>

        {hasContact && (
          <address data-reveal className="mt-14 flex flex-wrap gap-x-8 gap-y-3 not-italic text-white/80">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:text-sun-400">
                <Mail className="size-4" aria-hidden="true" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 hover:text-sun-400">
                <Phone className="size-4" aria-hidden="true" /> {contact.phone}
              </a>
            )}
            {contact.address && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" /> {contact.address}
              </span>
            )}
          </address>
        )}

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/15 pt-8 text-sm text-white/65 md:flex-row md:items-center">
          <p>
            © {siteConfig.buildYear} {siteConfig.name}, {siteConfig.region}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <Link href={legalHref("privacy")} className="hover:text-white">Privacy Policy</Link>
            </li>
            <li>
              <Link href={legalHref("terms")} className="hover:text-white">Terms of Use</Link>
            </li>
            <li>
              <Link href={legalHref("accessibility")} className="hover:text-white">Accessibility</Link>
            </li>
            <li>
              <Link href="/credits" className="hover:text-white">Photo Credits</Link>
            </li>
            <li>
              <a
                href="#top"
                className="inline-flex items-center gap-2 rounded-full bg-sun-500 px-4 py-2 font-semibold text-teal-700 transition hover:bg-sun-300"
              >
                <ArrowUp className="size-4" aria-hidden="true" /> Back to top
              </a>
            </li>
          </ul>
        </div>
      </Reveal>
    </footer>
  );
}
