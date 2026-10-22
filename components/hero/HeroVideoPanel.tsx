"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type ConnectionInfo = { saveData?: boolean };

/**
 * Decorative background video with a poster-first, fail-safe strategy:
 * the poster image is always rendered underneath, the video fades in once it
 * can play, and errors / Data Saver fall back to the poster alone. The file is
 * only requested once the panel nears the viewport, and playback pauses while
 * it's off-screen.
 */
export function HeroVideoPanel({
  src,
  mobileSrc,
  poster,
  paused,
  className,
}: {
  src: string;
  /** Lighter file for small screens, which only show a centre crop anyway. */
  mobileSrc?: string;
  poster: string;
  paused: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [failed, setFailed] = useState(false);
  const small = useMediaQuery("(max-width: 767px)");
  const file = small && mobileSrc ? mobileSrc : src;
  const saveData = useSyncExternalStore(
    () => () => {},
    () => Boolean((navigator as Navigator & { connection?: ConnectionInfo }).connection?.saveData),
    () => false,
  );

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (paused || !onScreen) {
      v.pause();
    } else {
      v.play().catch(() => {
        /* Autoplay can be blocked (e.g. Low Power Mode); the poster stays visible. */
      });
    }
  }, [paused, ready, onScreen]);

  return (
    <div ref={wrap} className={cn("absolute inset-0", className)} aria-hidden="true">
      <Image src={poster} alt="" fill preload sizes="100vw" className="object-cover" />
      {near && !failed && !saveData && (
        <video
          ref={video}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-1000",
            ready ? "opacity-100" : "opacity-0",
          )}
          src={file}
          poster={poster}
          autoPlay={!paused}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
