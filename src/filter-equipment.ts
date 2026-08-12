import type { Equipment, EquipmentStatus } from './types.ts';

/** Sentinel for "don't filter on this field". */
export const ANY = 'all';

export interface EquipmentFilters {
  search: string;
  status: EquipmentStatus | typeof ANY;
  /** A model name, or ANY. Not a union of the models, since they come from the data. */
  model: string;
}

export const EMPTY_FILTERS: EquipmentFilters = {
  search: '',
  status: ANY,
  model: ANY,
};

/**
 * Pure function so I can test it without rendering anything. Takes the list and
 * the filters, gives back a new list. Search looks at hostname, asset tag and
 * model, and ignores case so you don't have to type the capitals.
 */
export function filterEquipment(equipment: Equipment[], filters: EquipmentFilters): Equipment[] {
  const search = filters.search.trim().toLowerCase();

  return equipment.filter((item) => {
    if (filters.status !== ANY && item.status !== filters.status) {
      return false;
    }

    if (filters.model !== ANY && item.model !== filters.model) {
      return false;
    }

    if (search === '') {
      return true;
    }

    return (
      item.hostname.toLowerCase().includes(search) ||
      item.assetTag.toLowerCase().includes(search) ||
      item.model.toLowerCase().includes(search)
    );
  });
}

/**
 * The models actually present in the data, sorted, so the dropdown doesn't
 * offer options that would give you an empty table.
 */
export function modelsInUse(equipment: Equipment[]): string[] {
  return [...new Set(equipment.map((item) => item.model))].sort((a, b) => a.localeCompare(b));
}
