import 'dotenv/config';
import { Pool, type PoolClient } from 'pg';
import { buildRows } from '../src/build-rows.ts';
import { connectionStringFromEnv } from '../src/db-config.ts';

const ROW_COUNT = 50;

async function seed(client: PoolClient, count: number): Promise<number> {
  const rows = buildRows(count);

  await client.query('BEGIN');
  try {
    await client.query('TRUNCATE TABLE equipment RESTART IDENTITY');

    for (const row of rows) {
      await client.query(
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

    const { rows: countRows } = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM equipment',
    );

    await client.query('COMMIT');
    return Number(countRows[0]?.count ?? '0');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: connectionStringFromEnv() });

  try {
    const client = await pool.connect();
    try {
      const inserted = await seed(client, ROW_COUNT);
      console.log(`Seeded ${String(inserted)} rows.`);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
