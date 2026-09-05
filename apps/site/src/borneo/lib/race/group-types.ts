export const MAX_RACE_GROUP_SIZE = 4;

export type RaceGroupSummary = {
  number: number;
  memberCount: number;
  isFull: boolean;
  hasLeader: boolean;
  leaderName: string | null;
};

export type ParticipantRaceGroup = {
  groupNumber: number | null;
  isLeader: boolean;
  memberCount: number;
  leaderName: string | null;
  nextGroupNumber: number;
  groups: RaceGroupSummary[];
};
