
import 'dotenv/config';
import { Pool } from 'pg';
import { buildRows } from '../src/build-rows.ts';

const ROW_COUNT = 50;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env first.');
  }

  const pool = new Pool({ connectionString });

  try {
    const rows = buildRows(ROW_COUNT);

    await pool.query('TRUNCATE TABLE equipment RESTART IDENTITY');

    for (const row of rows) {
      await pool.query(
        `INSERT INTO equipment
           (asset_tag, hostname, model, rack_label, rack_unit, status, installed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          row.assetTag,
          row.hostname,
          row.model,
          row.rackLabel,
          row.rackUnit,
          row.status,
          row.installedAt,
        ],
      );
    }

    const { rows: countRows } = await pool.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM equipment',
    );
    console.log(`Seeded ${countRows[0]?.count ?? '0'} rows.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
