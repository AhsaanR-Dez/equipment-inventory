import type { Equipment } from './types.ts';

/**
 * The JSON file is generated and not in git, so it could be missing, stale or
 * half written. Casting it with `as Equipment[]` would just tell TypeScript to
 * trust it, and then a bad file crashes the table instead of showing the error.
 */
function isEquipmentArray(value: unknown): value is Equipment[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null);
}

export async function fetchEquipment(signal?: AbortSignal): Promise<Equipment[]> {
  const response = await fetch('/equipment.json', signal ? { signal } : {});
  if (!response.ok) {
    throw new Error(`Request failed with ${String(response.status)}`);
  }

  const parsed: unknown = await response.json();
  if (!isEquipmentArray(parsed)) {
    throw new Error('equipment.json is not a list of equipment');
  }

  return parsed;
}
