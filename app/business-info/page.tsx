import type { Metadata } from "next";
import { BusinessHero, BusinessInfoSection, ConventionSection } from "@/components/business/BusinessPage";
import { BusinessSwitcher } from "@/components/business/BusinessSwitcher";
import { Footer } from "@/components/footer/Footer";
import { Navbar } from "@/components/navigation/Navbar";

export const metadata: Metadata = {
  title: "Business Info & Convention Center",
  description:
    "Marketing partner perks for Wildwoods businesses, plus the 260,000-square-foot Wildwoods Convention Center on the boardwalk: planning, attending, accommodations and upcoming events.",
};

/** One page with two parts: Business Info first, then the Convention Center. */
export default function BusinessInfoPage() {
  return (
    <>
      <Navbar overHero={false} />
      <main id="main">
        <BusinessHero />
        <BusinessInfoSection />
        <ConventionSection />
        <BusinessSwitcher />
      </main>
      <Footer />
    </>
  );
}
