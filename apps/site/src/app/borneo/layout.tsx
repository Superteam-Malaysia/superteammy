import type { Metadata } from "next";
import "./globals.css";
import { HalftoneShell } from "@borneo/components/halftone";
import { SiteNav } from "@borneo/components/shell/SiteNav";
import { SiteFooter } from "@borneo/components/shell/SiteFooter";
import { ScrollToTop } from "@borneo/components/shell/ScrollToTop";
import { navAuthLink } from "@borneo/lib/auth/nav-auth-link";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { rootMetadata } from "@borneo/lib/metadata";

export const metadata: Metadata = rootMetadata;

export default async function BorneoLayout({ children }: { children: React.ReactNode }) {
  const participant = await getParticipantForSession();
  const authLink = navAuthLink(participant);

  return (
    <div className="borneo-root min-h-full flex flex-col text-[var(--color-wisp)] antialiased">
      <HalftoneShell>
        <ScrollToTop />
        <SiteNav authLink={authLink} />
        <div className="site-content flex-1">{children}</div>
        <SiteFooter />
      </HalftoneShell>
    </div>
  );
}
