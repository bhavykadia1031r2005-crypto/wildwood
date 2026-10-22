import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { allMedia } from "@/data/media";

export const metadata: Metadata = {
  title: "Photo Credits",
  description: "Attribution and licences for the photography used on this site.",
};

export default function CreditsPage() {
  const photos = allMedia.filter((m) => !m.id.startsWith("pano-"));
  return (
    <PageShell
      eyebrow="Photo credits"
      title={
        <>
          With thanks to <span className="display-accent text-sun-400">the photographers.</span>
        </>
      }
      intro="Every image on this site is a real photo of the Wildwoods shared on Wikimedia Commons under the licence listed below."
    >
      <div className="grid gap-4 text-ink/75 md:grid-cols-2">
        <p className="rounded-3xl bg-white p-6 ring-1 ring-teal-500/8">
          <strong className="text-teal-600">Hero video.</strong> The homepage background video was supplied by the
          Wildwoods tourism team.
        </p>
        <p className="rounded-3xl bg-white p-6 ring-1 ring-teal-500/8">
          <strong className="text-teal-600">Panoramas.</strong> Scenes in the 360° viewer are wide crops of standard
          photographs (credited below), not 360° captures. Map data &copy; OpenStreetMap contributors. Icons by Lucide (ISC).
        </p>
        <p className="rounded-3xl bg-white p-6 ring-1 ring-teal-500/8 md:col-span-2">
          <strong className="text-teal-600">More to explore.</strong> The ten category images in the homepage&rsquo;s
          &ldquo;More to explore&rdquo; grid come from the official Wildwoods tourism website,{" "}
          <a href="https://wildwoodsnj.com/" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ocean-600">
            wildwoodsnj.com
          </a>
          .
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((m) => (
          <li key={m.id} className="flex gap-4 rounded-3xl bg-white p-3 ring-1 ring-teal-500/8">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
              <Image src={m.src} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="line-clamp-2 font-semibold text-teal-600">{m.credit.title}</p>
              <p className="mt-1 text-ink/65">{m.credit.author}</p>
              <p className="mt-1 flex flex-wrap gap-x-2 text-ink/55">
                {m.credit.licenseUrl ? (
                  <a href={m.credit.licenseUrl} target="_blank" rel="noreferrer license" className="underline underline-offset-2 hover:text-ocean-600">
                    {m.credit.license}
                  </a>
                ) : (
                  <span>{m.credit.license}</span>
                )}
                <a href={m.credit.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ocean-600">
                  Source
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
