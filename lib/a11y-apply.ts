/**
 * Accessibility menu settings and how they're applied to <html>. Kept free of
 * React and imports so `applyA11ySettings` can also be inlined as a script in
 * <head> (see app/layout.tsx), applying saved settings before the first paint.
 */

export const A11Y_STORAGE_KEY = "wildwoods-a11y";

export type A11ySettings = {
  /** Text size in percent of the default (80–150). */
  fontScale: number;
  highlightTitles: boolean;
  highlightLinks: boolean;
  dyslexiaFont: boolean;
  /** 0 off, 1 wider, 2 widest. */
  letterSpacing: number;
  /** 0 off, 1 taller, 2 tallest. */
  lineHeight: number;
  boldText: boolean;
  textAlign: "" | "left" | "center" | "right";
  contrast: "" | "high" | "dark";
  saturation: "" | "low" | "high" | "mono";
  stopAnimations: boolean;
  hideImages: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  bigCursor: boolean;
  highlightFocus: boolean;
  textToSpeech: boolean;
};

export const A11Y_DEFAULTS: A11ySettings = {
  fontScale: 100,
  highlightTitles: false,
  highlightLinks: false,
  dyslexiaFont: false,
  letterSpacing: 0,
  lineHeight: 0,
  boldText: false,
  textAlign: "",
  contrast: "",
  saturation: "",
  stopAnimations: false,
  hideImages: false,
  readingGuide: false,
  readingMask: false,
  bigCursor: false,
  highlightFocus: false,
  textToSpeech: false,
};

/** Sets the `a11y-*` classes and variables on `root` (styles live in globals.css). Self-contained on purpose. */
export function applyA11ySettings(settings: Partial<A11ySettings> | null, root: HTMLElement) {
  const s = settings || {};
  const cls = root.classList;
  const stale: string[] = [];
  cls.forEach(function (c) {
    if (c.indexOf("a11y-") === 0) stale.push(c);
  });
  stale.forEach(function (c) {
    cls.remove(c);
  });
  root.style.removeProperty("--a11y-font-scale");
  root.style.removeProperty("--a11y-filter");

  if (s.fontScale && s.fontScale !== 100) {
    cls.add("a11y-font");
    root.style.setProperty("--a11y-font-scale", String(Math.min(150, Math.max(80, s.fontScale)) / 100));
  }
  if (s.highlightTitles) cls.add("a11y-titles");
  if (s.highlightLinks) cls.add("a11y-links");
  if (s.dyslexiaFont) cls.add("a11y-dyslexia");
  if (s.letterSpacing) cls.add("a11y-spacing-" + s.letterSpacing);
  if (s.lineHeight) cls.add("a11y-lh-" + s.lineHeight);
  if (s.boldText) cls.add("a11y-bold");
  if (s.textAlign) cls.add("a11y-align-" + s.textAlign);
  if (s.stopAnimations) cls.add("a11y-stop-motion");
  if (s.hideImages) cls.add("a11y-hide-images");
  if (s.bigCursor) cls.add("a11y-big-cursor");
  if (s.highlightFocus) cls.add("a11y-focus");

  const filters: string[] = [];
  if (s.contrast === "high") filters.push("contrast(1.35)");
  if (s.contrast === "dark") {
    cls.add("a11y-invert");
    filters.push("invert(1) hue-rotate(180deg)");
  }
  if (s.saturation === "low") filters.push("saturate(0.45)");
  if (s.saturation === "high") filters.push("saturate(1.7)");
  if (s.saturation === "mono") filters.push("grayscale(1)");
  if (filters.length) {
    cls.add("a11y-filter");
    root.style.setProperty("--a11y-filter", filters.join(" "));
  }
}
