export const MAX_RACE_GROUP_SIZE = 4;

export type RaceGroupSummary = {
  number: number;
  memberCount: number;
  isFull: boolean;
  hasLeader: boolean;
};

export type ParticipantRaceGroup = {
  groupNumber: number | null;
  isLeader: boolean;
  memberCount: number;
  nextGroupNumber: number;
  groups: RaceGroupSummary[];
};
