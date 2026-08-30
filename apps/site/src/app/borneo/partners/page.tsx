import { PartnerLogoWall } from "@borneo/components/partners";
import { SectionArticle } from "@borneo/components/ui";
import { PageHeader } from "@borneo/components/shell";
import {
  ANCHOR_PARTNERS,
  PENDING_PARTNERS,
  SUPPORTING_PARTNERS,
} from "@borneo/data/partners";

export const metadata = { title: "Partners" };

export default function PartnersPage() {
  return (
    <main className="site-main">
      <PageHeader
        title="Partners"
        lead="Partners not on stage receive logo placement and office hours access (BESarawak, TankDAO, RedotPay)."
      />
      <SectionArticle>
        <PartnerLogoWall
          anchors={ANCHOR_PARTNERS}
          supporting={SUPPORTING_PARTNERS}
          pending={PENDING_PARTNERS}
        />
      </SectionArticle>
    </main>
  );
}
