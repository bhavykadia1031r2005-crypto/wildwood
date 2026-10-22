import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/layout/LegalPlaceholder";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <LegalPlaceholder title="Accessibility Statement">
      <p>
        This site is designed to be usable by everyone. Navigation, menus, dialogs, filters and the photo viewer work
        with a keyboard; interactive elements show a visible focus ring; images carry descriptive alternative text; and
        animation is reduced automatically when your device asks for reduced motion. Background videos can be paused.
      </p>
      <p>
        The interactive map includes a list of places as a keyboard-friendly alternative, and the illustrated map can be
        explored area by area with the keyboard.
      </p>
    </LegalPlaceholder>
  );
}
