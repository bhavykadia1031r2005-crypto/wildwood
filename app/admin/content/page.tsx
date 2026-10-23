import type { Metadata } from "next";
import { LayoutPage } from "@/components/admin/content/pages/LayoutPage";

export const metadata: Metadata = { title: "Homepage layout" };

export default function Page() {
  return <LayoutPage />;
}
