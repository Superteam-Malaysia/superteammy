"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const MEMBER_CARD_WIDTH = 320;
const FALLBACK_CARD_HEIGHT = 470;

export function ScalableCardWrapper({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    const updateScale = () => {
      const width = wrapper.offsetWidth;
      const nextScale = Math.min(1, width / MEMBER_CARD_WIDTH);
      setScale(nextScale);
      // Reserve space for the scaled card — fixed aspect ratio is too short for team cards.
      setScaledHeight(inner.offsetHeight * nextScale);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(wrapper);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={
        scaledHeight != null
          ? { height: scaledHeight }
          : { aspectRatio: `${MEMBER_CARD_WIDTH}/${FALLBACK_CARD_HEIGHT}` }
      }
    >
      <div
        ref={innerRef}
        className="absolute left-1/2 top-0 w-[320px] origin-top"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
