"use client";

import { useEffect, useState } from "react";

/**
 * Matches a media query, or null until the client has measured.
 *
 * Callers render nothing while it is null. That is deliberate: the point of
 * this hook is to mount ONE breakpoint's markup instead of both, so it must
 * not guess a default and build the wrong one first.
 *
 * Tailwind's `hidden lg:block` / `block lg:hidden` pair looks like it does the
 * same job, but display:none only skips painting -- React still mounts every
 * node and the browser still fetches every <img> inside it.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

/** Tailwind `md` — the breakpoint the member marquee switches on. */
export const MD_QUERY = "(min-width: 768px)";
/** Tailwind `lg` — the breakpoint the section backgrounds switch on. */
export const LG_QUERY = "(min-width: 1024px)";
