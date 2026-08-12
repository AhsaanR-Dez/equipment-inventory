import { selectSelectedId, useEquipmentUi } from './store.ts';
import type { Equipment } from './types.ts';

interface EquipmentTableProps {
  equipment: Equipment[];
}

export function EquipmentTable({ equipment }: EquipmentTableProps): React.JSX.Element {
  const selectedId = useEquipmentUi(selectSelectedId);
  const setSelectedId = useEquipmentUi((state) => state.setSelectedId);

  if (equipment.length === 0) {
    return <p>Nothing matches those filters.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Asset tag</th>
          <th>Hostname</th>
          <th>Model</th>
          <th>Rack</th>
          <th className="numeric">Unit</th>
          <th>Status</th>
          <th>Installed</th>
        </tr>
      </thead>
      <tbody>
        {equipment.map((item) => (
          <tr
            key={item.id}
            className={item.id === selectedId ? 'selected' : undefined}
            onClick={() => {
              // Clicking the selected row again clears it.
              setSelectedId(item.id === selectedId ? null : item.id);
            }}
          >
            <td>{item.assetTag}</td>
            <td>{item.hostname}</td>
            <td>{item.model}</td>
            <td>{item.rackLabel}</td>
            <td className="numeric">{item.rackUnit}</td>
            <td>{item.status}</td>
            <td>{item.installedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
