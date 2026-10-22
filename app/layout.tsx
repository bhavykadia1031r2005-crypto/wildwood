import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import { ScrollRefresh } from "@/components/animation/ScrollRefresh";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const title = `${siteConfig.name}, ${siteConfig.region} | Beaches, Boardwalk & Summer Escapes`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url || "http://localhost:3000"),
  title: {
    default: title,
    template: `%s | ${siteConfig.name}, NJ`,
  },
  description: siteConfig.description,
  keywords: [
    "Wildwoods",
    "Wildwood NJ",
    "North Wildwood",
    "Wildwood Crest",
    "Jersey Shore",
    "boardwalk",
    "free beaches",
    "Doo Wop",
  ],
  openGraph: {
    type: "website",
    siteName: `${siteConfig.name}, ${siteConfig.region}`,
    title,
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The giant Wildwoods sign and beach balls on the boardwalk plaza under a kite-filled sky",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#105665",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${figtree.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Flags JS support before first paint so intro animations never flash. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-sun-500 px-5 py-3 font-semibold text-teal-700 transition focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
        <ChatWidget />
        <ScrollRefresh />
      </body>
    </html>
  );
}
