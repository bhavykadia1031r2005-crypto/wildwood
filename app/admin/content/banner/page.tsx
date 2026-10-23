import type { Metadata } from "next";
import { BannerPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Closing banner" };

export default function Page() {
  return <BannerPage />;
}
