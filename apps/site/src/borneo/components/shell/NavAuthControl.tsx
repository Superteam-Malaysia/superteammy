"use client";

import Link from "@borneo/components/Link";
import { ParticipantAvatar } from "@borneo/components/directory/ParticipantAvatar";
import type { NavAuthLink } from "@borneo/lib/auth/nav-auth-link";

type NavAuthControlProps = {
  authLink: NavAuthLink;
  className?: string;
  mobile?: boolean;
  onClick?: () => void;
};

export function NavAuthControl({ authLink, className, mobile, onClick }: NavAuthControlProps) {
  const signedIn = authLink.href === "/profile";

  if (!signedIn) {
    return (
      <Link href={authLink.href} className={className} onClick={onClick}>
        {authLink.label}
      </Link>
    );
  }

  return (
    <Link
      href={authLink.href}
      className={[
        "site-nav__profile-link",
        mobile ? "site-nav__profile-link--mobile" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${authLink.label} profile`}
      title={authLink.label}
      onClick={onClick}
    >
      <ParticipantAvatar
        avatarUrl={authLink.avatarUrl}
        initials={authLink.initials ?? authLink.label.slice(0, 2).toUpperCase()}
        className="site-nav__profile-avatar"
        photoClassName="site-nav__profile-photo"
      />
    </Link>
  );
}
