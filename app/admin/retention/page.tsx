import type { Metadata } from "next";
import { RetentionPage } from "@/components/admin/pages/RetentionPage";

export const metadata: Metadata = { title: "Customer Retention" };

export default function Page() {
  return <RetentionPage />;
}
