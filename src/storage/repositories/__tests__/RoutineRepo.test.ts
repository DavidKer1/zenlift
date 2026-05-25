import { RoutineRepo } from '../RoutineRepo';
import type { Routine, RoutineDay, RoutineExercise } from '@/domain/entities';

function mockDb() {
  const store = {
    getAllAsync: [] as unknown[],
    getFirstAsync: null as unknown,
    runAsyncCalls: [] as { sql: string; params: unknown[] }[],
  };

  let getAllAsyncImpl = (_sql: string, ..._params: unknown[]) =>
    Promise.resolve(store.getAllAsync as unknown[]);

  let getFirstAsyncImpl = (_sql: string, ..._params: unknown[]) =>
    Promise.resolve(store.getFirstAsync as unknown);

  const runAsync = jest
    .fn()
    .mockImplementation(async (sql: string, ...params: unknown[]) => {
      store.runAsyncCalls.push({ sql, params });
      return { lastInsertRowId: 1, changes: 1 };
    });

  const getAllAsync = jest
    .fn()
    .mockImplementation((sql: string, ...params: unknown[]) =>
      getAllAsyncImpl(sql, ...params),
    );

  const getFirstAsync = jest
    .fn()
    .mockImplementation((sql: string, ...params: unknown[]) =>
      getFirstAsyncImpl(sql, ...params),
    );

  const withTransactionAsync = jest
    .fn()
    .mockImplementation(async (cb: () => Promise<void>) => cb());

  return {
    runAsync,
    getAllAsync,
    getFirstAsync,
    withTransactionAsync,
    store,
    setGetAllAsync(fn: typeof getAllAsyncImpl) {
      getAllAsyncImpl = fn;
    },
    setGetFirstAsync(fn: typeof getFirstAsyncImpl) {
      getFirstAsyncImpl = fn;
    },
  };
}

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: 'r-1',
    name: 'Push Day',
    description: 'Chest and triceps',
    goal: 'Strength',
    is_archived: 0,
    sort_order: 0,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeDay(overrides: Partial<RoutineDay> = {}): RoutineDay {
  return {
    id: 'd-1',
    routine_id: 'r-1',
    name: 'Day 1',
    day_of_week: 1,
    sort_order: 0,
    ...overrides,
  };
}

function makeExercise(overrides: Partial<RoutineExercise> = {}): RoutineExercise {
  return {
    id: 're-1',
    routine_day_id: 'd-1',
    exercise_id: 'ex-1',
    target_sets: 4,
    target_reps_min: 8,
    target_reps_max: 12,
    rest_seconds: 90,
    notes: null,
    sort_order: 0,
    ...overrides,
  };
}

function makeJoinRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 're-1',
    routine_day_id: 'd-1',
    exercise_id: 'ex-1',
    target_sets: 4,
    target_reps_min: 8,
    target_reps_max: 12,
    rest_seconds: 90,
    notes: null,
    sort_order: 0,
    ex_id: 'ex-1',
    ex_name: 'Bench Press',
    ex_equipment: 'barbell',
    ex_category: 'strength',
    ex_is_custom: 0,
    ex_is_favorite: 0,
    ex_notes: null,
    ex_created_at: null,
    ex_updated_at: null,
    ...overrides,
  };
}

describe('RoutineRepo', () => {
  describe('getFullRoutine', () => {
    it('returns correctly nested data', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      const routine = makeRoutine();
      const day1 = makeDay({ id: 'd-1' });
      const day2 = makeDay({ id: 'd-2', sort_order: 1 });

      const join1 = makeJoinRow({ id: 're-1', routine_day_id: 'd-1', sort_order: 0 });
      const join2 = makeJoinRow({
        id: 're-2',
        routine_day_id: 'd-1',
        sort_order: 1,
        ex_id: 'ex-2',
        ex_name: 'Tricep Pushdown',
        ex_equipment: 'cable',
      });
      const join3 = makeJoinRow({ id: 're-3', routine_day_id: 'd-2', sort_order: 0 });

      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        expect(sql).toContain('SELECT * FROM routines WHERE id');
        expect(sql).toContain('?');
        if (params[0] === 'r-1') return Promise.resolve(routine);
        return Promise.resolve(null);
      });

      let getAllCallCount = 0;
      mock.setGetAllAsync((sql: string, ...params: unknown[]) => {
        getAllCallCount++;
        if (sql.includes('FROM routine_days')) {
          expect(params[0]).toBe('r-1');
          return Promise.resolve([day1, day2]);
        }
        if (sql.includes('JOIN exercises')) {
          if (params[0] === 'd-1') return Promise.resolve([join1, join2]);
          if (params[0] === 'd-2') return Promise.resolve([join3]);
        }
        return Promise.resolve([]);
      });

      const result = await repo.getFullRoutine('r-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('r-1');
      expect(result!.days).toHaveLength(2);

      const fullDay1 = result!.days[0];
      expect(fullDay1.id).toBe('d-1');
      expect(fullDay1.exercises).toHaveLength(2);
      expect(fullDay1.exercises[0].exercise.name).toBe('Bench Press');
      expect(fullDay1.exercises[0].exercise.equipment).toBe('barbell');
      expect(fullDay1.exercises[1].exercise.name).toBe('Tricep Pushdown');

      const fullDay2 = result!.days[1];
      expect(fullDay2.id).toBe('d-2');
      expect(fullDay2.exercises).toHaveLength(1);

      expect(getAllCallCount).toBe(3);
    });

    it('returns null for non-existent routine', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      mock.setGetFirstAsync(() => Promise.resolve(null));

      const result = await repo.getFullRoutine('nonexistent');
      expect(result).toBeNull();
    });

    it('returns empty days array for routine with no days', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      const routine = makeRoutine();
      mock.setGetFirstAsync((_sql: string, ..._params: unknown[]) =>
        Promise.resolve(routine),
      );
      mock.setGetAllAsync((sql: string) => {
        if (sql.includes('FROM routine_days')) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      const result = await repo.getFullRoutine('r-1');
      expect(result).not.toBeNull();
      expect(result!.days).toEqual([]);
    });
  });

  describe('duplicate', () => {
    it('copies entire tree with new UUIDs', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      const original = makeRoutine({
        id: 'r-orig',
        description: 'Original',
        goal: 'Hypertrophy',
        sort_order: 2,
      });
      const day1 = makeDay({ id: 'd-orig-1', routine_id: 'r-orig', sort_order: 0 });
      const day2 = makeDay({ id: 'd-orig-2', routine_id: 'r-orig', sort_order: 1 });
      const ex1 = makeExercise({
        id: 're-orig-1',
        routine_day_id: 'd-orig-1',
        target_sets: 5,
        target_reps_min: 6,
        target_reps_max: 8,
        rest_seconds: 120,
        sort_order: 0,
      });
      const ex2 = makeExercise({
        id: 're-orig-2',
        routine_day_id: 'd-orig-1',
        exercise_id: 'ex-2',
        target_sets: 3,
        target_reps_min: 10,
        target_reps_max: 15,
        sort_order: 1,
      });
      const ex3 = makeExercise({
        id: 're-orig-3',
        routine_day_id: 'd-orig-2',
        sort_order: 0,
      });

      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        if (sql.includes('FROM routines WHERE id')) {
          if (params[0] === 'r-orig') return Promise.resolve(original);
          const newRoutineId = params[0] as string;
          return Promise.resolve(
            makeRoutine({ id: newRoutineId, name: 'Copied', description: 'Original', goal: 'Hypertrophy', sort_order: 2 }),
          );
        }
        if (sql.includes('FROM routine_days WHERE id')) {
          return Promise.resolve({ ...day1, id: params[0] as string });
        }
        return Promise.resolve(null);
      });

      mock.setGetAllAsync((sql: string, ...params: unknown[]) => {

        if (sql.includes('FROM routine_days') && !sql.includes('day_of_week')) {
          return Promise.resolve([day1, day2]);
        }
        if (sql.includes('FROM routine_exercises') && !sql.includes('JOIN')) {
          if (params[0] === 'd-orig-1') return Promise.resolve([ex1, ex2]);
          if (params[0] === 'd-orig-2') return Promise.resolve([ex3]);
        }
        if (sql.includes('JOIN exercises')) {
          const join1 = makeJoinRow({
            id: 'new-re-1',
            routine_day_id: params[0] as string,
            sort_order: 0,
            target_sets: 5,
            target_reps_min: 6,
            target_reps_max: 8,
            rest_seconds: 120,
          });
          const join2 = makeJoinRow({
            id: 'new-re-2',
            routine_day_id: params[0] as string,
            sort_order: 1,
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 15,
            ex_id: 'ex-2',
          });
          return Promise.resolve([join1, join2]);
        }
        return Promise.resolve([]);
      });

      const result = await repo.duplicate('r-orig', 'Copied');

      expect(mock.withTransactionAsync).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result.id).not.toBe('r-orig');
      expect(result.name).toBe('Copied');

      const insertCalls = (
        mock.runAsync as jest.Mock
      ).mock.calls.filter((c: unknown[]) => (c[0] as string).includes('INSERT'));

      const routineInsert = insertCalls.find((c: unknown[]) =>
        (c[0] as string).includes('INSERT INTO routines'),
      );
      expect(routineInsert).toBeDefined();
      expect(routineInsert![2]).toBe('Copied');

      const dayInserts = insertCalls.filter((c: unknown[]) =>
        (c[0] as string).includes('INSERT INTO routine_days'),
      );
      expect(dayInserts).toHaveLength(2);

      const exInserts = insertCalls.filter((c: unknown[]) =>
        (c[0] as string).includes('INSERT INTO routine_exercises'),
      );
      expect(exInserts).toHaveLength(3);

      const dayIds = new Set(dayInserts.map((c: unknown[]) => c[1]));
      expect(dayIds.size).toBe(2);
      expect(dayIds.has('d-orig-1')).toBe(false);
      expect(dayIds.has('d-orig-2')).toBe(false);

      const exIds = new Set(exInserts.map((c: unknown[]) => c[1]));
      expect(exIds.size).toBe(3);
    });

    it('preserves exercise configuration', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        if (sql.includes('FROM routines WHERE id') && params[0] === 'r-orig') {
          return Promise.resolve(makeRoutine({ id: 'r-orig' }));
        }
        if (sql.includes('FROM routines WHERE id')) {
          return Promise.resolve(makeRoutine({ id: params[0] as string, name: 'Copy' }));
        }
        return Promise.resolve(makeDay({ id: params[0] as string }));
      });

      const ex = makeExercise({
        id: 're-orig-1',
        routine_day_id: 'd-orig-1',
        target_sets: 3,
        target_reps_min: 6,
        target_reps_max: 8,
        rest_seconds: 90,
        notes: 'Go slow',
        sort_order: 5,
      });

      mock.setGetAllAsync((sql: string) => {
        if (sql.includes('FROM routine_days') && !sql.includes('day_of_week')) {
          return Promise.resolve([makeDay({ id: 'd-orig-1', routine_id: 'r-orig' })]);
        }
        if (sql.includes('FROM routine_exercises') && !sql.includes('JOIN')) {
          return Promise.resolve([ex]);
        }
        if (sql.includes('JOIN exercises')) {
          return Promise.resolve([
            makeJoinRow({
              id: 'new-re-1',
              target_sets: 3,
              target_reps_min: 6,
              target_reps_max: 8,
              rest_seconds: 90,
              notes: 'Go slow',
              sort_order: 5,
            }),
          ]);
        }
        return Promise.resolve([]);
      });

      await repo.duplicate('r-orig', 'Copy');

      const exInserts = (
        mock.runAsync as jest.Mock
      ).mock.calls.filter((c: unknown[]) =>
        (c[0] as string).includes('INSERT INTO routine_exercises'),
      );
      const exInsert = exInserts[0];
      expect(exInsert[3]).toBe('ex-1');
      expect(exInsert[4]).toBe(3);
      expect(exInsert[5]).toBe(6);
      expect(exInsert[6]).toBe(8);
      expect(exInsert[7]).toBe(90);
      expect(exInsert[8]).toBe('Go slow');
      expect(exInsert[9]).toBe(5);
    });

    it('throws when source routine not found', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      mock.setGetFirstAsync(() => Promise.resolve(null));

      await expect(repo.duplicate('nonexistent', 'Copy')).rejects.toThrow(
        'Routine nonexistent not found',
      );
    });
  });

  describe('reorderDays', () => {
    it('updates sortOrder correctly', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.reorderDays('r-1', ['d-3', 'd-1', 'd-2']);

      expect(mock.withTransactionAsync).toHaveBeenCalled();

      const updateCalls = (mock.runAsync as jest.Mock).mock.calls.filter(
        (c: unknown[]) => (c[0] as string).includes('UPDATE routine_days'),
      );

      expect(updateCalls).toHaveLength(3);
      expect(updateCalls[0][1]).toBe(0);
      expect(updateCalls[0][2]).toBe('d-3');
      expect(updateCalls[1][1]).toBe(1);
      expect(updateCalls[1][2]).toBe('d-1');
      expect(updateCalls[2][1]).toBe(2);
      expect(updateCalls[2][2]).toBe('d-2');
    });
  });

  describe('reorderExercises', () => {
    it('updates sortOrder correctly', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.reorderExercises('d-1', ['re-c', 're-a', 're-b']);

      expect(mock.withTransactionAsync).toHaveBeenCalled();

      const updateCalls = (mock.runAsync as jest.Mock).mock.calls.filter(
        (c: unknown[]) => (c[0] as string).includes('UPDATE routine_exercises'),
      );

      expect(updateCalls).toHaveLength(3);
      expect(updateCalls[0][1]).toBe(0);
      expect(updateCalls[0][2]).toBe('re-c');
      expect(updateCalls[1][1]).toBe(1);
      expect(updateCalls[1][2]).toBe('re-a');
      expect(updateCalls[2][1]).toBe(2);
      expect(updateCalls[2][2]).toBe('re-b');
    });
  });

  describe('delete', () => {
    it('deletes routine via CASCADE FK', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.delete('r-1');

      const deleteCalls = (mock.runAsync as jest.Mock).mock.calls.filter(
        (c: unknown[]) => (c[0] as string).includes('DELETE'),
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][0]).toContain('DELETE FROM routines');
      expect(deleteCalls[0][1]).toBe('r-1');
    });

    it('deletes day via CASCADE FK', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.deleteDay('d-1');

      const deleteCalls = (mock.runAsync as jest.Mock).mock.calls.filter(
        (c: unknown[]) => (c[0] as string).includes('DELETE'),
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][0]).toContain('DELETE FROM routine_days');
      expect(deleteCalls[0][1]).toBe('d-1');
    });

    it('deletes exercise by id', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.deleteExercise('re-1');

      const deleteCalls = (mock.runAsync as jest.Mock).mock.calls.filter(
        (c: unknown[]) => (c[0] as string).includes('DELETE'),
      );
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0][0]).toContain('DELETE FROM routine_exercises');
      expect(deleteCalls[0][1]).toBe('re-1');
    });
  });

  describe('getAll', () => {
    it('filters archived routines by default', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      mock.setGetAllAsync((sql: string) => {
        if (sql.includes('is_archived = 0')) return Promise.resolve([makeRoutine()]);
        return Promise.resolve([]);
      });

      const result = await repo.getAll();
      expect(result).toHaveLength(1);
      expect(mock.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('is_archived = 0'),
      );
    });

    it('includes archived routines when requested', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      const active = makeRoutine({ id: 'r-1' });
      const archived = makeRoutine({ id: 'r-2', is_archived: 1 });

      mock.setGetAllAsync((sql: string) => {
        if (sql.includes('is_archived')) return Promise.resolve([active]);
        return Promise.resolve([active, archived]);
      });

      const result = await repo.getAll({ includeArchived: true });
      expect(result).toHaveLength(2);
      expect(mock.getAllAsync).toHaveBeenCalledWith(
        expect.not.stringContaining('is_archived'),
      );
    });
  });

  describe('create', () => {
    it('creates routine with UUID and timestamps', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      const created = makeRoutine({ name: 'Push Day', description: 'Chest', goal: 'Strength' });
      mock.setGetFirstAsync(() => Promise.resolve(created));

      const result = await repo.create({
        name: 'Push Day',
        description: 'Chest',
        goal: 'Strength',
      });

      expect(result.name).toBe('Push Day');

      const insertCall = (mock.runAsync as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes('INSERT INTO routines'),
      );
      expect(insertCall).toBeDefined();
      expect(insertCall[2]).toBe('Push Day');
      expect(typeof insertCall[1]).toBe('string');
      expect(insertCall[1].length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('builds dynamic SET clause parametrized', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.update('r-1', { name: 'New Name', description: 'Updated' });

      const updateCall = (mock.runAsync as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes('UPDATE routines'),
      );
      expect(updateCall).toBeDefined();
      expect(updateCall[0]).toContain('name = ?');
      expect(updateCall[0]).toContain('description = ?');
      expect(updateCall[0]).toContain('updated_at = ?');
      expect(updateCall[1]).toBe('New Name');
      expect(updateCall[2]).toBe('Updated');
    });
  });

  describe('archive/unarchive', () => {
    it('sets is_archived = 1', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.archive('r-1');

      const call = (mock.runAsync as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes('is_archived = 1'),
      );
      expect(call).toBeDefined();
    });

    it('sets is_archived = 0', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      await repo.unarchive('r-1');

      const call = (mock.runAsync as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes('is_archived = 0'),
      );
      expect(call).toBeDefined();
    });
  });

  describe('createExercise', () => {
    it('creates exercise with correct FK', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      mock.setGetFirstAsync((_sql: string, ..._params: unknown[]) =>
        Promise.resolve(makeExercise({ id: 'new-re', routine_day_id: 'd-1' })),
      );

      const result = await repo.createExercise('d-1', {
        exerciseId: 'ex-99',
        targetSets: 5,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      });

      expect(result.routine_day_id).toBe('d-1');

      const insertCall = (mock.runAsync as jest.Mock).mock.calls.find(
        (c: unknown[]) => (c[0] as string).includes('INSERT INTO routine_exercises'),
      );
      expect(insertCall).toBeDefined();
      expect(insertCall[1]).toBeDefined();
      expect(insertCall[2]).toBe('d-1');
      expect(insertCall[3]).toBe('ex-99');
    });
  });

  describe('getExercises', () => {
    it('returns exercises with JOIN data', async () => {
      const mock = mockDb();
      const repo = new RoutineRepo(mock as never);

      const join = makeJoinRow();
      mock.setGetAllAsync(() => Promise.resolve([join]));

      const exercises = await repo.getExercises('d-1');

      expect(exercises).toHaveLength(1);
      expect(exercises[0].exercise.name).toBe('Bench Press');
      expect(exercises[0].exercise.equipment).toBe('barbell');
      expect(exercises[0].exercise.id).toBe('ex-1');
      expect(exercises[0].target_sets).toBe(4);
    });
  });
});
