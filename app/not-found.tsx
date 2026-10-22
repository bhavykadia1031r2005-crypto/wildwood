import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

export default function NotFound() {
  return (
    <PageShell
      eyebrow="404"
      title={
        <>
          Washed <span className="display-accent text-sun-400">out to sea.</span>
        </>
      }
      intro="We couldn't find that page. Let's get you back to the boardwalk."
    >
      <Link href="/" className="inline-flex h-14 items-center rounded-full bg-teal-500 px-7 font-semibold text-white hover:bg-teal-600">
        Back to the homepage
      </Link>
    </PageShell>
  );
}
