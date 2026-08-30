# Railway — monorepo deploy (my.superteam.fun)

Single GitHub repo: **Superteam-Malaysia/superteammy** (canonical parent)

This branch may live on `startup-village-borneo` temporarily — **merge into `superteammy`** and point all Railway services at that repo.

| Railway service | Root directory | Public URL |
| ---------------- | -------------- | ---------- |
| **superteammy** | `apps/site` | `https://my.superteam.fun` (+ `/borneo` proxied to **web**) |
| **web** (SVB) | `apps/borneo` | internal only (`web.railway.internal`) |

No separate **edge** service — the site Next.js app reverse-proxies `/borneo` to the Borneo service via `BORNEO_UPSTREAM` in `apps/site/next.config.ts`.

## DNS (my.superteam.fun)

Point the subdomain at the **superteammy** site service (not a separate edge proxy):

1. Railway → project **svb** → service **superteammy** → Settings → Domains → add `my.superteam.fun`
2. At your DNS host for `superteam.fun`, add the records Railway shows (typically):
   - **CNAME** `my` → `<superteammy-service>.up.railway.app`
   - **TXT** `_railway-verify.my` → `railway-verify=…` (if prompted)

Optionally attach `stmy.fun` to **superteammy** as well if you want the old domain to keep working.

## Site environment

| Variable | Example |
| -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | `https://my.superteam.fun` |
| `BORNEO_UPSTREAM` | `http://web.railway.internal:8080` |

`/borneo` is proxied from the site app to the **web** service (see `apps/site/next.config.ts`).

## Legacy edge service

The old Caddy **edge** service is retired — routing lives in the site app now.

## Link GitHub repo to all three services

For each service in Railway:

1. Settings → Source → connect **Superteam-Malaysia/superteammy**
2. Set **Root Directory** (table above)
3. Redeploy

Previously **web** pointed at `startup-village-borneo`; repoint it to this monorepo with root `apps/borneo`.

## Borneo (web) variables

| Variable | Value |
| -------- | ----- |
| `DATABASE_URL` | Postgres plugin (shared) |
| `AUTH_SECRET` | Random 32+ chars |
| `APP_URL` | `https://my.superteam.fun` |
| `NEXT_PUBLIC_BASE_PATH` | `/borneo` |
| `NEXT_PUBLIC_SITE_URL` | `https://my.superteam.fun/borneo` |
| `TELEGRAM_BOT_TOKEN` | BotFather token |

BotFather: `/setdomain` → **`my.superteam.fun`** (required for Login Widget).

Deploy runs migrations + guest import + Telegram webhook via `apps/borneo/scripts/start-production.sh`.

## Local development

```bash
# Site (port 3000)
cd apps/site && npm install && npm run dev

# Borneo (port 3001 — set in .env or pass -p)
cd apps/borneo && npm install && npm run dev
```

Postgres for Borneo: `docker compose up -d postgres` from repo root; see `docs/railway-setup.md`.

## Legacy repo

`Superteam-Malaysia/startup-village-borneo` is archived in favor of `apps/borneo` in this monorepo.
