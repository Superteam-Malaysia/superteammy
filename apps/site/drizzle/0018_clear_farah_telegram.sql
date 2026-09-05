-- Farah Kamal — no Telegram on public profile (X only: @ImaniKml)
UPDATE participants
SET
  telegram = NULL,
  updated_at = NOW()
WHERE guest_id = 'gst-uhy68HsMG1o8jCA'
   OR email_normalized = 'hpy5c8whjc@privaterelay.appleid.com';
