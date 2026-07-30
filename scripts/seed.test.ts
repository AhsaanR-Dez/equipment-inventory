import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    poolCtor: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
    buildRows: vi.fn(),
  };
});

vi.mock('dotenv/config', () => ({}));

vi.mock('pg', () => ({
  Pool: class {
    constructor(options: unknown) {
      mocks.poolCtor(options);
    }
    query = mocks.query;
    end = mocks.end;
  },
}));

vi.mock('../src/build-rows.ts', () => ({
  buildRows: mocks.buildRows,
}));

const SAMPLE_ROW = {
  assetTag: 'SPC-0001',
  hostname: 'host-a',
  model: 'Dell PowerEdge R650',
  rackLabel: 'A1',
  rackUnit: 1,
  status: 'active',
  installedAt: '2024-01-01',
};

describe('scripts/seed.ts', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    mocks.poolCtor.mockClear();
    mocks.query.mockReset();
    mocks.end.mockReset().mockResolvedValue(undefined);
    mocks.buildRows.mockReset();
    process.env = { ...originalEnv };
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  test('exits with code 1 and logs the error when DATABASE_URL is not set', async () => {
    delete process.env.DATABASE_URL;

    await import('./seed.ts');

    await vi.waitFor(() => {
      expect(process.exit).toHaveBeenCalledWith(1);
    });
    expect(console.error).toHaveBeenCalledWith(
      new Error('DATABASE_URL is not set. Copy .env.example to .env first.'),
    );
    expect(mocks.poolCtor).not.toHaveBeenCalled();
  });

  test('truncates the table, inserts every built row, and logs the resulting count', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/inventory';
    const rows = [
      SAMPLE_ROW,
      {
        assetTag: 'SPC-0002',
        hostname: 'host-b',
        model: 'Cisco Catalyst 9300',
        rackLabel: 'A1',
        rackUnit: 2,
        status: 'maintenance',
        installedAt: '2023-05-10',
      },
    ];
    mocks.buildRows.mockReturnValue(rows);
    mocks.query.mockImplementation((sql: string) => {
      if (sql.includes('COUNT')) {
        return Promise.resolve({ rows: [{ count: '2' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    await import('./seed.ts');

    await vi.waitFor(() => {
      expect(mocks.end).toHaveBeenCalled();
    });

    expect(mocks.buildRows).toHaveBeenCalledWith(50);
    expect(mocks.poolCtor).toHaveBeenCalledWith({
      connectionString: 'postgres://user:pass@localhost:5432/inventory',
    });
    expect(mocks.query).toHaveBeenNthCalledWith(1, 'TRUNCATE TABLE equipment RESTART IDENTITY');
    expect(mocks.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO equipment'), [
      'SPC-0001',
      'host-a',
      'Dell PowerEdge R650',
      'A1',
      1,
      'active',
      '2024-01-01',
    ]);
    expect(mocks.query).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO equipment'), [
      'SPC-0002',
      'host-b',
      'Cisco Catalyst 9300',
      'A1',
      2,
      'maintenance',
      '2023-05-10',
    ]);
    expect(mocks.query).toHaveBeenNthCalledWith(4, 'SELECT COUNT(*)::text AS count FROM equipment');
    expect(console.log).toHaveBeenCalledWith('Seeded 2 rows.');
    expect(process.exit).not.toHaveBeenCalled();
  });

  test('logs "Seeded 0 rows." when the count query returns no rows', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/inventory';
    mocks.buildRows.mockReturnValue([]);
    mocks.query.mockImplementation((sql: string) => {
      if (sql.includes('COUNT')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    await import('./seed.ts');

    await vi.waitFor(() => {
      expect(mocks.end).toHaveBeenCalled();
    });

    expect(console.log).toHaveBeenCalledWith('Seeded 0 rows.');
  });

  test('still closes the pool and exits with code 1 when an insert fails', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/inventory';
    mocks.buildRows.mockReturnValue([SAMPLE_ROW]);
    const insertError = new Error('insert failed');
    mocks.query.mockImplementation((sql: string) => {
      if (sql.startsWith('INSERT')) {
        return Promise.reject(insertError);
      }
      return Promise.resolve({ rows: [] });
    });

    await import('./seed.ts');

    await vi.waitFor(() => {
      expect(mocks.end).toHaveBeenCalled();
    });
    await vi.waitFor(() => {
      expect(process.exit).toHaveBeenCalledWith(1);
    });
    expect(console.error).toHaveBeenCalledWith(insertError);
  });
});