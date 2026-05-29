"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
};

export function Reveal({ children, delay = 0, className, once = true }: RevealProps) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.setAttribute("data-reveal", "visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.setAttribute("data-reveal", "");
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [node, once]);

  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div ref={setRef} data-reveal="" style={style} className={className}>
      {children}
    </div>
  );
}
