import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Pool } from 'pg';
import { connectionStringFromEnv } from '../src/db-config.ts';
import { findAllEquipment } from '../src/equipment-repo.ts';

const OUTPUT_PATH = resolve(import.meta.dirname, '..', 'public', 'equipment.json');

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: connectionStringFromEnv() });

  try {
    const equipment = await findAllEquipment(pool);

    if (equipment.length === 0) {
      console.warn('No rows found. Run npm run db:seed first.');
    }

    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, `${JSON.stringify(equipment, null, 2)}\n`, 'utf8');

    console.log(`Wrote ${String(equipment.length)} rows to public/equipment.json`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
