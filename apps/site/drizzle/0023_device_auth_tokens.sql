-- Reusable device sign-in tokens (localStorage / open-in-browser sync).
CREATE TABLE IF NOT EXISTS device_auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS device_auth_tokens_participant_id_idx
  ON device_auth_tokens (participant_id);
