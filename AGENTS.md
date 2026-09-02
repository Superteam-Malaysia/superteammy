# Agent instructions — Startup Village Borneo

Always-on project rules live in `.cursor/rules/`. See
`lightweight-verification.mdc` — small data/CSS/layout changes need no
verification; commit and move on.

## Subagents — do not use

- **No Task/subagent delegation** for this project — not explore, not debug, not computerUse, not parallel subagents, not any other subagent type.
- Do the work directly: grep, read files, run terminal commands, edit code yourself.
- Do not launch background agents or delegate exploration/implementation to subagents.

## Git — push to main

- **No feature branches** for routine agent work. Commit and push directly to **`main`**.
- Do not create `cursor/*` branches or draft PRs unless the user explicitly asks.
- Keep diffs small and scoped — branches are not a substitute for minimal blast radius.

See `.cursor/rules/push-to-main.mdc`.

## Testing — do not use

- **No computer-use / GUI subagents** for this project.
- **No Playwright** (or similar browser automation) for verification.
- For small CSS/layout/copy changes, commit after the edit — no dev server, screenshots, or recordings.
- For non-trivial work, use terminal checks only (`curl`, `npm run build`, existing test scripts).

## Cloud Agent secrets

These are injected via the Cursor environment (not committed to the repo):

| Secret | Purpose |
| ------ | ------- |
| `RAILWAY_TOKEN` | Project token for `svb` production — use `Project-Access-Token` header or `railway variable` |
| `TELEGRAM_BOT_TOKEN` | Bot token for @superteamalaysiabot — local auth testing and Telegram API calls |

Production web service already has `TELEGRAM_BOT_TOKEN` on Railway. BotFather `/setdomain` must be `my.superteam.fun`.
