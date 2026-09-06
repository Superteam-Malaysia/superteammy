-- Mentor workshop orgs are listed under the Mentors tab, not hackathon teams.
DELETE FROM team_members
WHERE team_id IN (
  SELECT id FROM teams
  WHERE slug IN (
    'sanctum',
    'getblock',
    'meteora',
    'monkedao',
    'kyzzen',
    'virtuals',
    'elfa-ai',
    'cradle',
    'superscrypt',
    'no-limit-holdings',
    'solana-foundation',
    'superteam-my',
    'superteam-malaysia',
    'socoe',
    'redotpay',
    'tankdao',
    'content'
  )
);

DELETE FROM teams
WHERE slug IN (
  'sanctum',
  'getblock',
  'meteora',
  'monkedao',
  'kyzzen',
  'virtuals',
  'elfa-ai',
  'cradle',
  'superscrypt',
  'no-limit-holdings',
  'solana-foundation',
  'superteam-my',
  'superteam-malaysia',
  'socoe',
  'redotpay',
  'tankdao',
  'content'
);
