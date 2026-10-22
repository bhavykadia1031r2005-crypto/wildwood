import type { Metadata } from "next";
import { ServicesPage } from "@/components/admin/pages/ServicesPage";

export const metadata: Metadata = { title: "Service Analytics" };

export default function Page() {
  return <ServicesPage />;
}
