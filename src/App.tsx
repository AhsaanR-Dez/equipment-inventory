import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EquipmentFilters } from './EquipmentFilters.tsx';
import { EquipmentTable } from './EquipmentTable.tsx';
import { fetchEquipment } from './fetch-equipment.ts';
import { filterEquipment, modelsInUse } from './filter-equipment.ts';
import { selectFilters, useEquipmentUi } from './store.ts';

export function App(): React.JSX.Element {
  const filters = useEquipmentUi(selectFilters);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['equipment'],
    queryFn: ({ signal }) => fetchEquipment(signal),
  });

  const equipment = useMemo(() => data ?? [], [data]);
  const models = useMemo(() => modelsInUse(equipment), [equipment]);
  const visible = useMemo(() => filterEquipment(equipment, filters), [equipment, filters]);

  return (
    <main>
      <h1>Equipment Inventory</h1>

      {isPending && <p>Loading...</p>}

      {isError && (
        <p>
          Could not load the data ({error.message}). Run <code>npm run db:seed</code> and{' '}
          <code>npm run db:dump</code>, then refresh.
        </p>
      )}

      {!isPending && !isError && (
        <>
          <EquipmentFilters models={models} shown={visible.length} total={equipment.length} />
          <EquipmentTable equipment={visible} />
        </>
      )}
    </main>
  );
}
