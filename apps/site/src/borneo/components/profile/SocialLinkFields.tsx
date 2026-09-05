"use client";

import type { ProfileFormValues } from "@borneo/lib/profile/form";

type SocialLinkFieldsProps = {
  values: ProfileFormValues;
  onChange: (field: keyof ProfileFormValues, value: string) => void;
};

const FIELDS: {
  key: keyof ProfileFormValues;
  label: string;
  placeholder: string;
}[] = [
  { key: "twitterUrl", label: "X (Twitter)", placeholder: "@handle or https://x.com/…" },
  { key: "instagramUrl", label: "Instagram", placeholder: "@handle or https://instagram.com/…" },
  { key: "githubUrl", label: "GitHub", placeholder: "username or https://github.com/…" },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "profile slug or full URL" },
  { key: "websiteUrl", label: "Website", placeholder: "https://yoursite.com" },
];

export function SocialLinkFields({ values, onChange }: SocialLinkFieldsProps) {
  return (
    <fieldset className="profile-form__social">
      <legend className="team-form__label">Social links</legend>
      <p className="profile-form__social-hint">
        Shown on your builder card in Teams &amp; Mentors — and on your team page.
      </p>
      <div className="profile-form__social-grid">
        {FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="team-form__field">
            <span className="team-form__label">{label}</span>
            <input
              type="text"
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="team-form__input"
              placeholder={placeholder}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
