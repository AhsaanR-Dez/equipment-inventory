# Equipment Inventory

Warm-up B of my TypeScript internship roadmap. A read-only equipment inventory:
seeded Postgres, a CLI that dumps the rows to JSON, and a React table that reads
that JSON. The point of this repo is the tooling and the workflow, not the
feature set.

## Stack

TypeScript, Postgres (in Docker), `pg`, Vite + React (added on day 2),
TanStack Query, Zustand, Vitest, ESLint, Prettier.

## Running it locally

```
npm install
copy .env.example .env
npm run db:up
npm run db:seed
```

Wait for the container to report `healthy` before seeding. `docker compose ps`
shows the status. Right after `db:up` it will say `starting` for a few seconds.

## Scripts

| Script                 | What it does                  |
| ---------------------- | ----------------------------- |
| `npm run typecheck`    | `tsc --noEmit`                |
| `npm run lint`         | ESLint over the repo          |
| `npm run format:check` | Prettier check, no writes     |
| `npm test`             | Vitest with coverage          |
| `npm run db:up`        | Starts Postgres in Docker     |
| `npm run db:down`      | Stops it                      |
| `npm run db:seed`      | Truncates and reseeds 50 rows |

## Env vars

See `.env.example`. `.env` is gitignored. The credentials in the example file are
for a local throwaway database only, there is nothing real in there.

## Gotcha worth knowing

`db/init.sql` only runs when the Docker volume is brand new. If you change the
schema, the existing volume keeps the old one. Drop it first:

```
docker compose down -v
npm run db:up
```
