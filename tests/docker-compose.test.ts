import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const COMPOSE_PATH = fileURLToPath(new URL('../docker-compose.yaml', import.meta.url));

function readCompose(): string {
  return readFileSync(COMPOSE_PATH, 'utf8');
}

describe('docker-compose.yaml', () => {
  test('defines a single "db" service using the postgres 17 alpine image', () => {
    const compose = readCompose();

    expect(compose).toMatch(/^services:\s*\n\s+db:/m);
    expect(compose).toMatch(/image:\s*postgres:17-alpine/);
  });

  test('wires POSTGRES_* environment variables through from the host env', () => {
    const compose = readCompose();

    expect(compose).toMatch(/POSTGRES_USER:\s*\$\{POSTGRES_USER\}/);
    expect(compose).toMatch(/POSTGRES_PASSWORD:\s*\$\{POSTGRES_PASSWORD\}/);
    expect(compose).toMatch(/POSTGRES_DB:\s*\$\{POSTGRES_DB\}/);
  });

  test('publishes the configurable POSTGRES_PORT to the container port 5432', () => {
    const compose = readCompose();

    expect(compose).toMatch(/\$\{POSTGRES_PORT\}:5432/);
  });

  test('mounts a named volume for data and the init script read-only', () => {
    const compose = readCompose();

    expect(compose).toMatch(/db-data:\/var\/lib\/postgresql\/data/);
    expect(compose).toMatch(/\.\/db\/init\.sql:\/docker-entrypoint-initdb\.d\/init\.sql:ro/);
    expect(compose).toMatch(/^volumes:\s*\n\s+db-data:/m);
  });

  test('defines a pg_isready healthcheck using the configured user and database', () => {
    const compose = readCompose();

    expect(compose).toMatch(/pg_isready -U \$\{POSTGRES_USER\} -d \$\{POSTGRES_DB\}/);
    expect(compose).toMatch(/retries:\s*10/);
  });
});