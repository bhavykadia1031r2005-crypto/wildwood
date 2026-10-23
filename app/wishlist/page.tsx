import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Places to stay, map spots, things to do and events you've saved for your Wildwoods trip.",
  // Personal, browser-stored content: nothing useful for search engines.
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <PageShell
      eyebrow="Your wishlist"
      title={
        <>
          Saved for your <span className="display-accent text-sun-400">next trip.</span>
        </>
      }
      intro="Everything you've hearted around the site, in one place: stays, spots on the map, things to do and events."
    >
      <Suspense fallback={<div className="h-80 animate-pulse rounded-[2rem] bg-white" aria-busy="true" />}>
        <WishlistView />
      </Suspense>
    </PageShell>
  );
}
