import type { Metadata } from "next";
import { CohortsPage } from "@/components/admin/pages/CohortsPage";

export const metadata: Metadata = { title: "Cohort Analysis" };

export default function Page() {
  return <CohortsPage />;
}
