import { useEffect, useState } from 'react';
import { EquipmentTable } from './EquipmentTable.tsx';
import type { Equipment } from './types.ts';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; equipment: Equipment[] };

export function App(): React.JSX.Element {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        const response = await fetch('/equipment.json', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with ${String(response.status)}`);
        }
        const equipment = (await response.json()) as Equipment[];
        setState({ status: 'ready', equipment });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    }

    void load();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main>
      <h1>Equipment Inventory</h1>

      {state.status === 'loading' && <p>Loading...</p>}

      {state.status === 'error' && (
        <p>
          Could not load the data ({state.message}). Run <code>npm run db:seed</code> and{' '}
          <code>npm run db:dump</code>, then refresh.
        </p>
      )}

      {state.status === 'ready' && <EquipmentTable equipment={state.equipment} />}
    </main>
  );
}
