-- Card subscripts for Semi (DevRel) and Nikki (Content) on the members directory.

INSERT INTO roles (name)
VALUES ('Content'), ('DevRel')
ON CONFLICT (name) DO NOTHING;

INSERT INTO profile_roles (profile_id, role_id)
SELECT p.id, r.id
FROM profiles p
JOIN roles r ON r.name = 'Content'
WHERE (
  p.nickname ILIKE '%nikki%'
  OR p.real_name ILIKE '%nikki%'
  OR p.twitter_url ILIKE '%nikkideyy%'
)
ON CONFLICT DO NOTHING;

INSERT INTO profile_roles (profile_id, role_id)
SELECT p.id, r.id
FROM profiles p
JOIN roles r ON r.name = 'DevRel'
WHERE (
  p.member_number = 22
  OR p.nickname ILIKE '%semi%'
  OR p.real_name ILIKE '%semi%'
  OR p.twitter_url ILIKE '%semi%'
)
ON CONFLICT DO NOTHING;
