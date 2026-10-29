"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Accessibility,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blend,
  Bold,
  BookOpenText,
  Brain,
  Check,
  ChevronDown,
  CirclePause,
  Contrast,
  Droplet,
  Droplets,
  Eye,
  Focus,
  Heading,
  ImageOff,
  Keyboard,
  Link as LinkIcon,
  Minus,
  Moon,
  MousePointer2,
  MoveVertical,
  Plus,
  RectangleHorizontal,
  RotateCcw,
  ScanLine,
  Type,
  Volume2,
  WholeWord,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { A11Y_DEFAULTS, resetA11y, setA11y, useA11y, type A11ySettings } from "@/lib/a11y";
import { applyA11ySettings } from "@/lib/a11y-apply";
import { legalHref } from "@/lib/site";
import { cn } from "@/lib/utils";

type Profile = { id: string; name: string; description: string; icon: LucideIcon; settings: Partial<A11ySettings> };

const PROFILES: Profile[] = [
  { id: "seizure", name: "Seizure safe", description: "Stops animations and tones down bright colours", icon: Zap, settings: { stopAnimations: true, saturation: "low" } },
  { id: "vision", name: "Vision impaired", description: "Larger text, stronger contrast and clearer links", icon: Eye, settings: { fontScale: 130, contrast: "high", highlightLinks: true } },
  { id: "adhd", name: "ADHD friendly", description: "A reading mask and no moving content", icon: Focus, settings: { readingMask: true, stopAnimations: true } },
  { id: "dyslexia", name: "Dyslexia friendly", description: "Dyslexia font with roomier letters and lines", icon: BookOpenText, settings: { dyslexiaFont: true, letterSpacing: 1, lineHeight: 1 } },
  { id: "cognitive", name: "Cognitive & learning", description: "Highlighted headings and links, plus a reading guide", icon: Brain, settings: { highlightTitles: true, highlightLinks: true, readingGuide: true } },
  { id: "keyboard", name: "Keyboard navigation", description: "A bold outline around whatever has focus", icon: Keyboard, settings: { highlightFocus: true } },
];

const ALIGN_ORDER: A11ySettings["textAlign"][] = ["", "left", "center", "right"];
const ALIGN_ICON = { "": AlignLeft, left: AlignLeft, center: AlignCenter, right: AlignRight } as const;

const subscribeNoop = () => () => {};
const useIsMac = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
const useSpeechSupported = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => "speechSynthesis" in window,
    () => true,
  );

/**
 * Accessibility menu: a floating button (bottom-left, or Alt/Option + A) that opens a
 * side panel of display and reading adjustments. Settings apply instantly, persist in
 * this browser and are restored before the next page paints.
 */
export function AccessibilityWidget() {
  const pathname = usePathname();
  const settings = useA11y();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const isMac = useIsMac();
  const hidden = pathname.startsWith("/admin");

  // The admin area has no menu button, so visitor settings never apply there
  // (including after client-side navigation between the site and /admin).
  useEffect(() => {
    applyA11ySettings(hidden ? null : settings, document.documentElement);
  }, [hidden, settings]);
  const changed = (Object.keys(A11Y_DEFAULTS) as (keyof A11ySettings)[]).some((k) => settings[k] !== A11Y_DEFAULTS[k]);

  // Alt/Option + A toggles the menu from anywhere.
  useEffect(() => {
    if (hidden) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyA") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hidden]);

  // Move focus into the panel when it opens and back to the button when it closes.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus());
      wasOpen.current = true;
      return () => cancelAnimationFrame(raf);
    }
    if (wasOpen.current) button.current?.focus();
  }, [open]);

  return (
    <>
      <ReadingAids guide={settings.readingGuide} mask={settings.readingMask} />
      <TextToSpeech on={settings.textToSpeech} />
      {!hidden && (
        <>
          <button
            ref={button}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="a11y-panel"
            aria-label={`Accessibility options (${isMac ? "Option" : "Alt"}+A)`}
            title="Accessibility options"
            className="a11y-trigger group fixed bottom-5 left-5 z-[60] grid size-14 place-items-center rounded-full bg-teal-500 text-white shadow-[0_16px_40px_-12px_rgb(4_23_28/0.6)] ring-4 ring-white/70 transition-colors hover:bg-teal-600 sm:bottom-6 sm:left-6"
          >
            <Accessibility className="size-7 transition-transform group-hover:scale-110" strokeWidth={2.2} aria-hidden="true" />
            {changed && <span className="absolute right-0.5 top-0.5 size-3.5 rounded-full bg-sun-500 ring-2 ring-teal-500" aria-hidden="true" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                ref={panel}
                id="a11y-panel"
                role="dialog"
                aria-modal="false"
                aria-labelledby="a11y-title"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setOpen(false);
                  }
                }}
                initial={{ x: "-104%" }}
                animate={{ x: 0 }}
                exit={{ x: "-104%" }}
                transition={{ type: "spring", stiffness: 360, damping: 38 }}
                className="a11y-panel on-light fixed inset-y-0 left-0 z-[96] flex w-full max-w-[440px] flex-col bg-cream font-sans text-ink shadow-[0_0_60px_-10px_rgb(4_23_28/0.45)]"
              >
                <header className="flex items-center gap-3 bg-teal-500 px-5 py-4 text-white">
                  <Accessibility className="size-7 shrink-0 text-sun-400" strokeWidth={2.4} aria-hidden="true" />
                  <h2 id="a11y-title" className="min-w-0 flex-1 font-display text-xl font-bold leading-tight">
                    Accessibility menu <span className="text-sm font-medium text-white/70">({isMac ? "Option" : "Alt"}+A)</span>
                  </h2>
                  <button
                    type="button"
                    onClick={resetA11y}
                    disabled={!changed}
                    aria-label="Reset all accessibility settings"
                    title="Reset all"
                    className="grid size-10 place-items-center rounded-full bg-teal-700 transition hover:bg-teal-800 disabled:opacity-40"
                  >
                    <RotateCcw className="size-[1.1rem]" />
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    aria-label="Close accessibility menu"
                    className="grid size-10 place-items-center rounded-full bg-teal-700 transition hover:bg-teal-800"
                  >
                    <X className="size-5" />
                  </button>
                </header>

                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
                  <Profiles settings={settings} />
                  <Section title="Content adjustments">
                    <FontSizeTile value={settings.fontScale} />
                    <Toggle icon={Heading} label="Highlight titles" on={settings.highlightTitles} onClick={() => setA11y({ highlightTitles: !settings.highlightTitles })} />
                    <Toggle icon={LinkIcon} label="Highlight links" on={settings.highlightLinks} onClick={() => setA11y({ highlightLinks: !settings.highlightLinks })} />
                    <Toggle
                      icon={DyslexiaGlyph}
                      label="Dyslexia font"
                      on={settings.dyslexiaFont}
                      onClick={() => setA11y({ dyslexiaFont: !settings.dyslexiaFont })}
                    />
                    <Levels icon={WholeWord} label="Letter spacing" level={settings.letterSpacing} onChange={(v) => setA11y({ letterSpacing: v })} />
                    <Levels icon={MoveVertical} label="Line height" level={settings.lineHeight} onChange={(v) => setA11y({ lineHeight: v })} />
                    <Toggle icon={Bold} label="Bold text" on={settings.boldText} onClick={() => setA11y({ boldText: !settings.boldText })} />
                    <Toggle
                      icon={ALIGN_ICON[settings.textAlign]}
                      label={settings.textAlign ? `Align ${settings.textAlign}` : "Text align"}
                      on={Boolean(settings.textAlign)}
                      onClick={() => setA11y({ textAlign: ALIGN_ORDER[(ALIGN_ORDER.indexOf(settings.textAlign) + 1) % ALIGN_ORDER.length] })}
                      hint="Tap to cycle left, centre, right, off"
                    />
                  </Section>
                  <Section title="Colour adjustments">
                    <Toggle icon={Contrast} label="High contrast" on={settings.contrast === "high"} onClick={() => setA11y({ contrast: settings.contrast === "high" ? "" : "high" })} />
                    <Toggle icon={Moon} label="Dark contrast" on={settings.contrast === "dark"} onClick={() => setA11y({ contrast: settings.contrast === "dark" ? "" : "dark" })} />
                    <Toggle icon={Blend} label="Monochrome" on={settings.saturation === "mono"} onClick={() => setA11y({ saturation: settings.saturation === "mono" ? "" : "mono" })} />
                    <Toggle icon={Droplet} label="Low saturation" on={settings.saturation === "low"} onClick={() => setA11y({ saturation: settings.saturation === "low" ? "" : "low" })} />
                    <Toggle icon={Droplets} label="High saturation" on={settings.saturation === "high"} onClick={() => setA11y({ saturation: settings.saturation === "high" ? "" : "high" })} />
                  </Section>
                  <Section title="Orientation & reading">
                    <Toggle icon={CirclePause} label="Stop animations" on={settings.stopAnimations} onClick={() => setA11y({ stopAnimations: !settings.stopAnimations })} />
                    <Toggle icon={ImageOff} label="Hide images" on={settings.hideImages} onClick={() => setA11y({ hideImages: !settings.hideImages })} />
                    <Toggle icon={ScanLine} label="Reading guide" on={settings.readingGuide} onClick={() => setA11y({ readingGuide: !settings.readingGuide })} />
                    <Toggle icon={RectangleHorizontal} label="Reading mask" on={settings.readingMask} onClick={() => setA11y({ readingMask: !settings.readingMask })} />
                    <Toggle icon={MousePointer2} label="Big cursor" on={settings.bigCursor} onClick={() => setA11y({ bigCursor: !settings.bigCursor })} />
                    <Toggle icon={Focus} label="Highlight focus" on={settings.highlightFocus} onClick={() => setA11y({ highlightFocus: !settings.highlightFocus })} />
                    <SpeechTile on={settings.textToSpeech} />
                  </Section>
                </div>

                <footer className="border-t border-teal-500/10 bg-white px-5 py-4">
                  <button
                    type="button"
                    onClick={resetA11y}
                    disabled={!changed}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-500 font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" /> Reset all settings
                  </button>
                  <p className="mt-2.5 text-center text-xs leading-relaxed text-ink/60">
                    Saved in this browser.{" "}
                    <Link href={legalHref("accessibility")} className="font-semibold text-ocean-600 underline-offset-2 hover:underline" onClick={() => setOpen(false)}>
                      Accessibility statement
                    </Link>
                  </p>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}

/* ---------- Panel pieces ---------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title}>
      <h3 className="mb-3 font-display text-base font-bold text-teal-700">{title}</h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{children}</div>
    </section>
  );
}

const tileBase =
  "relative flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-2xl bg-white px-2 py-3 text-center text-[0.82rem] font-semibold leading-tight text-ink ring-1 ring-teal-500/10 transition hover:ring-teal-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500";
const tileOn = "bg-teal-50 text-teal-700 ring-2 ring-teal-500 hover:ring-teal-500";

type IconLike = ComponentType<{ className?: string; strokeWidth?: number }>;

/** "Df" set in OpenDyslexic, as the dyslexia-font tile icon. */
function DyslexiaGlyph({ className }: { className?: string }) {
  return (
    <span className={cn(className, "grid place-items-center text-2xl leading-none")} style={{ fontFamily: "OpenDyslexic, sans-serif" }}>
      Df
    </span>
  );
}

function OnBadge({ on }: { on: boolean }) {
  return on ? (
    <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-teal-500 text-white" aria-hidden="true">
      <Check className="size-3" strokeWidth={3} />
    </span>
  ) : null;
}

function Toggle({ icon: Icon, label, on, onClick, hint, disabled }: { icon: IconLike; label: string; on: boolean; onClick: () => void; hint?: string; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} title={hint} disabled={disabled} className={cn(tileBase, on && tileOn, disabled && "cursor-not-allowed opacity-50")}>
      <OnBadge on={on} />
      <span className="grid h-8 place-items-center text-teal-600" aria-hidden="true">
        <Icon className="size-7" strokeWidth={1.8} />
      </span>
      {label}
    </button>
  );
}

function Levels({ icon: Icon, label, level, onChange }: { icon: LucideIcon; label: string; level: number; onChange: (v: number) => void }) {
  return (
    <button
      type="button"
      aria-pressed={level > 0}
      aria-label={`${label}: ${level ? `level ${level} of 2` : "off"}`}
      onClick={() => onChange((level + 1) % 3)}
      title="Tap to cycle"
      className={cn(tileBase, level > 0 && tileOn)}
    >
      <OnBadge on={level > 0} />
      <span className="grid h-8 place-items-center text-teal-600">
        <Icon className="size-7" strokeWidth={1.8} aria-hidden="true" />
      </span>
      {label}
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2].map((n) => (
          <span key={n} className={cn("h-1.5 w-5 rounded-full", level >= n ? "bg-teal-500" : "bg-teal-500/15")} />
        ))}
      </span>
    </button>
  );
}

function FontSizeTile({ value }: { value: number }) {
  const set = (v: number) => setA11y({ fontScale: Math.min(150, Math.max(80, v)) });
  return (
    <div className={cn(tileBase, "col-span-2 gap-3 hover:ring-teal-500/10", value !== 100 && tileOn)} role="group" aria-label="Adjust font size">
      <span className="flex items-center gap-2 text-teal-600">
        <Type className="size-7" strokeWidth={1.8} aria-hidden="true" />
        <span className="text-[0.82rem] font-semibold text-ink">Adjust font size</span>
      </span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(value - 10)}
          disabled={value <= 80}
          aria-label="Decrease font size"
          className="grid size-10 place-items-center rounded-full bg-coral-500 text-white transition hover:bg-coral-600 disabled:opacity-40"
        >
          <Minus className="size-5" />
        </button>
        <output aria-live="polite" className="min-w-20 rounded-full bg-gray-100 px-3 py-2 text-sm font-bold tabular-nums text-coral-700">
          {value}%
        </output>
        <button
          type="button"
          onClick={() => set(value + 10)}
          disabled={value >= 150}
          aria-label="Increase font size"
          className="grid size-10 place-items-center rounded-full bg-coral-500 text-white transition hover:bg-coral-600 disabled:opacity-40"
        >
          <Plus className="size-5" />
        </button>
      </span>
    </div>
  );
}

function SpeechTile({ on }: { on: boolean }) {
  const supported = useSpeechSupported();
  return (
    <Toggle
      icon={Volume2}
      label={supported ? "Text to speech" : "Text to speech (not supported here)"}
      hint="Click any text on the page to hear it read aloud"
      on={on && supported}
      disabled={!supported}
      onClick={() => setA11y({ textToSpeech: !on })}
    />
  );
}

function Profiles({ settings }: { settings: A11ySettings }) {
  const [open, setOpen] = useState(false);
  const isOn = (p: Profile) => (Object.keys(p.settings) as (keyof A11ySettings)[]).every((k) => settings[k] === p.settings[k]);
  const active = PROFILES.filter(isOn).length;
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-teal-500/10">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-4 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-600">
          <Accessibility className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-teal-700">Accessibility profiles</span>
          <span className="block text-xs text-ink/60">{active ? `${active} on` : "One-tap presets for common needs"}</span>
        </span>
        <ChevronDown className={cn("size-5 text-teal-600 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <ul className="divide-y divide-teal-500/10 border-t border-teal-500/10">
          {PROFILES.map((p) => {
            const on = isOn(p);
            return (
              <li key={p.id}>
                <label className="relative flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-teal-50/50">
                  <p.icon className="size-5 shrink-0 text-teal-600" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{p.name}</span>
                    <span className="block text-xs text-ink/60">{p.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={on}
                    onChange={() =>
                      setA11y(
                        on
                          ? Object.fromEntries(Object.keys(p.settings).map((k) => [k, A11Y_DEFAULTS[k as keyof A11ySettings]]))
                          : p.settings,
                      )
                    }
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ocean-500 peer-focus-visible:ring-offset-2",
                      on ? "bg-teal-500" : "bg-gray-300",
                    )}
                  >
                    <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-5" : "translate-x-0")} />
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Page-level behaviours ---------- */

/** A reading line and/or a dimmed mask with a clear band that follow the pointer (or keyboard focus). */
function ReadingAids({ guide, mask }: { guide: boolean; mask: boolean }) {
  const [y, setY] = useState<number | null>(null);
  useEffect(() => {
    if (!guide && !mask) return;
    let raf = 0;
    const at = (next: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(next));
    };
    const onMove = (e: PointerEvent) => at(e.clientY);
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el?.getBoundingClientRect) {
        const r = el.getBoundingClientRect();
        at(r.top + r.height / 2);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("focusin", onFocus);
    };
  }, [guide, mask]);

  if ((!guide && !mask) || y === null) return null;
  const band = 64;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95]">
      {mask && (
        <>
          <div className="absolute inset-x-0 top-0 bg-teal-950/60" style={{ height: Math.max(0, y - band) }} />
          <div className="absolute inset-x-0 bottom-0 bg-teal-950/60" style={{ top: y + band }} />
        </>
      )}
      {guide && (
        <div className="absolute inset-x-0 h-3 border-y-2 border-teal-900 bg-sun-400/90 shadow-[0_0_0_3px_rgb(255_255_255/0.6)]" style={{ top: y + 14 }} />
      )}
    </div>
  );
}

/** Click any text block to hear it read aloud with the browser's built-in speech. */
function TextToSpeech({ on }: { on: boolean }) {
  useEffect(() => {
    if (!on || !("speechSynthesis" in window)) return;
    let current: HTMLElement | null = null;
    const clear = () => {
      current?.classList.remove("a11y-speaking");
      current = null;
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".a11y-panel, .a11y-trigger")) return;
      const el = target.closest<HTMLElement>("p, h1, h2, h3, h4, h5, h6, li, dd, dt, label, blockquote, figcaption, td, th, a, button");
      const text = el?.innerText.replace(/\s+/g, " ").trim().slice(0, 800);
      if (!el || !text) return;
      window.speechSynthesis.cancel();
      clear();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = document.documentElement.lang || "en-US";
      u.onend = clear;
      u.onerror = clear;
      current = el;
      el.classList.add("a11y-speaking");
      window.speechSynthesis.speak(u);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.speechSynthesis.cancel();
      clear();
    };
  }, [on]);
  return null;
}
