import type { Metadata } from "next";
import { ReportsPage } from "@/components/admin/pages/ReportsPage";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsPage />;
}
