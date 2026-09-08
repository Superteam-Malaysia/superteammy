-- Allow multiple submissions per participant per milestone (unique X links only).
ALTER TABLE "race_submissions" DROP CONSTRAINT IF EXISTS "race_submissions_participant_task_unique";
