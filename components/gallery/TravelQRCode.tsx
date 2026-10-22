"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ScanLine, Smartphone } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useOrigin } from "@/lib/hooks";

/** Resolves the QR destination: explicit target → configured site URL → current origin. */
function useQrTarget() {
  const origin = useOrigin();
  if (siteConfig.qrTarget) return siteConfig.qrTarget;
  const base = siteConfig.url || origin;
  return base ? `${base.replace(/\/$/, "")}${siteConfig.guidePath}` : null;
}

export function TravelQRCode() {
  const target = useQrTarget();
  const [copied, setCopied] = useState(false);
  const isLocal = target ? /\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(target) : false;

  const copy = async () => {
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard unavailable; the link remains visible and selectable. */
    }
  };

  return (
    <div
      data-reveal
      className="relative mt-24 overflow-hidden rounded-[2.5rem] bg-teal-500 text-white md:mt-32"
      aria-labelledby="qr-title"
      role="region"
    >
      <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-linear-to-b from-sun-500 to-orange-500 opacity-95 md:right-[12%]" />
      <svg aria-hidden="true" viewBox="0 0 800 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-24 w-full">
        <path d="M0 60c90-40 170-40 260 0s170 40 260 0 170-40 280-6v66H0z" fill="#12B9D0" opacity="0.55" />
        <path d="M0 88c100-30 180-28 270 2s170 30 260 0 170-28 270 0v30H0z" fill="#087D9C" />
      </svg>

      <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 md:grid-cols-[minmax(0,1fr)_auto] md:px-14 md:py-16">
        <div className="max-w-xl">
          <p className="eyebrow flex items-center gap-2 text-sun-400">
            <Smartphone className="size-4" aria-hidden="true" /> Take Wildwoods with you
          </p>
          <h3 id="qr-title" className="display mt-4 text-[clamp(2.6rem,6vw,5rem)]">
            Your pocket <span className="display-accent text-sun-400">guide</span> to the island.
          </h3>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Scan the code to open our mobile visitor guide — areas, beach essentials and the best photo
            spots, ready on your phone. No app, no sign-up.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {target ? (
              <>
                <a
                  href={target}
                  className="inline-flex h-12 max-w-full items-center truncate rounded-full bg-white px-5 font-semibold text-teal-600 underline-offset-4 hover:underline"
                >
                  {target.replace(/^https?:\/\//, "")}
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white hover:text-teal-600"
                >
                  {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
                </button>
              </>
            ) : (
              <span className="h-12 w-64 animate-pulse rounded-full bg-white/20" />
            )}
          </div>
          {isLocal && (
            <p className="mt-4 text-xs text-white/60">
              Preview mode: this code points to a local address. Set <code>NEXT_PUBLIC_SITE_URL</code> so phones can open it.
            </p>
          )}
        </div>

        <figure className="relative mx-auto w-fit rotate-[-3deg] rounded-[2rem] bg-white p-5 pb-4 text-center text-teal-600 shadow-lift transition-transform duration-500 hover:rotate-0">
          <div className="rounded-2xl bg-white p-1 ring-4 ring-sun-500">
            {target ? (
              <QRCodeSVG
                value={target}
                size={200}
                level="M"
                marginSize={2}
                fgColor="#0A3B46"
                bgColor="#FFFFFF"
                title={`QR code linking to ${target}`}
                className="block h-auto w-[180px] sm:w-[200px]"
              />
            ) : (
              <div className="size-[180px] animate-pulse rounded-xl bg-teal-50 sm:size-[200px]" />
            )}
          </div>
          <figcaption className="mt-3 flex items-center justify-center gap-1.5 font-display text-sm font-bold uppercase tracking-wider">
            <ScanLine className="size-4 text-coral-500" aria-hidden="true" />
            Scan to Explore on Your Phone
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
