import { faker } from '@faker-js/faker';
import { uniqueHostname } from './hostnames.ts';
import { EQUIPMENT_STATUSES, type EquipmentStatus } from './types.ts';

const RACK_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
/**
 * Real machines across a spread of years, so the inventory looks like kit that
 * accumulated over time rather than one bulk purchase. Fifty rows over ~30
 * models means repeats, which is what a real fleet looks like anyway.
 */
const MODELS = [
  // Lenovo ThinkPad
  'Lenovo ThinkPad T460s (2016)',
  'Lenovo ThinkPad T480 (2018)',
  'Lenovo ThinkPad T490 (2019)',
  'Lenovo ThinkPad T14 Gen 3 (2022)',
  'Lenovo ThinkPad X380 Yoga (2018)',
  'Lenovo ThinkPad X390 Yoga (2019)',
  'Lenovo ThinkPad X1 Carbon Gen 6 (2018)',
  'Lenovo ThinkPad X1 Carbon Gen 9 (2021)',
  'Lenovo ThinkPad L14 Gen 2 (2021)',
  'Lenovo ThinkPad E15 Gen 2 (2020)',

  // Lenovo IdeaPad and Yoga
  'Lenovo IdeaPad G580 (2012)',
  'Lenovo IdeaPad 330 (2018)',
  'Lenovo IdeaPad 3 15 (2020)',
  'Lenovo IdeaPad Flex 5 14 (2020)',
  'Lenovo Yoga C740 (2019)',
  'Lenovo Yoga Slim 7 (2020)',
  'Lenovo Yoga 7i 2-in-1 (2026)',

  // ASUS
  'ASUS VivoBook 14 (2018)',
  'ASUS VivoBook S15 S533 (2020)',
  'ASUS Vivobook Go 15 (2023)',
  'ASUS Vivobook S 14 Flip TP3402 (2023)',
  'ASUS Vivobook 16 Flip TP3607 (2025)',
  'ASUS ZenBook 14 UX425 (2020)',

  // Dell
  'Dell XPS Desktop 8930 (2018)',
  'Dell XPS Desktop 8940 (2021)',
  'Dell XPS Desktop 8950 (2022)',
  'Dell XPS 13 9310 (2020)',
  'Dell Latitude 5490 (2018)',
  'Dell Latitude 7490 (2018)',
  'Dell Latitude 3120 (2021)',
  'Dell OptiPlex 7050 (2017)',
  'Dell OptiPlex 3080 (2020)',
  'Dell Inspiron 1501 (2006)',
  'Dell Inspiron 15 3520 (2022)',

  // HP
  'HP Pavilion dv6 Notebook PC (2010)',
  'HP Pavilion g6 Notebook PC (2011)',
  'HP EliteBook 840 G5 (2018)',
  'HP EliteDesk 800 G4 (2018)',
  'HP ProBook 450 G7 (2020)',

  // Apple
  'Apple MacBook Pro 16-inch (2019)',
  'Apple MacBook Air M1 (2020)',
  'Apple MacBook Pro 14-inch M1 Pro (2021)',
  'Apple iMac 24-inch M1 (2021)',
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
  const takenHostnames = new Set<string>();
  const rows: SeedRow[] = [];

  while (rows.length < count) {
    const rackLabel = faker.helpers.arrayElement(RACK_LABELS);
    const rackUnit = faker.number.int({ min: 1, max: 42 });
    const slot = `${rackLabel}-${String(rackUnit)}`;

    if (takenSlots.has(slot)) continue;
    takenSlots.add(slot);

    rows.push({
      assetTag: `SPC-${String(rows.length + 1).padStart(4, '0')}`,
      hostname: uniqueHostname(takenHostnames),
      model: faker.helpers.arrayElement(MODELS),
      rackLabel,
      rackUnit,
      status: faker.helpers.arrayElement(EQUIPMENT_STATUSES),
      installedAt: faker.date.past({ years: 4 }).toISOString().slice(0, 10),
    });
  }

  return rows;
}
