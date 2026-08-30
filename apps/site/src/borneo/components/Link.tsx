"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { withBasePath } from "@borneo/lib/base-path";

type LinkProps = ComponentProps<typeof NextLink>;

/** Internal Borneo routes — prefix with /borneo (standalone app used next.config basePath). */
export function resolveBorneoHref(href: LinkProps["href"]): LinkProps["href"] {
  if (typeof href === "string") {
    if (
      href.startsWith("http") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return href;
    }
    return withBasePath(href);
  }

  if (typeof href === "object" && href !== null && "pathname" in href && href.pathname) {
    return { ...href, pathname: withBasePath(href.pathname) };
  }

  return href;
}

export default function Link({ href, ...props }: LinkProps) {
  return <NextLink href={resolveBorneoHref(href)} {...props} />;
}
