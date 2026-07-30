import { describe, expect, test } from 'vitest';
import { buildRows } from './build-rows.ts';
import { EQUIPMENT_STATUSES } from './types.ts';

// Mirrors the private constants in build-rows.ts so tests can validate
// against the real allowed values without exporting internals.
const RACK_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MODELS = [
  'Dell PowerEdge R650',
  'Dell PowerEdge R750',
  'HPE ProLiant DL360 Gen11',
  'Cisco Catalyst 9300',
  'Juniper EX4400',
  'Synology RS4021xs+',
];
const CAPACITY = RACK_LABELS.length * 42; // 210

describe('buildRows', () => {
  test('returns an empty array when count is 0', () => {
    expect(buildRows(0)).toEqual([]);
  });

  test('returns the requested number of rows', () => {
    expect(buildRows(1)).toHaveLength(1);
    expect(buildRows(10)).toHaveLength(10);
    expect(buildRows(50)).toHaveLength(50);
  });

  test('each row has the expected shape and value ranges', () => {
    const rows = buildRows(50);

    for (const row of rows) {
      expect(row.assetTag).toMatch(/^SPC-\d{4}$/);
      expect(typeof row.hostname).toBe('string');
      expect(row.hostname.length).toBeGreaterThan(0);
      expect(row.hostname).toBe(row.hostname.toLowerCase());
      expect(MODELS).toContain(row.model);
      expect(RACK_LABELS).toContain(row.rackLabel);
      expect(Number.isInteger(row.rackUnit)).toBe(true);
      expect(row.rackUnit).toBeGreaterThanOrEqual(1);
      expect(row.rackUnit).toBeLessThanOrEqual(42);
      expect(EQUIPMENT_STATUSES).toContain(row.status);
      expect(row.installedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(row.installedAt).getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  test('assigns sequential, zero-padded, unique asset tags', () => {
    const rows = buildRows(12);

    const assetTags = rows.map((row) => row.assetTag);
    expect(assetTags).toEqual([
      'SPC-0001',
      'SPC-0002',
      'SPC-0003',
      'SPC-0004',
      'SPC-0005',
      'SPC-0006',
      'SPC-0007',
      'SPC-0008',
      'SPC-0009',
      'SPC-0010',
      'SPC-0011',
      'SPC-0012',
    ]);
    expect(new Set(assetTags).size).toBe(assetTags.length);
  });

  test('never assigns the same rack label + rack unit slot twice', () => {
    const rows = buildRows(100);

    const slots = rows.map((row) => `${row.rackLabel}-${String(row.rackUnit)}`);
    expect(new Set(slots).size).toBe(slots.length);
  });

  test('can fill every available slot at full capacity without duplicates', () => {
    const rows = buildRows(CAPACITY);

    expect(rows).toHaveLength(CAPACITY);
    const slots = new Set(rows.map((row) => `${row.rackLabel}-${String(row.rackUnit)}`));
    expect(slots.size).toBe(CAPACITY);
  });

  test('throws when asked to build more rows than there are slots', () => {
    expect(() => buildRows(CAPACITY + 1)).toThrow(
      `Cannot build ${String(CAPACITY + 1)} rows, only ${String(CAPACITY)} slots exist.`,
    );
  });

  test('throws for a count far beyond capacity', () => {
    expect(() => buildRows(10_000)).toThrow(/Cannot build 10000 rows, only 210 slots exist\./);
  });

  test('returns an empty array for a negative count instead of throwing', () => {
    expect(buildRows(-1)).toEqual([]);
  });
});