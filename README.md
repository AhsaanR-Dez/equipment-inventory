# Equipment Inventory

Warm-up project B from my TypeScript internship roadmap. A read-only rack
equipment inventory: Postgres holds the data, a CLI dumps it to JSON, and a
React table renders it. The point of this repo is the tooling and the workflow,
not the feature set, so the app itself is deliberately small.

## Stack

TypeScript, Postgres 17 (in Docker), `pg`, Vitest, ESLint, Prettier. Vite,
React and TanStack Query get added as the frontend goes in.

## Prerequisites

- Node 20 or newer
- Docker Desktop, running (the database lives in a container)

## Getting started

```
npm install
```

Copy the env file:

```
copy .env.example .env    # Windows
cp .env.example .env      # macOS / Linux
```

Start Postgres and wait for it to be ready:

```
npm run db:up
docker compose ps
```

The `STATUS` column says `starting` for a few seconds before it says `healthy`.
Seeding before it's healthy will fail with a connection error, so wait for it.

Then load the data:

```
npm run db:seed
```

You should get `Seeded 50 rows.` back.

## Scripts

| Script                 | What it does                  |
| ---------------------- | ----------------------------- |
| `npm run typecheck`    | `tsc --noEmit`                |
| `npm run lint`         | ESLint across the repo        |
| `npm run lint:fix`     | ESLint with autofix           |
| `npm run format`       | Prettier, writes changes      |
| `npm run format:check` | Prettier, check only          |
| `npm test`             | Vitest with coverage          |
| `npm run db:up`        | Starts Postgres in Docker     |
| `npm run db:down`      | Stops it, keeps the data      |
| `npm run db:seed`      | Truncates and reseeds 50 rows |

## Environment variables

`.env` is gitignored, `.env.example` is committed. The values in the example
file are for a local throwaway database only, there is nothing real in there.

| Variable            | What it's for                                      |
| ------------------- | -------------------------------------------------- |
| `POSTGRES_USER`     | Database user, used by Compose and the seed script |
| `POSTGRES_PASSWORD` | Database password                                  |
| `POSTGRES_DB`       | Database name                                      |
| `POSTGRES_PORT`     | Host port the container binds to                   |
| `DATABASE_URL`      | Optional. Overrides the four above                 |

The seed script builds its connection string from the same `POSTGRES_*` values
Compose uses, so the two can't drift apart. `DATABASE_URL` is there for a
deployed environment pointing at a hosted database instead of the container.

## Layout

```
db/init.sql          schema, runs once when the Docker volume is created
src/types.ts         shared equipment types
src/build-rows.ts    generates fake rows, no database needed
src/db-config.ts     builds the connection string from env
scripts/seed.ts      truncates and inserts, inside a transaction
```

`buildRows` lives in `src/` rather than inside the seed script on purpose. The
seed script opens a database connection, so anything importing it for a test
would need Postgres running. Keeping the row generation as a plain function
means it can be tested on its own.

## Things worth knowing

**The schema only gets created once.** `db/init.sql` is mounted into Postgres's
init directory, and that directory only runs when the data volume is brand new.
If you change the schema, the existing volume keeps the old one. Drop it and
start over:

```
docker compose down -v
npm run db:up
npm run db:seed
```

**Postgres is bound to `127.0.0.1`.** It's only reachable from this machine, not
from anything else on the network.

**The generated JSON isn't committed.** `public/equipment.json` is gitignored
because it's a build artifact. Run the seed and the dump script after cloning.