-- Milestones are one submission per participant per task (team is optional display tag).

ALTER TABLE "race_submissions" DROP CONSTRAINT IF EXISTS "race_submissions_team_task_unique";

ALTER TABLE "race_submissions" ALTER COLUMN "team_id" DROP NOT NULL;

DELETE FROM "race_submissions" WHERE "submitted_by" IS NULL;

DO $$
BEGIN
  ALTER TABLE "race_submissions" ALTER COLUMN "submitted_by" SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

ALTER TABLE "race_submissions" DROP CONSTRAINT IF EXISTS "race_submissions_participant_task_unique";

ALTER TABLE "race_submissions"
  ADD CONSTRAINT "race_submissions_participant_task_unique" UNIQUE ("submitted_by", "task_id");

CREATE INDEX IF NOT EXISTS "race_submissions_submitted_by_idx" ON "race_submissions" ("submitted_by");
