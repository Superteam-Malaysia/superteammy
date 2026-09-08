import {
  MILESTONE_SUBMIT_TASKS,
  RACE_DEADLINE,
  type RaceTask,
} from "@borneo/data/race-tasks";

export type RaceRulebookRow = {
  key: string;
  label: string;
  title: string;
  points: string;
  deadline: string;
};

function milestoneLabel(task: RaceTask, tasks: RaceTask[]): string {
  const sameNumber = tasks.filter((t) => t.number === task.number);
  if (sameNumber.length <= 1) return `#${task.number}`;

  const position = sameNumber.findIndex((t) => t.id === task.id);
  const suffix = String.fromCharCode(97 + position);
  return `#${task.number}${suffix}`;
}

export function getRaceRulebookRows(): RaceRulebookRow[] {
  const tasks = MILESTONE_SUBMIT_TASKS;
  return tasks.map((task) => ({
    key: task.id,
    label: milestoneLabel(task, tasks),
    title: task.title,
    points: task.pointsNote ?? `${task.pointsBase} pts per post`,
    deadline: task.deadline ?? RACE_DEADLINE,
  }));
}
