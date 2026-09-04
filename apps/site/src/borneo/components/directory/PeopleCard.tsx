import Image from "next/image";
import type { ReactNode } from "react";
import Link from "@borneo/components/Link";
import { SocialIcon } from "@borneo/components/ui/social-icons";

export type PeopleCardSocialLinks = {
  twitter?: string | null;
  linkedin?: string | null;
  telegram?: string | null;
  email?: string | null;
};

export type PeopleCardProps = {
  id?: string;
  name: string;
  avatarUrl?: string | null;
  initials: string;
  subtitleLines?: ReactNode[];
  badge?: string | null;
  social: PeopleCardSocialLinks;
};

function CardRule() {
  return (
    <div className="people-card__rule" aria-hidden="true">
      <span className="people-card__rule-dot" />
      <span className="people-card__rule-line" />
      <span className="people-card__rule-dot" />
    </div>
  );
}

export function PeopleCard({
  id,
  name,
  avatarUrl,
  initials,
  subtitleLines = [],
  badge = null,
  social,
}: PeopleCardProps) {
  const displayName = name.trim().toUpperCase();
  const subtitles = subtitleLines.filter(Boolean);

  return (
    <article className="people-card" id={id}>
      <div className="people-card__inner">
        <div className="people-card__noise" aria-hidden="true" />

        <header className="people-card__header">
          <Image
            src="/superteam.svg"
            alt="Superteam Malaysia"
            width={156}
            height={24}
            className="people-card__logo"
          />
          {badge ? <span className="people-card__badge">{badge}</span> : null}
        </header>

        <CardRule />

        <div className="people-card__photo-wrap">
          <div className="people-card__photo">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" loading="lazy" decoding="async" className="people-card__photo-img" />
            ) : (
              <div className="people-card__photo-fallback" aria-hidden="true">
                {initials}
              </div>
            )}
          </div>
        </div>

        <h2 className="people-card__name">{displayName}</h2>

        {subtitles.length > 0 ? (
          <div className="people-card__subtitle">
            {subtitles.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ) : null}

        <CardRule />

        <div className="people-card__socials">
          {social.twitter ? (
            <Link
              href={social.twitter}
              className="people-card__social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <SocialIcon name="twitter" width={16} height={16} />
            </Link>
          ) : null}
          {social.linkedin ? (
            <Link
              href={social.linkedin}
              className="people-card__social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <SocialIcon name="linkedin" width={16} height={16} />
            </Link>
          ) : null}
          {social.telegram ? (
            <Link
              href={social.telegram}
              className="people-card__social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <SocialIcon name="telegram" width={16} height={16} />
            </Link>
          ) : null}
          {social.email ? (
            <Link href={social.email} className="people-card__social-link" aria-label="Email">
              <SocialIcon name="email" width={16} height={16} />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
