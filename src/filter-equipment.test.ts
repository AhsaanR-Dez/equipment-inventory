import { describe, expect, it } from 'vitest';
import { ANY, EMPTY_FILTERS, filterEquipment, modelsInUse } from './filter-equipment.ts';
import type { EquipmentFilters } from './filter-equipment.ts';
import type { Equipment } from './types.ts';

/**
 * A fixed list instead of buildRows, because buildRows is random and I want the
 * tests to check the same thing every time they run.
 */
const SAMPLE: Equipment[] = [
  {
    id: 1,
    assetTag: 'SPC-0001',
    hostname: 'DESKTOP-8KJ2M9P',
    model: 'Dell Latitude 3120 (2021)',
    rackLabel: 'A1',
    rackUnit: 1,
    status: 'active',
    installedAt: '2024-01-01',
  },
  {
    id: 2,
    assetTag: 'SPC-0002',
    hostname: 'CORP-LAP-M7421',
    model: 'Lenovo ThinkPad T460s (2016)',
    rackLabel: 'A1',
    rackUnit: 2,
    status: 'maintenance',
    installedAt: '2023-06-15',
  },
  {
    id: 3,
    assetTag: 'SPC-0003',
    hostname: 'NY-FIN-WS04',
    model: 'Dell Latitude 3120 (2021)',
    rackLabel: 'B2',
    rackUnit: 10,
    status: 'decommissioned',
    installedAt: '2022-03-09',
  },
];

function filters(overrides: Partial<EquipmentFilters> = {}): EquipmentFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

describe('filterEquipment', () => {
  it('returns everything when no filters are set', () => {
    expect(filterEquipment(SAMPLE, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('filters by status', () => {
    const result = filterEquipment(SAMPLE, filters({ status: 'active' }));
    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it('filters by model', () => {
    const result = filterEquipment(SAMPLE, filters({ model: 'Dell Latitude 3120 (2021)' }));
    expect(result.map((item) => item.id)).toEqual([1, 3]);
  });

  it('searches the hostname', () => {
    const result = filterEquipment(SAMPLE, filters({ search: 'NY-FIN' }));
    expect(result.map((item) => item.id)).toEqual([3]);
  });

  it('searches the asset tag', () => {
    const result = filterEquipment(SAMPLE, filters({ search: 'SPC-0002' }));
    expect(result.map((item) => item.id)).toEqual([2]);
  });

  it('searches the model', () => {
    const result = filterEquipment(SAMPLE, filters({ search: 'thinkpad' }));
    expect(result.map((item) => item.id)).toEqual([2]);
  });

  it('ignores case when searching', () => {
    const lower = filterEquipment(SAMPLE, filters({ search: 'desktop' }));
    const upper = filterEquipment(SAMPLE, filters({ search: 'DESKTOP' }));
    expect(lower).toEqual(upper);
    expect(lower).toHaveLength(1);
  });

  it('ignores spaces around the search text', () => {
    const result = filterEquipment(SAMPLE, filters({ search: '   NY-FIN   ' }));
    expect(result.map((item) => item.id)).toEqual([3]);
  });

  it('applies the filters together, not one or the other', () => {
    // Two items are Latitudes, but only one of those is active.
    const result = filterEquipment(
      SAMPLE,
      filters({ model: 'Dell Latitude 3120 (2021)', status: 'active' }),
    );
    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it('returns nothing when the filters match nothing', () => {
    const result = filterEquipment(SAMPLE, filters({ search: 'nothing-like-this' }));
    expect(result).toEqual([]);
  });

  it('does not change the list it was given', () => {
    const before = [...SAMPLE];
    filterEquipment(SAMPLE, filters({ status: 'active' }));
    expect(SAMPLE).toEqual(before);
  });

  it('copes with an empty list', () => {
    expect(filterEquipment([], filters({ search: 'anything' }))).toEqual([]);
  });

  it('treats ANY as no filter at all', () => {
    const result = filterEquipment(SAMPLE, filters({ status: ANY, model: ANY }));
    expect(result).toHaveLength(3);
  });
});

describe('modelsInUse', () => {
  it('lists each model once, sorted', () => {
    expect(modelsInUse(SAMPLE)).toEqual([
      'Dell Latitude 3120 (2021)',
      'Lenovo ThinkPad T460s (2016)',
    ]);
  });

  it('returns nothing for an empty list', () => {
    expect(modelsInUse([])).toEqual([]);
  });
});
