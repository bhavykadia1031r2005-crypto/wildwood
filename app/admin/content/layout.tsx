import type { ReactNode } from "react";
import { Toaster } from "@/components/admin/content/Toaster";

export default function ContentLayout({ children }: { children: ReactNode }) {
  return <Toaster>{children}</Toaster>;
}
