"use client";
import { useEffect, useRef, useState } from "react";
import { fallbackArt } from "@/lib/fallback-art";
import { cn } from "@/lib/format";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  /** Category or product name — chooses the silhouette if the photo can't load. */
  fallbackKey?: string;
  tone?: string;
  eager?: boolean;
};

/** Image with a soft fade-in, a skeleton while loading and a designed fallback if the photo fails. */
export function SmartImage({ src, alt, className, fallbackKey, tone, eager }: Props) {
  const [failed, setFailed] = useState(!src);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(!src);
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (el?.complete) {
      if (el.naturalWidth > 0) setLoaded(true);
      else if (src) setFailed(true);
    }
  }, [src, failed]);

  const finalSrc = failed ? fallbackArt(fallbackKey || alt, tone) : src;

  return (
    <img
      ref={ref}
      src={finalSrc}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!failed) setFailed(true);
      }}
      className={cn("transition-[opacity,transform] duration-700", loaded || failed ? "opacity-100" : "opacity-0", className)}
      draggable={false}
    />
  );
}
