"use client";

import Link from "@borneo/components/Link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BorneoDirectoryFilters,
  DirectorySectionTabs,
} from "@borneo/components/directory/BorneoDirectoryFilters";
import { MentorDirectoryClient } from "@borneo/components/directory/MentorDirectoryClient";
import { ParticipantDirectoryClient } from "@borneo/components/directory/ParticipantDirectoryClient";
import { TeamEcosystemClient } from "@borneo/components/teams/TeamEcosystemClient";
import { CtaButton } from "@borneo/components/ui";
import type { PublicMentor } from "@borneo/lib/mentors/types";
import { getUnassignedBuilders } from "@borneo/lib/participants/unassigned-builders";
import type { PublicParticipant } from "@borneo/lib/participants/types";
import type { PublicTeam } from "@borneo/lib/teams/types";
import { TEAM_CATEGORIES } from "@borneo/lib/teams/types";
import type { DirectoryTab } from "@borneo/lib/directory/tabs";

type DirectoryTabsClientProps = {
  initialTab: DirectoryTab;
  teams: PublicTeam[];
  people: PublicParticipant[];
  mentors: PublicMentor[];
  isSignedIn: boolean;
};

const MENTOR_FILTERS = ["All", "Workshop leaders", "Judges"] as const;

function syncTabUrl(tab: DirectoryTab) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (tab === "teams") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  const next = `${url.pathname}${url.search}`;
  if (`${window.location.pathname}${window.location.search}` !== next) {
    window.history.replaceState(window.history.state, "", next);
  }
}

function scrollToBuilderHash() {
  const hash = window.location.hash;
  if (!hash.startsWith("#builder-")) return;
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function scrollToMentorHash() {
  const hash = window.location.hash;
  if (!hash.startsWith("#mentor-")) return;
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function mentorIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  return hash.startsWith("#mentor-") ? hash.slice("#mentor-".length) : null;
}

function matchesSearch(values: (string | null | undefined)[], query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return values.some((value) => value?.toLowerCase().includes(needle));
}

export function DirectoryTabsClient({
  initialTab,
  teams,
  people,
  mentors,
  isSignedIn,
}: DirectoryTabsClientProps) {
  const [tab, setTabState] = useState<DirectoryTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamCategory, setTeamCategory] = useState("All");
  const [mentorFilter, setMentorFilter] = useState<(typeof MENTOR_FILTERS)[number]>("All");
  const [expandMentorId, setExpandMentorId] = useState<string | null>(null);

  const unassigned = useMemo(() => getUnassignedBuilders(people), [people]);

  const setTab = useCallback((next: DirectoryTab) => {
    setTabState(next);
    setSearchQuery("");
    setTeamCategory("All");
    setMentorFilter("All");
    syncTabUrl(next);
  }, []);

  useEffect(() => {
    syncTabUrl(tab);
  }, [tab]);

  useEffect(() => {
    if (!window.location.hash.startsWith("#builder-")) return;
    setTabState("teams");
    window.requestAnimationFrame(scrollToBuilderHash);
  }, []);

  useEffect(() => {
    const mentorId = mentorIdFromHash();
    if (!mentorId) return;
    setTabState("mentors");
    setMentorFilter("Judges");
    setExpandMentorId(mentorId);
    window.requestAnimationFrame(scrollToMentorHash);
  }, []);

  useEffect(() => {
    if (tab === "teams" && window.location.hash.startsWith("#builder-")) {
      window.requestAnimationFrame(scrollToBuilderHash);
    }
    if (tab === "mentors" && window.location.hash.startsWith("#mentor-")) {
      window.requestAnimationFrame(scrollToMentorHash);
    }
  }, [tab]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesCategory =
        teamCategory === "All" || (team.category ?? "Other") === teamCategory;
      const matchesQuery = matchesSearch(
        [team.name, team.tagline, team.description, team.category],
        searchQuery,
      );
      return matchesCategory && matchesQuery;
    });
  }, [teams, teamCategory, searchQuery]);

  const filteredUnassigned = useMemo(() => {
    return unassigned.filter((person) =>
      matchesSearch(
        [person.name, person.projectIdea, person.teamSetup, ...person.hackathonTeams.map((t) => t.name)],
        searchQuery,
      ),
    );
  }, [unassigned, searchQuery]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesQuery = matchesSearch(
        [
          mentor.name,
          mentor.organization,
          mentor.judgeRole,
          ...mentor.workshops.map((workshop) => workshop.title),
        ],
        searchQuery,
      );
      const matchesRole =
        mentorFilter === "All" ||
        (mentorFilter === "Workshop leaders" && mentor.isWorkshopLeader) ||
        (mentorFilter === "Judges" && mentor.isJudge);
      return matchesQuery && matchesRole;
    });
  }, [mentors, mentorFilter, searchQuery]);

  return (
    <div className="relative pb-8">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/images/member-bg.png')" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:mb-8 mb-6"
        >
          <h1 className="font-[family-name:var(--font-orbitron)] uppercase text-3xl md:text-4xl lg:text-7xl font-black text-white mb-3">
            Teams &amp; Mentors
          </h1>
          <p className="md:text-lg text-[14px] text-white/90 md:max-w-2xl px-4 md:px-0 mx-auto">
            Explore hackathon teams, registered builders, and workshop leaders plus Demo Day judges at
            Startup Village Borneo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="flex flex-wrap items-center justify-between gap-4 md:mb-6 mb-4"
        >
          <DirectorySectionTabs tab={tab} onTabChange={setTab} />
          {tab === "teams" && isSignedIn ? (
            <CtaButton href="/teams/new" variant="byte" size="sm">
              Create team
            </CtaButton>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="md:mb-8 mb-6"
        >
          {tab === "teams" ? (
            <BorneoDirectoryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search teams or builders..."
              filterOptions={[...TEAM_CATEGORIES]}
              activeFilter={teamCategory}
              onFilterChange={setTeamCategory}
            />
          ) : (
            <BorneoDirectoryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search mentors by name, org, or workshop..."
              filterOptions={[...MENTOR_FILTERS]}
              activeFilter={mentorFilter}
              onFilterChange={(value) => setMentorFilter(value as (typeof MENTOR_FILTERS)[number])}
            />
          )}
        </motion.div>

        <div role="tabpanel" hidden={tab !== "teams"} aria-hidden={tab !== "teams"}>
          {filteredTeams.length > 0 ? (
            <section className="mb-10">
              <TeamEcosystemClient teams={filteredTeams} />
            </section>
          ) : (
            <div className="text-center py-12 mb-10">
              <p className="text-lg text-muted mb-2">No teams found</p>
              <p className="text-sm text-muted-dark">
                {teams.length === 0
                  ? isSignedIn
                    ? "Create a team to showcase your project."
                    : "Sign in to create a team."
                  : "Try adjusting your search or category filter."}
              </p>
            </div>
          )}

          {filteredUnassigned.length > 0 ? (
            <section id="team-not-yet-defined" className="space-y-6">
              <div className="text-center md:text-left">
                <h2 className="font-[family-name:var(--font-orbitron)] uppercase text-lg md:text-xl font-bold text-white tracking-wide">
                  Team not yet defined
                </h2>
                <p className="mt-2 text-sm text-white/70 max-w-xl mx-auto md:mx-0">
                  Registered builders who are not on a hackathon team yet.
                </p>
              </div>
              <ParticipantDirectoryClient people={filteredUnassigned} />
            </section>
          ) : null}
        </div>

        <div role="tabpanel" hidden={tab !== "mentors"} aria-hidden={tab !== "mentors"}>
          <MentorDirectoryClient mentors={filteredMentors} expandMentorId={expandMentorId} />
        </div>

        {!isSignedIn && tab === "teams" ? (
          <p className="mt-10 text-center text-sm text-white/70">
            <Link href="/login" className="text-[var(--color-byte)] hover:underline">
              Sign in
            </Link>{" "}
            to create a team and add builders from the directory.
          </p>
        ) : null}
      </div>
    </div>
  );
}
