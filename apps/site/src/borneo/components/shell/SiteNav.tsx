import Link from "@borneo/components/Link";
import { NAV_LINKS, SITE } from "@borneo/data/site";
import type { NavAuthLink } from "@borneo/lib/auth/nav-auth-link";
import { withBasePath } from "@borneo/lib/base-path";
import { MobileNavMenu } from "./MobileNavMenu";
import { NavAuthControl } from "./NavAuthControl";
import { SiteNavDesktopItem } from "./SiteNavItem";

type SiteNavProps = {
  authLink: NavAuthLink;
};

export function SiteNav({ authLink }: SiteNavProps) {
  return (
    <header className="site-nav">
      <div className="site-nav__bar">
        <Link href="/" className="site-nav__logo">
          <img
            src={withBasePath("/brand/svb-nav-logo.png")}
            alt={SITE.name}
            className="site-nav__logo-mark"
            width={310}
            height={265}
            decoding="async"
          />
        </Link>

        <nav className="site-nav__desktop" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <SiteNavDesktopItem key={link.href} link={link} />
          ))}
        </nav>

        <div className="site-nav__actions">
          <NavAuthControl authLink={authLink} className="site-nav__auth-link" />
          <MobileNavMenu authLink={authLink} />
        </div>
      </div>
    </header>
  );
}
