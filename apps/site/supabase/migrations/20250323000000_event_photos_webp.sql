-- Point the seeded event photos at the downscaled .webp files.
--
-- 20250319_event_gallery.sql seeded event_photos with the 32 bundled
-- /images/events/N.jpeg paths. Those originals are 2560x1440, which decodes to
-- ~14.7MB of RAM each -- ~450MB for the dome, past the point where mobile
-- Safari kills the tab. They have been re-encoded at 900px wide as .webp
-- (~1.7MB decoded each).
--
-- Only rewrites rows still pointing at the bundled files. Photos an admin
-- uploaded through Dashboard -> Event Gallery are full Supabase storage URLs
-- and are left untouched.

UPDATE event_photos
SET image_url = regexp_replace(image_url, '\.jpe?g$', '.webp')
WHERE image_url ~ '^/images/events/[0-9]+\.jpe?g$';
