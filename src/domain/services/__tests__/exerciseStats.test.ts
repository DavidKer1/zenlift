import { getBestMetrics, getSessionHistory, getProgressData } from '../exerciseStats';
import type { SetLog, SetType } from '@/domain/entities';
import type { SessionSets } from '../exerciseStats';

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'set-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 100,
    reps: 10,
    set_type: 'normal' as SetType,
    is_completed: 1,
    completed_at: '2025-01-15T10:00:00.000Z',
    notes: null,
    ...overrides,
  };
}

function makeSession(
  sessionId: string,
  date: string,
  sets: SetLog[],
): SessionSets {
  return { sessionId, date, sets };
}

describe('getBestMetrics', () => {
  it('returns zeros for empty sets', () => {
    const result = getBestMetrics([]);
    expect(result).toEqual({ maxWeight: 0, best1RM: 0, bestVolume: 0 });
  });

  it('returns zeros when all sets are warmups', () => {
    const sets = [
      makeSet({ weight: 100, reps: 10, set_type: 'warmup' as SetType }),
    ];
    const result = getBestMetrics(sets);
    expect(result).toEqual({ maxWeight: 0, best1RM: 0, bestVolume: 0 });
  });

  it('returns zeros when all sets are incomplete', () => {
    const sets = [makeSet({ weight: 100, reps: 10, is_completed: 0 })];
    const result = getBestMetrics(sets);
    expect(result).toEqual({ maxWeight: 0, best1RM: 0, bestVolume: 0 });
  });

  it('computes max weight from qualifying sets', () => {
    const sets = [
      makeSet({ id: 's1', weight: 80, reps: 10 }),
      makeSet({ id: 's2', weight: 120, reps: 5 }),
      makeSet({ id: 's3', weight: 100, reps: 8 }),
    ];
    const result = getBestMetrics(sets);
    expect(result.maxWeight).toBe(120);
  });

  it('computes best 1RM using Epley formula', () => {
    const sets = [
      makeSet({ id: 's1', weight: 100, reps: 10 }),
      makeSet({ id: 's2', weight: 120, reps: 5 }),
    ];
    const result = getBestMetrics(sets);
    expect(result.best1RM).toBe(140);
  });

  it('computes best volume (max single-set volume)', () => {
    const sets = [
      makeSet({ id: 's1', weight: 80, reps: 12 }),
      makeSet({ id: 's2', weight: 100, reps: 10 }),
    ];
    const result = getBestMetrics(sets);
    expect(result.bestVolume).toBe(1000);
  });

  it('excludes warmup sets from all calculations', () => {
    const sets = [
      makeSet({ id: 's1', weight: 60, reps: 10, set_type: 'warmup' as SetType }),
      makeSet({ id: 's2', weight: 120, reps: 5 }),
    ];
    const result = getBestMetrics(sets);
    expect(result.maxWeight).toBe(120);
    expect(result.best1RM).toBe(140);
  });

  it('returns 0 for sets with zero weight', () => {
    const sets = [makeSet({ weight: 0, reps: 10 })];
    const result = getBestMetrics(sets);
    expect(result.maxWeight).toBe(0);
    expect(result.best1RM).toBe(0);
    expect(result.bestVolume).toBe(0);
  });

  it('handles a single set correctly', () => {
    const sets = [makeSet({ weight: 100, reps: 8 })];
    const result = getBestMetrics(sets);
    expect(result.maxWeight).toBe(100);
    expect(result.best1RM).toBe(126.67);
    expect(result.bestVolume).toBe(800);
  });
});

describe('getSessionHistory', () => {
  it('returns empty array for empty sessions', () => {
    const result = getSessionHistory([]);
    expect(result).toEqual([]);
  });

  it('returns empty array when sessions have no qualifying sets', () => {
    const sessions = [
      makeSession('s1', '2025-01-15T10:00:00.000Z', [
        makeSet({ set_type: 'warmup' as SetType }),
      ]),
    ];
    const result = getSessionHistory(sessions);
    expect(result).toEqual([]);
  });

  it('groups sets by session and computes set count and volume', () => {
    const sessions = [
      makeSession('s1', '2025-01-15T10:00:00.000Z', [
        makeSet({ id: 'a', weight: 100, reps: 10 }),
        makeSet({ id: 'b', weight: 80, reps: 8 }),
      ]),
    ];
    const result = getSessionHistory(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe('s1');
    expect(result[0].setCount).toBe(2);
    expect(result[0].volume).toBe(1640);
  });

  it('returns sessions sorted by date descending', () => {
    const sessions = [
      makeSession('s1', '2025-01-10T10:00:00.000Z', [
        makeSet({ id: 'a', weight: 100, reps: 10 }),
      ]),
      makeSession('s2', '2025-02-10T10:00:00.000Z', [
        makeSet({ id: 'b', weight: 100, reps: 10 }),
      ]),
      makeSession('s3', '2025-01-20T10:00:00.000Z', [
        makeSet({ id: 'c', weight: 100, reps: 10 }),
      ]),
    ];
    const result = getSessionHistory(sessions);
    expect(result).toHaveLength(3);
    expect(result[0].sessionId).toBe('s2');
    expect(result[1].sessionId).toBe('s3');
    expect(result[2].sessionId).toBe('s1');
  });

  it('excludes warmup sets from count and volume', () => {
    const sessions = [
      makeSession('s1', '2025-01-15T10:00:00.000Z', [
        makeSet({ id: 'a', weight: 60, reps: 10, set_type: 'warmup' as SetType }),
        makeSet({ id: 'b', weight: 100, reps: 10 }),
        makeSet({ id: 'c', weight: 100, reps: 8 }),
      ]),
    ];
    const result = getSessionHistory(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].setCount).toBe(2);
    expect(result[0].volume).toBe(1800);
  });

  it('filters out sessions with only warmup sets', () => {
    const sessions = [
      makeSession('s1', '2025-01-15T10:00:00.000Z', [
        makeSet({ set_type: 'warmup' as SetType }),
      ]),
      makeSession('s2', '2025-01-16T10:00:00.000Z', [
        makeSet({ weight: 100, reps: 10 }),
      ]),
    ];
    const result = getSessionHistory(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe('s2');
  });
});

describe('getProgressData', () => {
  it('returns empty array for empty history', () => {
    const result = getProgressData([], 'volume');
    expect(result).toEqual([]);
  });

  it('transforms session history into chart data points', () => {
    const history = [
      { sessionId: 's3', date: '2025-03-15T10:00:00.000Z', setCount: 2, volume: 2000 },
      { sessionId: 's2', date: '2025-02-10T10:00:00.000Z', setCount: 1, volume: 1000 },
      { sessionId: 's1', date: '2025-01-05T10:00:00.000Z', setCount: 1, volume: 800 },
    ];
    const result = getProgressData(history, 'volume');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: '05/01', y: 800 });
    expect(result[1]).toEqual({ x: '10/02', y: 1000 });
    expect(result[2]).toEqual({ x: '15/03', y: 2000 });
  });

  it('returns max 10 data points', () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      sessionId: `s${i}`,
      date: `2025-01-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
      setCount: 1,
      volume: (i + 1) * 100,
    }));
    const result = getProgressData(history, 'volume');
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('returns chronological order (oldest first) for chart display', () => {
    const history = [
      { sessionId: 's2', date: '2025-02-10T10:00:00.000Z', setCount: 1, volume: 1000 },
      { sessionId: 's1', date: '2025-01-05T10:00:00.000Z', setCount: 1, volume: 800 },
    ];
    const result = getProgressData(history, 'volume');
    expect(result[0].y).toBe(800);
    expect(result[1].y).toBe(1000);
  });
});
