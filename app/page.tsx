import { HomeNavbar, HomeSections } from "@/components/home/HomeSections";
import { Footer } from "@/components/footer/Footer";

/**
 * Sections (in their default order): video hero with events calendar, trip
 * planner, explore by area, more to explore, places to stay, photo strip + QR
 * guide, destination CTA. Order, visibility and copy are editable in the
 * demo content editor at /admin/content.
 */
export default function Home() {
  return (
    <>
      <HomeNavbar />
      <main id="main">
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
