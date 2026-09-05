CREATE TABLE IF NOT EXISTS race_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE participants ADD COLUMN IF NOT EXISTS race_team_id uuid REFERENCES race_teams(id) ON DELETE SET NULL;
