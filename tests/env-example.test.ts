import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { describe, expect, test } from 'vitest';

const ENV_EXAMPLE_PATH = fileURLToPath(new URL('../.env.example', import.meta.url));

function readEnvExample(): Record<string, string> {
  return parse(readFileSync(ENV_EXAMPLE_PATH, 'utf8'));
}

describe('.env.example', () => {
  test('defines every variable required to run the app', () => {
    const env = readEnvExample();

    expect(Object.keys(env).sort()).toEqual(
      ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'POSTGRES_PORT', 'DATABASE_URL'].sort(),
    );
  });

  test('has a non-empty value for every variable', () => {
    const env = readEnvExample();

    for (const [key, value] of Object.entries(env)) {
      expect(value.length, `${key} should not be empty`).toBeGreaterThan(0);
    }
  });

  test('POSTGRES_PORT is a numeric string', () => {
    const env = readEnvExample();

    expect(env.POSTGRES_PORT).toMatch(/^\d+$/);
  });

  test('DATABASE_URL is a valid postgres connection string that matches the other vars', () => {
    const env = readEnvExample();

    const match = /^postgres:\/\/([^:]+):([^@]+)@localhost:(\d+)\/(.+)$/.exec(env.DATABASE_URL ?? '');
    expect(match).not.toBeNull();

    const [, user, password, port, database] = match ?? [];
    expect(user).toBe(env.POSTGRES_USER);
    expect(password).toBe(env.POSTGRES_PASSWORD);
    expect(port).toBe(env.POSTGRES_PORT);
    expect(database).toBe(env.POSTGRES_DB);
  });
});