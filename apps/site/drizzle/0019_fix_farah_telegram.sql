-- Farah Kamal: @ImaniKml is her Telegram handle (not X/Twitter).
UPDATE participants
SET telegram = 'https://t.me/ImaniKml',
    twitter_url = NULL,
    updated_at = NOW()
WHERE guest_id = 'gst-uhy68HsMG1o8jCA'
   OR email_normalized = 'hpy5c8whjc@privaterelay.appleid.com';
