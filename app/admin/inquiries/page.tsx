import type { Metadata } from "next";
import { InquiriesPage } from "@/components/admin/pages/InquiriesPage";

export const metadata: Metadata = { title: "Inquiries & Leads" };

export default function Page() {
  return <InquiriesPage />;
}
