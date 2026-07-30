export const EQUIPMENT_STATUSES = ['active', 'maintenance', 'decommissioned'] as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface Equipment {
  id: number;
  assetTag: string;
  hostname: string;
  model: string;
  rackLabel: string;
  rackUnit: number;
  status: EquipmentStatus;
  installedAt: string;
}
