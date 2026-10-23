import type { Metadata } from "next";
import { StaysPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Places to stay" };

export default function Page() {
  return <StaysPage />;
}
