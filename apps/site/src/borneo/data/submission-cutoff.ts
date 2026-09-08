/** Unified Amazing Race + pitch deck cutoff — Malaysia Time (UTC+8). */
export const SUBMISSION_CUTOFF = {
  label: "Tue 9 Sept",
  time: "9:00 PM MYT",
  banner: "Tue 9 Sept · 9pm MYT — Amazing Race & pitch deck cutoff",
  iso: "2026-09-09T21:00:00+08:00",
} as const;

export function isSubmissionCutoffPassed(now = new Date()): boolean {
  return now.getTime() >= new Date(SUBMISSION_CUTOFF.iso).getTime();
}
