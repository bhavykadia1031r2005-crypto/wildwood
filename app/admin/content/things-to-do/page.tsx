import type { Metadata } from "next";
import { ThingsToDoPage } from "@/components/admin/content/pages/SectionPages";

export const metadata: Metadata = { title: "Things to do" };

export default function Page() {
  return <ThingsToDoPage />;
}
