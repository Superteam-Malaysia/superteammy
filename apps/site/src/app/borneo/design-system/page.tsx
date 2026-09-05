import Link from "@borneo/components/Link";
import { BrandLogosPanel } from "@borneo/components/brand";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";

export const metadata = {
  title: "Brand assets",
  description: "Official Startup Village Borneo logos and marks for partners and press.",
};

export default function DesignSystemPage() {
  return (
    <main className="pb-20">
      <div className="max-w-[90rem] mx-auto px-4 md:px-8 pt-12 flex flex-col gap-16">
        <section>
          <SectionIntro title="Brand assets" accent="byte" />
          <p className="mt-6 max-w-2xl text-[var(--color-wisp)]/80 leading-relaxed">
            Official SVB marks for partners and press. Download and use per partner guidelines.
            For programme details, see the{" "}
            <Link href="/" className="text-link-wisp">
              homepage
            </Link>
            .
          </p>
        </section>

        <section id="logos">
          <SectionArticle>
            <BrandLogosPanel />
          </SectionArticle>
        </section>
      </div>
    </main>
  );
}
