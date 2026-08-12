import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { EQUIPMENT_STATUSES } from '../src/types.ts';

const INIT_SQL_PATH = fileURLToPath(new URL('../db/init.sql', import.meta.url));

function readInitSql(): string {
  return readFileSync(INIT_SQL_PATH, 'utf8');
}

describe('db/init.sql', () => {
  test('creates the equipment table only if it does not already exist', () => {
    const sql = readInitSql();

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS equipment \(/);
  });

  test('declares every expected column with its type and constraints', () => {
    const sql = readInitSql();

    expect(sql).toMatch(/id\s+SERIAL PRIMARY KEY/);
    expect(sql).toMatch(/asset_tag\s+TEXT NOT NULL UNIQUE/);
    expect(sql).toMatch(/hostname\s+TEXT NOT NULL/);
    expect(sql).toMatch(/model\s+TEXT NOT NULL/);
    expect(sql).toMatch(/rack_label\s+TEXT NOT NULL/);
    expect(sql).toMatch(/rack_unit\s+INTEGER NOT NULL CHECK \(rack_unit BETWEEN 1 AND 42\)/);
    expect(sql).toMatch(/installed_at\s+DATE NOT NULL/);
  });

  test('enforces a unique (rack_label, rack_unit) slot per row', () => {
    const sql = readInitSql();

    expect(sql).toMatch(/UNIQUE \(rack_label, rack_unit\)/);
  });

  test('creates lookup indexes on rack_label and status', () => {
    const sql = readInitSql();

    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS equipment_rack_label_idx ON equipment \(rack_label\)/);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS equipment_status_idx ON equipment \(status\)/);
  });

  test('the status CHECK constraint stays in sync with EQUIPMENT_STATUSES', () => {
    const sql = readInitSql();

    const match = /status\s+TEXT NOT NULL CHECK \(status IN \(([^)]+)\)\)/.exec(sql);
    expect(match).not.toBeNull();

    const allowedStatuses = (match?.[1] ?? '')
      .split(',')
      .map((value) => value.trim().replace(/^'|'$/g, ''));

    expect(allowedStatuses).toEqual([...EQUIPMENT_STATUSES]);
  });
});