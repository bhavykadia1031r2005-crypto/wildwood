import type { Metadata } from "next";
import { NavigationPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Navigation & footer" };

export default function Page() {
  return <NavigationPage />;
}
