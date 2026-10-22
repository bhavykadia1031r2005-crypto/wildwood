import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Brand lock-up. Renders the official artwork when `siteConfig.logo.src` is set;
 * otherwise a placeholder mark built from the Wildwoods palette (sun over waves).
 */
export function Logo({
  tone = "light",
  className,
  showRegion = true,
}: {
  tone?: "light" | "dark";
  className?: string;
  showRegion?: boolean;
}) {
  const { logo } = siteConfig;

  if (logo.src) {
    return (
      <Image
        src={logo.src}
        alt={`${siteConfig.name}, ${siteConfig.region}`}
        width={logo.width}
        height={logo.height}
        preload
        className={cn("h-11 w-auto", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-10 shrink-0 drop-shadow-sm" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "display text-[1.7rem] tracking-[-0.01em]",
            tone === "light" ? "text-white" : "text-teal-500",
          )}
        >
          Wildwoods
        </span>
        {showRegion && (
          <span
            className={cn(
              "mt-0.5 text-[0.6rem] font-bold uppercase tracking-[0.34em]",
              tone === "light" ? "text-sun-400" : "text-coral-600",
            )}
          >
            New Jersey
          </span>
        )}
      </span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="ww-mark-clip">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <linearGradient id="ww-mark-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD400" />
          <stop offset="0.7" stopColor="#F47B20" />
          <stop offset="1" stopColor="#F15A24" />
        </linearGradient>
      </defs>
      <g clipPath="url(#ww-mark-clip)">
        <rect width="64" height="64" fill="#FFFBE0" />
        <circle cx="32" cy="29" r="15" fill="url(#ww-mark-sun)" />
        <path
          d="M0 37c8-6 14-6 20-2s10 4 16-1 14-5 20 0c4 3 6 3 8 2v28H0z"
          fill="#12B9D0"
        />
        <path d="M0 46c8-5 14-5 21-1s12 4 19-1 14-4 24 1v19H0z" fill="#087D9C" />
        <path d="M0 54c10-4 18-3 26 0s16 3 24-1c6-3 10-3 14-1v12H0z" fill="#105665" />
      </g>
    </svg>
  );
}
