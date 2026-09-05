import type { ReactNode } from "react";
import { CtaButton } from "./CtaButton";

type CardTone = "null" | "mint" | "azure";

export type ActionCardProps = {
  title: string;
  description?: string;
  tone?: CardTone;
  aspect?: "square" | "5-4";
  logo?: { src: string; alt: string };
  cta?: { label: string; href?: string; variant?: "byte" | "azure" | "ghost-wisp" | "ghost-null" };
  children?: ReactNode;
};

const toneClass: Record<CardTone, string> = {
  null: "bp-card--null",
  mint: "bp-card--mint",
  azure: "bp-card--azure",
};

/** EL-35 / EL-36 — ticket & action cards from Breakpoint archive. */
export function ActionCard({
  title,
  description,
  tone = "null",
  aspect = "5-4",
  logo,
  cta,
  children,
}: ActionCardProps) {
  return (
    <div
      className={[
        "bp-card",
        aspect === "square" ? "bp-card--square" : "bp-card--5-4",
        toneClass[tone],
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className="bp-card__title">{title}</h3>
      {logo ? (
        <div className="bp-card__logo-wrap">
          <img
            src={logo.src}
            alt={logo.alt}
            className="bp-card__logo"
            width={165}
            height={31}
            decoding="async"
          />
        </div>
      ) : null}
      <div className="mt-auto flex flex-col gap-8">
        {description && <p className="bp-card__description">{description}</p>}
        {children}
        {cta && (
          <CtaButton
            href={cta.href}
            variant={cta.variant ?? "ghost-wisp"}
            size="sm"
            fullWidth
            external={cta.href?.startsWith("http")}
          >
            {cta.label}
          </CtaButton>
        )}
      </div>
    </div>
  );
}
