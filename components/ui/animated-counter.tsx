"use client";

import { useCallback, useEffect, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const hasIO = typeof window !== "undefined" && typeof IntersectionObserver !== "undefined";

export function AnimatedCounter({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState<number>(() => (hasIO ? 0 : value));
  const [node, setNode] = useState<HTMLSpanElement | null>(null);

  const setRef = useCallback((el: HTMLSpanElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const startTime = performance.now();
            const tick = (now: number) => {
              if (cancelled) return;
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay(Math.round(value * eased));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [node, value, duration]);

  return (
    <span ref={setRef} className={className}>
      {prefix}
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}
