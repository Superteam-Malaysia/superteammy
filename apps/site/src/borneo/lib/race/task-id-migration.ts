import { MILESTONE_SUBMIT_TASKS } from "@borneo/data/race-tasks";

/** Canonical Amazing Race milestone ids (#1–#16). */
export const CANONICAL_MILESTONE_TASK_IDS = new Set(
  MILESTONE_SUBMIT_TASKS.map((task) => task.id),
);

/** Legacy submit ids → canonical milestone id. */
export const LEGACY_RACE_TASK_ID_MAP: Record<string, string> = {
  "content-first-impressions": "race-landed-in-kuching",
  "race-sampan-ride": "race-kuching-waterfront",
  "race-flagpole-lean": "race-kuching-waterfront",
  "race-flagpole-group": "race-kuching-waterfront",
};

export function isCanonicalMilestoneTaskId(taskId: string): boolean {
  return CANONICAL_MILESTONE_TASK_IDS.has(taskId);
}

export function canonicalTaskIdForLegacy(taskId: string): string | undefined {
  return LEGACY_RACE_TASK_ID_MAP[taskId];
}
