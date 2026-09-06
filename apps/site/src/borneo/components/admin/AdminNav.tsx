"use client";

import Link from "@borneo/components/Link";
import { withBasePath } from "@borneo/lib/base-path";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/checkin", label: "Check-in" },
  { href: "/admin/submissions", label: "Race" },
  { href: "/admin/redotpay", label: "RedotPay quiz" },
  { href: "/admin/meteora", label: "Meteora wallets" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  const full = withBasePath(href);
  if (exact) return pathname === full || pathname === `${full}/`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Organizer admin">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href, "exact" in link ? link.exact : false);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "admin-nav__link admin-nav__link--active" : "admin-nav__link"}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
