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
echo "[startup] telegram webhook"
npm run borneo:telegram:setup-webhook || echo "[startup] telegram webhook setup skipped"

# Data sync can take 30s+ — run after the server is listening so deploys don't 502 login.
echo "[startup] background data sync"
(
  npm run borneo:db:import-guests || echo "[startup] import guests skipped"
  npm run borneo:db:patch-telegram-handles || echo "[startup] telegram patch skipped"
  npm run borneo:db:seed-teams || echo "[startup] seed teams skipped"
  npm run borneo:db:seed-race-submissions || echo "[startup] race submission seed skipped"
  npm run borneo:db:seed-staff || echo "[startup] seed staff skipped"
  npm run borneo:db:backfill-telegram-avatars || echo "[startup] telegram avatar backfill skipped"
) &

echo "[startup] next start"
NODE_ENV=production exec next start -H 0.0.0.0 -p "${PORT:-3000}"
