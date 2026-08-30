#!/usr/bin/env sh
set -e

if [ -z "${BUCKET:-}" ]; then
  UPLOAD_ROOT="${UPLOAD_DIR:-${RAILWAY_VOLUME_MOUNT_PATH:-public/borneo/uploads}}"
  echo "[startup] ensure upload dirs at ${UPLOAD_ROOT}"
  mkdir -p "${UPLOAD_ROOT}/participants" "${UPLOAD_ROOT}/teams"
else
  echo "[startup] uploads via Railway Bucket (${BUCKET})"
fi

echo "[startup] generate schedule ics"
npm run borneo:generate-ics
echo "[startup] migrate"
npm run borneo:db:migrate
echo "[startup] import guests"
npm run borneo:db:import-guests
echo "[startup] seed teams"
npm run borneo:db:seed-teams
echo "[startup] seed staff"
npm run borneo:db:seed-staff
echo "[startup] backfill telegram avatars"
npm run borneo:db:backfill-telegram-avatars || echo "[startup] telegram avatar backfill skipped"
echo "[startup] telegram webhook"
npm run borneo:telegram:setup-webhook || echo "[startup] telegram webhook setup skipped"
echo "[startup] next start"
NODE_ENV=production exec npm run start
