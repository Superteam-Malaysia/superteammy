"use client";

import { MemberProfileCard } from "@/components/members/MemberProfileCard";
import { ScalableCardWrapper } from "@/components/members/ScalableCardWrapper";
import type { PublicMentor } from "@borneo/data/mentors";
import { mentorToProfile } from "@borneo/lib/directory/to-profile-card";

export function MentorDirectoryClient({
  mentors,
  expandMentorId,
}: {
  mentors: PublicMentor[];
  expandMentorId?: string | null;
}) {
  if (mentors.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted mb-2">No mentors found</p>
        <p className="text-sm text-muted-dark">Try adjusting your search or filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mentors.map((mentor, index) => (
        <ScalableCardWrapper key={mentor.id}>
          <div id={`mentor-${mentor.id}`}>
            <MemberProfileCard
              profile={mentorToProfile(mentor)}
              index={index}
              expandOnClick
              startExpanded={expandMentorId === mentor.id}
            />
          </div>
        </ScalableCardWrapper>
      ))}
    </div>
  );
}
