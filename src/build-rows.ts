import { faker } from '@faker-js/faker';
import { EQUIPMENT_STATUSES, type EquipmentStatus } from './types.ts';

const RACK_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MODELS = [
  'Dell PowerEdge R650',
  'Dell PowerEdge R750',
  'HPE ProLiant DL360 Gen11',
  'Cisco Catalyst 9300',
  'Juniper EX4400',
  'Synology RS4021xs+',
];

export interface SeedRow {
  assetTag: string;
  hostname: string;
  model: string;
  rackLabel: string;
  rackUnit: number;
  status: EquipmentStatus;
  installedAt: string;
}

/**
 * Builds fake equipment rows. Pure apart from faker's randomness, so tests can
 * call it without a database. Slots are unique because the equipment table has
 * a UNIQUE (rack_label, rack_unit) constraint.
 */
export function buildRows(count: number): SeedRow[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`count must be a non-negative integer, got ${String(count)}.`);
  }

  const capacity = RACK_LABELS.length * 42;
  if (count > capacity) {
    throw new Error(`Cannot build ${String(count)} rows, only ${String(capacity)} slots exist.`);
  }

  const takenSlots = new Set<string>();
  const rows: SeedRow[] = [];

  while (rows.length < count) {
    const rackLabel = faker.helpers.arrayElement(RACK_LABELS);
    const rackUnit = faker.number.int({ min: 1, max: 42 });
    const slot = `${rackLabel}-${String(rackUnit)}`;

    if (takenSlots.has(slot)) continue;
    takenSlots.add(slot);

    rows.push({
      assetTag: `SPC-${String(rows.length + 1).padStart(4, '0')}`,
      hostname: faker.internet.domainWord().toLowerCase(),
      model: faker.helpers.arrayElement(MODELS),
      rackLabel,
      rackUnit,
      status: faker.helpers.arrayElement(EQUIPMENT_STATUSES),
      installedAt: faker.date.past({ years: 4 }).toISOString().slice(0, 10),
    });
  }

  return rows;
}
