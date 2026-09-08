/** Unified Amazing Race + pitch deck cutoff — Malaysia Time (UTC+8). */
export const SUBMISSION_CUTOFF = {
  label: "Wed 10 Sept",
  time: "12:00 AM MYT",
  banner: "Wed 10 Sept · midnight MYT — Amazing Race & pitch deck cutoff",
  /** Last instant before close: end of 10 Sept → 11 Sept 00:00 MYT. */
  iso: "2026-09-11T00:00:00+08:00",
} as const;

export function isSubmissionCutoffPassed(now = new Date()): boolean {
  return now.getTime() >= new Date(SUBMISSION_CUTOFF.iso).getTime();
}
