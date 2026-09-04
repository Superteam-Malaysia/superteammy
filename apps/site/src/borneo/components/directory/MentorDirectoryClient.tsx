"use client";

import { MemberProfileCard } from "@/components/members/MemberProfileCard";
import { ScalableCardWrapper } from "@/components/members/ScalableCardWrapper";
import type { PublicMentor } from "@borneo/data/mentors";
import { mentorToProfile } from "@borneo/lib/directory/to-profile-card";

export function MentorDirectoryClient({ mentors }: { mentors: PublicMentor[] }) {
  return (
    <div className="builder-directory">
      <ul className="builder-directory__grid">
        {mentors.map((mentor, index) => (
          <li key={mentor.id}>
            <ScalableCardWrapper>
              <MemberProfileCard profile={mentorToProfile(mentor)} index={index} expandOnClick />
            </ScalableCardWrapper>
          </li>
        ))}
      </ul>
    </div>
  );
}
