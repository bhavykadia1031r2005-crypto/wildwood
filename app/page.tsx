import { Navbar } from "@/components/navigation/Navbar";
import { SplitVideoHero } from "@/components/hero/SplitVideoHero";
import { ItineraryBuilder } from "@/components/itinerary/ItineraryBuilder";
import { ExploreByArea } from "@/components/explore/ExploreByArea";
import { StaysSection } from "@/components/stays/StaysSection";
import { PhotographyGallery } from "@/components/gallery/PhotographyGallery";
import { DestinationCTA } from "@/components/cta/DestinationCTA";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      {/* 1 — Floating navigation */}
      <Navbar />
      <main id="main">
        {/* 2 — Cinematic dual-video hero */}
        <SplitVideoHero />
        {/* 3 — Customize your itinerary */}
        <ItineraryBuilder />
        {/* 4 — Explore by area: map, 2D, 360° */}
        <ExploreByArea />
        {/* 5 — Places to stay */}
        <StaysSection />
        {/* 6 — Photogenic places + QR */}
        <PhotographyGallery />
        {/* 7 — Destination CTA */}
        <DestinationCTA />
      </main>
      {/* 8 — Footer */}
      <Footer />
    </>
  );
}
