"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const MEMBER_CARD_WIDTH = 320;

export function ScalableCardWrapper({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.offsetWidth;
      setScale(Math.min(1, width / MEMBER_CARD_WIDTH));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ aspectRatio: `${MEMBER_CARD_WIDTH}/470` }}
    >
      <div
        className="absolute left-1/2 top-0 w-[320px] origin-top"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
