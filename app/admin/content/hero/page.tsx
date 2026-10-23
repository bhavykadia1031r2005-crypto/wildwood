import type { Metadata } from "next";
import { HeroPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Hero & events" };

export default function Page() {
  return <HeroPage />;
}
