# Railway — single Next.js app (my.superteam.fun)

Single GitHub repo: **Superteam-Malaysia/superteammy**

| Railway service | Root directory | Public URL |
| ---------------- | -------------- | ---------- |
| **superteammy** | `apps/site` | `https://my.superteam.fun` (site at `/`, Borneo at `/borneo`) |

One deploy serves both the Superteam Malaysia member site and Startup Village Borneo. Borneo lives under `apps/site/src/app/borneo/` and `apps/site/src/borneo/` — no separate **web** service and no edge proxy.

## DNS (my.superteam.fun)

Point the subdomain at the **superteammy** service:

1. Railway → project **svb** → service **superteammy** → Settings → Domains → add `my.superteam.fun`
2. At your DNS host for `superteam.fun`:
   - **CNAME** `my` → `superteammy-production.up.railway.app` (or the hostname Railway shows)
   - **TXT** `_railway-verify.my` → `railway-verify=…` (if prompted)

**Important:** If `my.superteam.fun` still resolves to Cloudflare/Vercel (A records `104.21.x.x`), traffic will not reach Railway. Use a CNAME to Railway, not a proxy to an old host. `stmy.fun` is already working as a canary.

Optionally attach `stmy.fun` to **superteammy** so the old domain keeps working.

## Environment (superteammy)

| Variable | Example |
| -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | `https://my.superteam.fun` |
| `DATABASE_URL` | Postgres plugin (Borneo) |
| `AUTH_SECRET` | Random 32+ chars (Borneo sessions) |
| `APP_URL` | `https://my.superteam.fun` |
| `NEXT_PUBLIC_BASE_PATH` | `/borneo` |
| `NEXT_PUBLIC_SITE_URL` (Borneo links) | `https://my.superteam.fun/borneo` |
| `TELEGRAM_BOT_TOKEN` | BotFather token |
| Supabase vars | Site auth (`NEXT_PUBLIC_SUPABASE_*`, etc.) |

BotFather: `/setdomain` → **`my.superteam.fun`** (Telegram Login Widget).

Production startup runs Borneo migrations, guest import, and Telegram webhook via `apps/site/scripts/start-production.sh`.

## Retired services

- **edge** — Caddy reverse proxy (removed)
- **web** — standalone Borneo app at `apps/borneo` (merged into **superteammy**; delete after deploy validates)

Copy any remaining **web** env vars onto **superteammy** before deleting **web**. Remove `BORNEO_UPSTREAM` — it was only used for the rewrite proxy.

## Local development

```bash
cd apps/site && npm install
cp .env.example .env   # env is per app; a root .env is not read
npm run dev
```

Site: `http://localhost:3000` · Borneo: `http://localhost:3000/borneo`

Postgres for Borneo: `docker compose up -d postgres` from repo root; see `docs/railway-setup.md`.

## Legacy

`apps/borneo/` remains in the repo as reference until the merged deploy is stable. `Superteam-Malaysia/startup-village-borneo` is archived in favor of this monorepo.
