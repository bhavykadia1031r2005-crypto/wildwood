import Image from "next/image";
import { siteConfig } from "@/lib/site";

const ALT = `${siteConfig.name}, ${siteConfig.region}`;

/**
 * Official Wildwoods logo. `tone="light"` is for dark backgrounds (teal nav,
 * footer); `tone="dark"` shows the original artwork for light backgrounds.
 */
export function Logo({ tone = "light", className, preload }: { tone?: "light" | "dark"; className?: string; preload?: boolean }) {
  const { logo } = siteConfig;
  return (
    <Image
      src={tone === "light" ? logo.lightSrc : logo.src}
      alt={ALT}
      width={logo.width}
      height={logo.height}
      preload={preload}
      className={className ?? "h-11 w-auto"}
    />
  );
}

/** Square sun-and-wave "W" mark from the logo, for avatars and collapsed navigation. */
export function LogoMark({ className }: { className?: string }) {
  return <Image src={siteConfig.logo.mark} alt="" width={96} height={96} className={className} />;
}
