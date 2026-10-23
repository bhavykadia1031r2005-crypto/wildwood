import type { Metadata } from "next";
import { MapPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Map & places" };

export default function Page() {
  return <MapPage />;
}
