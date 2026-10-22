import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const icons = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z" />,
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" />
    </>
  ),
  tiktok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.4 4.6 5 5" />,
} as const;

const labels: Record<keyof typeof icons, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
};

/**
 * Social profile links. Profiles that haven't been configured in `lib/site.ts`
 * render as visibly disabled placeholders rather than guessed URLs.
 */
export function SocialIcons() {
  const entries = Object.keys(icons) as (keyof typeof icons)[];
  const anyMissing = entries.some((k) => !siteConfig.social[k]);
  return (
    <div>
      <ul className="flex gap-2">
        {entries.map((key) => {
          const href = siteConfig.social[key];
          const glyph = (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icons[key]}
            </svg>
          );
          const cls = "grid size-11 place-items-center rounded-full ring-1 ring-inset ring-white/25 transition";
          return (
            <li key={key}>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer me" aria-label={`${siteConfig.name} on ${labels[key]}`} className={cn(cls, "text-white hover:bg-sun-500 hover:text-teal-700 hover:ring-sun-500")}>
                  {glyph}
                </a>
              ) : (
                <span role="img" aria-label={`${labels[key]} link not yet configured`} title={`${labels[key]}: add the official profile URL in lib/site.ts`} className={cn(cls, "cursor-not-allowed text-white/40")}>
                  {glyph}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {anyMissing && <p className="mt-2 text-xs text-white/45">Official social profiles coming soon.</p>}
    </div>
  );
}
