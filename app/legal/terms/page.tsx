import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/layout/LegalPlaceholder";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return <LegalPlaceholder title="Terms of Use" />;
}
