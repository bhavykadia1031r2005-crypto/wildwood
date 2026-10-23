import type { Metadata } from "next";
import { TripPlannerPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Trip planner" };

export default function Page() {
  return <TripPlannerPage />;
}
