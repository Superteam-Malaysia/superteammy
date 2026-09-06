-- Toan Ho (LP Agent): ensure Luma Telegram handle is on file.
UPDATE participants
SET telegram = 'https://t.me/toanhq',
    updated_at = NOW()
WHERE email_normalized = 'toanbku@gmail.com'
   OR guest_id = 'gst-NIbyHy75LZnzs2u';

-- Remember which site domain started Telegram login (stmy.fun vs my.superteam.fun).
ALTER TABLE telegram_login_sessions
  ADD COLUMN IF NOT EXISTS return_origin text;
