import type { Metadata } from "next";
import { OverviewPage } from "@/components/admin/pages/OverviewPage";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverview() {
  return <OverviewPage />;
}
