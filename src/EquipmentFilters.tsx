import { EQUIPMENT_STATUSES } from './types.ts';
import { ANY } from './filter-equipment.ts';
import { selectFilters, useEquipmentUi } from './store.ts';

interface EquipmentFiltersProps {
  models: string[];
  shown: number;
  total: number;
}

export function EquipmentFilters({
  models,
  shown,
  total,
}: EquipmentFiltersProps): React.JSX.Element {
  // One selector each, so changing the search box doesn't re-render anything
  // that only cares about the status.
  const filters = useEquipmentUi(selectFilters);
  const setSearch = useEquipmentUi((state) => state.setSearch);
  const setStatus = useEquipmentUi((state) => state.setStatus);
  const setModel = useEquipmentUi((state) => state.setModel);
  const clearFilters = useEquipmentUi((state) => state.clearFilters);

  const isFiltered = shown !== total;

  return (
    <div className="filters">
      <input
        type="search"
        placeholder="Search hostname, asset tag or model"
        value={filters.search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />

      <select
        value={filters.status}
        onChange={(event) => {
          const value = event.target.value;
          setStatus(value === ANY ? ANY : (value as (typeof EQUIPMENT_STATUSES)[number]));
        }}
      >
        <option value={ANY}>All statuses</option>
        {EQUIPMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        value={filters.model}
        onChange={(event) => {
          setModel(event.target.value);
        }}
      >
        <option value={ANY}>All models</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <button type="button" onClick={clearFilters} disabled={!isFiltered}>
        Clear
      </button>

      <span className="count">
        {isFiltered ? `${String(shown)} of ${String(total)} items` : `${String(total)} items`}
      </span>
    </div>
  );
}
