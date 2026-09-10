/** Unified Amazing Race + pitch deck cutoff — Malaysia Time (UTC+8). */
export const SUBMISSION_CUTOFF = {
  label: "Thu 10 Sept",
  time: "midnight MYT",
  banner: "Thu 10 Sept · midnight MYT — Amazing Race & pitch deck cutoff",
  iso: "2026-09-11T00:00:00+08:00",
} as const;

export function isSubmissionCutoffPassed(now = new Date()): boolean {
  return now.getTime() >= new Date(SUBMISSION_CUTOFF.iso).getTime();
}
