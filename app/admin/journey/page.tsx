import type { Metadata } from "next";
import { JourneyPage } from "@/components/admin/pages/JourneyPage";

export const metadata: Metadata = { title: "Customer Journey" };

export default function Page() {
  return <JourneyPage />;
}
