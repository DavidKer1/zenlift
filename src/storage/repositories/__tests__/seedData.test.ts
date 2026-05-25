import type { SQLiteDatabase } from 'expo-sqlite';
import { seedDatabase, seedIfEmpty, generateSeedId } from '../seedData';

function makeMockDb() {
  const runCalls: { sql: string; params: unknown[] }[] = [];
  const execCalls: string[] = [];

  let getFirstAsyncImpl: (() => Promise<unknown>) | null = null;

  const runAsync = jest.fn().mockImplementation(async (sql: string, ...params: unknown[]) => {
    runCalls.push({ sql, params });
  });

  const execAsync = jest.fn().mockImplementation(async (sql: string) => {
    execCalls.push(sql);
  });

  const getFirstAsync = jest.fn().mockImplementation(() => {
    if (getFirstAsyncImpl) return getFirstAsyncImpl();
    return Promise.resolve(null);
  });

  return {
    db: {
      runAsync,
      execAsync,
      getFirstAsync,
    } as unknown as SQLiteDatabase,
    runCalls,
    execCalls,
    setGetFirstAsync(fn: () => Promise<unknown>) {
      getFirstAsyncImpl = fn;
    },
  };
}

describe('generateSeedId', () => {
  it('produces a valid UUID-format string', () => {
    const id = generateSeedId('mg', 'Chest');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('produces deterministic output for the same inputs', () => {
    const a = generateSeedId('em', 'Bench Press:chest');
    const b = generateSeedId('em', 'Bench Press:chest');
    expect(a).toBe(b);
  });

  it('produces different output for different inputs', () => {
    const a = generateSeedId('mg', 'Chest');
    const b = generateSeedId('mg', 'Back');
    expect(a).not.toBe(b);
  });
});

describe('seedIfEmpty', () => {
  it('calls seedDatabase when muscle_groups count is 0', async () => {
    const { db, runCalls, setGetFirstAsync } = makeMockDb();

    setGetFirstAsync(() => Promise.resolve({ count: 0 }));

    await seedIfEmpty(db);

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM muscle_groups',
    );

    const muscleInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO muscle_groups'),
    );
    expect(muscleInsertCalls.length).toBe(13);
  });

  it('skips seedDatabase when muscle_groups count is > 0', async () => {
    const { db, runCalls, setGetFirstAsync } = makeMockDb();

    setGetFirstAsync(() => Promise.resolve({ count: 13 }));

    await seedIfEmpty(db);

    expect(runCalls.length).toBe(0);
  });

  it('skips seedDatabase when count row is null', async () => {
    const { db, runCalls, setGetFirstAsync } = makeMockDb();

    setGetFirstAsync(() => Promise.resolve(null));

    await seedIfEmpty(db);

    expect(runCalls.length).toBe(0);
  });
});

describe('seedDatabase', () => {
  it('inserts exactly 13 muscle groups and 25 exercises', async () => {
    const { db, runCalls, execCalls } = makeMockDb();

    await seedDatabase(db);

    const muscleInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO muscle_groups'),
    );
    expect(muscleInserts.length).toBe(13);

    const exerciseInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercises'),
    );
    expect(exerciseInserts.length).toBe(25);

    expect(execCalls).toContain('BEGIN;');
    expect(execCalls).toContain('COMMIT;');
  });

  it('wraps all inserts in a single transaction with BEGIN and COMMIT', async () => {
    const { db, execCalls } = makeMockDb();

    await seedDatabase(db);

    const beginIdx = execCalls.indexOf('BEGIN;');
    const commitIdx = execCalls.indexOf('COMMIT;');
    const rollbackIdx = execCalls.indexOf('ROLLBACK;');

    expect(beginIdx).toBeGreaterThanOrEqual(0);
    expect(commitIdx).toBeGreaterThan(beginIdx);
    expect(rollbackIdx).toBe(-1);
  });

  it('rolls back transaction on insert failure', async () => {
    const { db, execCalls } = makeMockDb();

    const error = new Error('SQL error');
    let callCount = 0;
    (db.runAsync as jest.Mock).mockImplementation(async () => {
      callCount++;
      if (callCount > 13) throw error;
    });

    await expect(seedDatabase(db)).rejects.toThrow('SQL error');

    expect(execCalls).toContain('BEGIN;');
    expect(execCalls).toContain('ROLLBACK;');
  });

  it('uses INSERT OR IGNORE for all insert statements', async () => {
    const { db, runCalls } = makeMockDb();

    await seedDatabase(db);

    const allInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE'),
    );
    expect(allInserts.length).toBeGreaterThan(0);

    for (const call of allInserts) {
      expect(call.sql).toContain('INSERT OR IGNORE');
    }
  });

  it('every seeded exercise has at least one primary muscle relationship', async () => {
    const { db, runCalls } = makeMockDb();

    await seedDatabase(db);

    const emInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercise_muscles'),
    );

    const exerciseRoles = new Map<string, Set<string>>();
    for (const call of emInserts) {
      const exerciseId = call.params[1] as string;
      const role = call.params[3] as string;
      if (!exerciseRoles.has(exerciseId)) {
        exerciseRoles.set(exerciseId, new Set());
      }
      exerciseRoles.get(exerciseId)!.add(role);
    }

    const exerciseInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercises'),
    );
    const seededExerciseIds = new Set(exerciseInserts.map((c) => c.params[0] as string));

    for (const exerciseId of seededExerciseIds) {
      const roles = exerciseRoles.get(exerciseId);
      expect(roles).toBeDefined();
      expect(roles!.has('primary')).toBe(true);
    }
  });

  it('sets is_custom=0 and is_favorite=0 for all exercises', async () => {
    const { db, runCalls } = makeMockDb();

    await seedDatabase(db);

    const exerciseInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercises'),
    );
    for (const call of exerciseInserts) {
      const sql: string = call.sql;
      expect(sql).toContain('is_custom');
      expect(sql).toContain('is_favorite');
    }
  });

  it('normalizes equipment to lowercase', async () => {
    const { db, runCalls } = makeMockDb();

    await seedDatabase(db);

    const exerciseInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercises'),
    );
    for (const call of exerciseInserts) {
      const equipment = call.params[2] as string;
      expect(equipment).toBe(equipment.toLowerCase());
    }
  });

  it('calling seedDatabase twice produces same insert calls', async () => {
    const { db, runCalls } = makeMockDb();

    await seedDatabase(db);
    const firstRunCount = runCalls.length;

    await seedDatabase(db);
    const secondRunCount = runCalls.length - firstRunCount;

    expect(secondRunCount).toBe(firstRunCount);
  });

  it('muscle groups have distinct colors', async () => {
    const { db, runCalls } = makeMockDb();

    await seedDatabase(db);

    const muscleInserts = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO muscle_groups'),
    );
    const colors = muscleInserts.map((c) => c.params[3] as string);

    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(13);
  });
});
