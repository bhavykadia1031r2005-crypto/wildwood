import { Navbar } from "@/components/navigation/Navbar";
import { VideoHero } from "@/components/hero/VideoHero";
import { ItineraryBuilder } from "@/components/itinerary/ItineraryBuilder";
import { ExploreByArea } from "@/components/explore/ExploreByArea";
import { StaysSection } from "@/components/stays/StaysSection";
import { MoreToExplore } from "@/components/gallery/MoreToExplore";
import { PhotoStripGuide } from "@/components/gallery/PhotoStripGuide";
import { DestinationCTA } from "@/components/cta/DestinationCTA";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      {/* 1 — Floating navigation */}
      <Navbar />
      <main id="main">
        {/* 2 — Cinematic video hero with events calendar */}
        <VideoHero />
        {/* 3 — Customize your itinerary */}
        <ItineraryBuilder />
        {/* 4 — Explore by area: map, 2D, 360° */}
        <ExploreByArea />
        {/* 5 — More to explore */}
        <MoreToExplore />
        {/* 6 — Places to stay */}
        <StaysSection />
        {/* 7 — Photo strip + QR pocket guide */}
        <PhotoStripGuide />
        {/* 8 — Destination CTA */}
        <DestinationCTA />
      </main>
      {/* 9 — Footer */}
      <Footer />
    </>
  );
}
