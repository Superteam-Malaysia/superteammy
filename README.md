# Superteam Malaysia monorepo

Community site and **Startup Village Borneo** hackathon app, deployed together on Railway.

| App | Path | Directory |
| --- | ---- | --------- |
| Superteam Malaysia site | `/` | `apps/site` |
| Startup Village Borneo | `/borneo` | `apps/borneo` |
| Edge reverse proxy | — | `services/edge` |

**Production:** [my.superteam.fun](https://my.superteam.fun) · SVB at [my.superteam.fun/borneo](https://my.superteam.fun/borneo)

## Quick start

```bash
npm install          # optional root devDeps
cd apps/site && npm install && npm run dev
cd apps/borneo && npm install && npm run dev
```

## Environment variables

Env files are **per app**. Next.js reads `.env` from the app directory, not the
repo root — a `.env` at the root is ignored, and the app fails at runtime with
"Your project's URL and Key are required to create a Supabase client!".

```bash
cp apps/site/.env.example apps/site/.env   # then fill in the values
```

| Variable | Used by |
| -------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | site — client and middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | site — admin API routes |
| `NEXT_PUBLIC_SITE_URL` | site — sitemap, metadata, invite links |
| `LUMA_API_KEY` | site — event sync (optional) |
| `DATABASE_URL` | the `borneo:db:*` scripts, which run from `apps/site` |

The Borneo database scripts live at `apps/site/scripts/borneo/` and are invoked
through `apps/site`, so `DATABASE_URL` belongs in `apps/site/.env` too.
`apps/borneo/` is kept as reference only — see Legacy in the Railway doc.

Scripts load env with `dotenv`, which resolves **relative to the current working
directory**. Run them from inside the app, or with `-w`:

```bash
npm run seed -w apps/site        # ✅
cd apps/site && npx tsx scripts/seed.ts   # ✅
npx tsx apps/site/scripts/seed.ts         # ❌ looks for ./.env at the repo root
```

`NEXT_PUBLIC_SITE_URL` is worth setting even locally: `apps/site/src/app/api/invites/route.ts`
falls back to `http://localhost:3000`, so invite links generated without it point at localhost.

## Deploy

See [`docs/monorepo-railway.md`](./docs/monorepo-railway.md) for Railway service roots, DNS, and env vars.

Participant login / Postgres: [`docs/railway-setup.md`](./docs/railway-setup.md).

## Structure

```
apps/
  site/      Superteam Malaysia (Next.js + Supabase)
  borneo/    Startup Village Borneo (Next.js + Postgres/Drizzle)
services/
  edge/      Caddy — routes /borneo and /
docs/        Blueprint, design, Railway guides
data/        Shared CSV imports
```

The former standalone repo `startup-village-borneo` lives here as `apps/borneo`.
