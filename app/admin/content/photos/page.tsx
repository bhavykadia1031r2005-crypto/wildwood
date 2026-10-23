import type { Metadata } from "next";
import { PhotosPage } from "@/components/admin/content/pages/PhotosPage";

export const metadata: Metadata = { title: "Photo strip & QR" };

export default function Page() {
  return <PhotosPage />;
}
