import type { SQLiteDatabase } from 'expo-sqlite';

import { WorkoutRepo } from '../workoutRepo';
import type { WorkoutSession } from '@/domain/entities';

type QueryCall = { sql: string; params: unknown[] };

function mockDb() {
  const calls: { getAllAsync: QueryCall[]; getFirstAsync: QueryCall[] } = {
    getAllAsync: [],
    getFirstAsync: [],
  };

  let getAllAsyncImpl = (_sql: string, ..._params: unknown[]) =>
    Promise.resolve([] as unknown[]);
  let getFirstAsyncImpl = (_sql: string, ..._params: unknown[]) =>
    Promise.resolve(null as unknown);

  return {
    getAllAsync: jest.fn((sql: string, ...params: unknown[]) => {
      calls.getAllAsync.push({ sql, params });
      return getAllAsyncImpl(sql, ...params);
    }),
    getFirstAsync: jest.fn((sql: string, ...params: unknown[]) => {
      calls.getFirstAsync.push({ sql, params });
      return getFirstAsyncImpl(sql, ...params);
    }),
    runAsync: jest.fn().mockResolvedValue(undefined),
    calls,
    setGetAllAsync(fn: typeof getAllAsyncImpl) {
      getAllAsyncImpl = fn;
    },
    setGetFirstAsync(fn: typeof getFirstAsyncImpl) {
      getFirstAsyncImpl = fn;
    },
  };
}

function makeLatestWorkout(
  overrides: Partial<WorkoutSession> & {
    routine_name?: string | null;
    routine_day_name?: string | null;
  } = {},
) {
  return {
    id: 'ws-latest',
    routine_id: 'routine-1',
    routine_day_id: 'day-1',
    name: 'Push - Chest',
    started_at: '2026-05-24T10:00:00.000Z',
    ended_at: '2026-05-24T11:00:00.000Z',
    duration_seconds: 3600,
    status: 'completed',
    notes: null,
    created_at: '2026-05-24T10:00:00.000Z',
    updated_at: null,
    routine_name: 'Push Program',
    routine_day_name: 'Chest Day',
    ...overrides,
  };
}

describe('WorkoutRepo', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-25T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getHomeCalendarSummary', () => {
    it('returns completed activity dates within the requested month window', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync((sql: string, ...params: unknown[]) => {
        expect(sql).toContain("status = 'completed'");
        expect(sql).toContain('started_at >= ?');
        expect(sql).toContain('started_at <= ?');
        expect(params).toHaveLength(2);
        return Promise.resolve([
          { date: '2026-03-02', session_count: 1 },
          { date: '2026-05-24', session_count: 2 },
        ]);
      });
      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        if (sql.includes('LEFT JOIN routines')) {
          expect(params).toEqual([1]);
          return Promise.resolve(makeLatestWorkout());
        }
        return Promise.resolve({ count: 4 });
      });

      const summary = await repo.getHomeCalendarSummary(3);

      expect(summary.activity_dates).toEqual([
        { date: '2026-03-02', session_count: 1 },
        { date: '2026-05-24', session_count: 2 },
      ]);
      expect(summary.latest_workout?.display_label).toBe('Push Program - Chest Day');
      expect(summary.latest_workout?.repeat_params).toEqual({
        routineId: 'routine-1',
        routineDayId: 'day-1',
        name: 'Push Program - Chest Day',
      });
    });

    it('excludes active and cancelled sessions from summary queries', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync(() => Promise.resolve([]));
      mock.setGetFirstAsync((sql: string) => {
        if (sql.includes('LEFT JOIN routines')) {
          return Promise.resolve(makeLatestWorkout());
        }
        return Promise.resolve({ count: 2 });
      });

      await repo.getHomeCalendarSummary();

      const workoutSessionQueries = [
        ...mock.calls.getAllAsync,
        ...mock.calls.getFirstAsync,
      ].filter((call) => call.sql.includes('workout_sessions'));
      expect(workoutSessionQueries.length).toBeGreaterThan(0);
      for (const call of workoutSessionQueries) {
        expect(call.sql).toContain("status = 'completed'");
        expect(call.sql).not.toContain("status IN ('completed', 'cancelled')");
      }
    });

    it('counts frequency by latest routine day first', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync(() => Promise.resolve([]));
      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        if (sql.includes('LEFT JOIN routines')) return Promise.resolve(makeLatestWorkout());
        expect(sql).toContain('routine_day_id = ?');
        expect(params).toEqual(['day-1']);
        return Promise.resolve({ count: 5 });
      });

      const summary = await repo.getHomeCalendarSummary();

      expect(summary.latest_workout?.frequency_kind).toBe('routine_day');
      expect(summary.latest_workout?.frequency_count).toBe(5);
    });

    it('counts frequency by routine when latest workout has no routine day', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync(() => Promise.resolve([]));
      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        if (sql.includes('LEFT JOIN routines')) {
          return Promise.resolve(
            makeLatestWorkout({ routine_day_id: null, routine_day_name: null }),
          );
        }
        expect(sql).toContain('routine_id = ?');
        expect(params).toEqual(['routine-1']);
        return Promise.resolve({ count: 3 });
      });

      const summary = await repo.getHomeCalendarSummary();

      expect(summary.latest_workout?.frequency_kind).toBe('routine');
      expect(summary.latest_workout?.frequency_count).toBe(3);
      expect(summary.latest_workout?.display_label).toBe('Push Program');
    });

    it('counts freestyle frequency by non-empty session name', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync(() => Promise.resolve([]));
      mock.setGetFirstAsync((sql: string, ...params: unknown[]) => {
        if (sql.includes('LEFT JOIN routines')) {
          return Promise.resolve(
            makeLatestWorkout({
              routine_id: null,
              routine_day_id: null,
              routine_name: null,
              routine_day_name: null,
              name: 'Arms freestyle',
            }),
          );
        }
        expect(sql).toContain('name = ?');
        expect(params).toEqual(['Arms freestyle']);
        return Promise.resolve({ count: 2 });
      });

      const summary = await repo.getHomeCalendarSummary();

      expect(summary.latest_workout?.frequency_kind).toBe('session_name');
      expect(summary.latest_workout?.frequency_count).toBe(2);
      expect(summary.latest_workout?.is_repeatable).toBe(false);
      expect(summary.latest_workout?.repeat_params).toBeNull();
    });

    it('returns a non-repeatable fallback when latest workout has no identity', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync(() => Promise.resolve([]));
      mock.setGetFirstAsync((sql: string) => {
        if (sql.includes('LEFT JOIN routines')) {
          return Promise.resolve(
            makeLatestWorkout({
              routine_id: null,
              routine_day_id: null,
              routine_name: null,
              routine_day_name: null,
              name: null,
            }),
          );
        }
        return Promise.resolve({ count: 7 });
      });

      const summary = await repo.getHomeCalendarSummary();

      expect(summary.latest_workout?.display_label).toBe('Workout session');
      expect(summary.latest_workout?.frequency_kind).toBe('total');
      expect(summary.latest_workout?.frequency_count).toBe(7);
      expect(summary.latest_workout?.is_repeatable).toBe(false);
    });

    it('returns empty latest workout when no completed workouts exist', async () => {
      const mock = mockDb();
      const repo = new WorkoutRepo(mock as unknown as SQLiteDatabase);

      mock.setGetAllAsync(() => Promise.resolve([]));
      mock.setGetFirstAsync(() => Promise.resolve(null));

      const summary = await repo.getHomeCalendarSummary();

      expect(summary).toEqual({ activity_dates: [], latest_workout: null });
    });
  });
});