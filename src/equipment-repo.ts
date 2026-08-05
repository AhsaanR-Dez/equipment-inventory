import type { Pool } from 'pg';
import { EQUIPMENT_STATUSES, type Equipment, type EquipmentStatus } from './types.ts';

interface EquipmentRow {
  id: number;
  asset_tag: string;
  hostname: string;
  model: string;
  rack_label: string;
  rack_unit: number;
  status: string;
  installed_at: Date;
}

/**
 * Postgres columns are snake_case and the app is camelCase, so the mapping
 * happens in one place instead of everywhere a row gets read. installed_at
 * comes back from pg as a Date, so it gets flattened to a YYYY-MM-DD string
 * for the JSON output.
 */
function toStatus(value: string): EquipmentStatus {
  const match = EQUIPMENT_STATUSES.find((status) => status === value);
  if (!match) {
    throw new Error(`Unexpected status in the database: ${value}`);
  }
  return match;
}

function toEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    assetTag: row.asset_tag,
    hostname: row.hostname,
    model: row.model,
    rackLabel: row.rack_label,
    rackUnit: row.rack_unit,
    status: toStatus(row.status),
    installedAt: row.installed_at.toISOString().slice(0, 10),
  };
}

export async function findAllEquipment(pool: Pool): Promise<Equipment[]> {
  const { rows } = await pool.query<EquipmentRow>(
    `SELECT id, asset_tag, hostname, model, rack_label, rack_unit, status, installed_at
       FROM equipment
      ORDER BY rack_label, rack_unit`,
  );

  return rows.map(toEquipment);
}
