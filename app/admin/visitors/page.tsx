import type { Metadata } from "next";
import { VisitorsPage } from "@/components/admin/pages/VisitorsPage";

export const metadata: Metadata = { title: "Visitors & Traffic" };

export default function Page() {
  return <VisitorsPage />;
}
