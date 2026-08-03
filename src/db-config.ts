const REQUIRED_VARS = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_PORT',
] as const;

/**
 * Builds the Postgres connection string. DATABASE_URL wins if it is set, which
 * is how a deployed environment would point at a hosted database. Otherwise it
 * is assembled from the same POSTGRES_* values Compose uses, so the two can't
 * drift apart.
 */
export function connectionStringFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const missing = REQUIRED_VARS.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}. Copy .env.example to .env first.`);
  }

  const user = encodeURIComponent(env.POSTGRES_USER ?? '');
  const password = encodeURIComponent(env.POSTGRES_PASSWORD ?? '');
  const database = encodeURIComponent(env.POSTGRES_DB ?? '');
  const port = env.POSTGRES_PORT ?? '';

  return `postgres://${user}:${password}@localhost:${port}/${database}`;
}
