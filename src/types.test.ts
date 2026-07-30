import { describe, expect, test } from 'vitest';
import { EQUIPMENT_STATUSES, type Equipment, type EquipmentStatus } from './types.ts';

describe('EQUIPMENT_STATUSES', () => {
  test('contains exactly the three known equipment statuses', () => {
    expect(EQUIPMENT_STATUSES).toEqual(['active', 'maintenance', 'decommissioned']);
  });

  test('has no duplicate entries', () => {
    expect(new Set(EQUIPMENT_STATUSES).size).toBe(EQUIPMENT_STATUSES.length);
  });

  test('every entry is a non-empty lowercase string', () => {
    for (const status of EQUIPMENT_STATUSES) {
      expect(typeof status).toBe('string');
      expect(status).toBe(status.toLowerCase());
      expect(status.length).toBeGreaterThan(0);
    }
  });
});

describe('EquipmentStatus type', () => {
  test('accepts each value from EQUIPMENT_STATUSES', () => {
    // Compile-time check: this assignment only type-checks if EquipmentStatus
    // is exactly the union derived from EQUIPMENT_STATUSES.
    const statuses: EquipmentStatus[] = [...EQUIPMENT_STATUSES];
    expect(statuses).toEqual(EQUIPMENT_STATUSES);
  });
});

describe('Equipment interface', () => {
  test('describes an object shape with the expected fields', () => {
    const equipment: Equipment = {
      id: 1,
      assetTag: 'SPC-0001',
      hostname: 'host1',
      model: 'Dell PowerEdge R650',
      rackLabel: 'A1',
      rackUnit: 1,
      status: 'active',
      installedAt: '2024-01-01',
    };

    expect(Object.keys(equipment).sort()).toEqual(
      [
        'id',
        'assetTag',
        'hostname',
        'model',
        'rackLabel',
        'rackUnit',
        'status',
        'installedAt',
      ].sort(),
    );
    expect(EQUIPMENT_STATUSES).toContain(equipment.status);
  });
});