"use client";

import { PeopleCard } from "@borneo/components/directory/PeopleCard";
import { mentorSocialUrls, type PublicMentor } from "@borneo/data/mentors";

function MentorCard({ mentor }: { mentor: PublicMentor }) {
  const subtitleLines: string[] = [];
  if (mentor.organization) subtitleLines.push(mentor.organization);
  if (mentor.isWorkshopLeader && mentor.workshops.length > 0) {
    subtitleLines.push("Workshop leader");
  }
  if (mentor.isJudge && mentor.judgeRole) {
    subtitleLines.push(mentor.judgeRole);
  }

  return (
    <PeopleCard
      name={mentor.name}
      avatarUrl={mentor.avatar}
      initials={mentor.initials}
      subtitleLines={subtitleLines}
      social={mentorSocialUrls(mentor)}
    />
  );
}

export function MentorDirectoryClient({ mentors }: { mentors: PublicMentor[] }) {
  return (
    <div className="builder-directory">
      <ul className="builder-directory__grid">
        {mentors.map((mentor) => (
          <li key={mentor.id}>
            <MentorCard mentor={mentor} />
          </li>
        ))}
      </ul>
    </div>
  );
}
