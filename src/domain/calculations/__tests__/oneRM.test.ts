import { estimate1RM, estimate1RMFromSets, getBestEstimated1RM } from '../oneRM';
import type { SetLog } from '@/domain/entities';

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'set-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 80,
    reps: 6,
    set_type: 'normal',
    is_completed: 1,
    completed_at: '2025-01-15T10:00:00Z',
    notes: null,
    ...overrides,
  };
}

describe('estimate1RM', () => {
  it('calculates standard rep range (80kg × 6 = 96.00)', () => {
    expect(estimate1RM(80, 6)).toBe(96);
  });

  it('returns weight for single rep (actual 1RM)', () => {
    expect(estimate1RM(100, 1)).toBe(100);
  });

  it('returns 0 for zero reps', () => {
    expect(estimate1RM(50, 0)).toBe(0);
  });

  it('returns 0 for zero weight', () => {
    expect(estimate1RM(0, 10)).toBe(0);
  });

  it('calculates high rep range (60kg × 12 = 84.00)', () => {
    expect(estimate1RM(60, 12)).toBe(84);
  });

  it('handles fractional weight with low reps (52.5kg × 5 = 61.25)', () => {
    expect(estimate1RM(52.5, 5)).toBe(61.25);
  });

  it('handles fractional result rounding up', () => {
    expect(estimate1RM(100, 3)).toBe(110);
  });

  it('handles fractional result rounding down', () => {
    expect(estimate1RM(100, 2)).toBe(106.67);
  });
});

describe('estimate1RMFromSets', () => {
  it('ignores warmup sets and returns null when only warmups exist', () => {
    const sets: SetLog[] = [
      makeSet({ weight: 60, reps: 10, set_type: 'warmup', is_completed: 1 }),
      makeSet({ weight: 40, reps: 15, set_type: 'warmup', is_completed: 1 }),
    ];
    expect(estimate1RMFromSets(sets)).toBeNull();
  });

  it('ignores incomplete sets and returns null when only incomplete exist', () => {
    const sets: SetLog[] = [
      makeSet({ weight: 80, reps: 6, is_completed: 0 }),
      makeSet({ weight: 70, reps: 10, is_completed: 0 }),
    ];
    expect(estimate1RMFromSets(sets)).toBeNull();
  });

  it('selects the highest estimated 1RM from mixed sets', () => {
    const sets: SetLog[] = [
      makeSet({ weight: 60, reps: 10, set_type: 'warmup', is_completed: 1 }),
      makeSet({ weight: 80, reps: 6, set_type: 'normal', is_completed: 1 }),
      makeSet({ weight: 70, reps: 10, set_type: 'normal', is_completed: 1 }),
    ];
    expect(estimate1RMFromSets(sets)).toBe(96);
  });

  it('returns null for an empty array', () => {
    expect(estimate1RMFromSets([])).toBeNull();
  });

  it('ignores drop and failure set types', () => {
    const sets: SetLog[] = [
      makeSet({ weight: 100, reps: 5, set_type: 'drop', is_completed: 1 }),
      makeSet({ weight: 100, reps: 5, set_type: 'failure', is_completed: 1 }),
    ];
    expect(estimate1RMFromSets(sets)).not.toBeNull();
    expect(estimate1RMFromSets(sets)).toBe(estimate1RM(100, 5));
  });

  it('handles SQLiteBoolean 0 as false for is_completed', () => {
    const sets: SetLog[] = [
      makeSet({ weight: 80, reps: 6, is_completed: 0 as const }),
    ];
    expect(estimate1RMFromSets(sets)).toBeNull();
  });

  it('handles SQLiteBoolean 1 as true for is_completed', () => {
    const sets: SetLog[] = [
      makeSet({ weight: 80, reps: 6, is_completed: 1 as const }),
    ];
    expect(estimate1RMFromSets(sets)).toBe(96);
  });
});

describe('getBestEstimated1RM', () => {
  it('finds the best across multiple sessions', () => {
    const history: SetLog[][] = [
      [
        makeSet({
          id: 's1',
          weight: 80,
          reps: 6,
          set_type: 'normal',
          is_completed: 1,
          completed_at: '2025-01-10T10:00:00Z',
        }),
      ],
      [
        makeSet({
          id: 's2',
          weight: 85,
          reps: 5,
          set_type: 'normal',
          is_completed: 1,
          completed_at: '2025-01-15T10:00:00Z',
        }),
      ],
    ];

    const result = getBestEstimated1RM('ex-1', history);
    expect(result).not.toBeNull();
    expect(result!.value).toBe(99.17);
    expect(result!.weight).toBe(85);
    expect(result!.reps).toBe(5);
    expect(result!.date).toBe('2025-01-15T10:00:00Z');
  });

  it('returns null when all sets are warmup or incomplete', () => {
    const history: SetLog[][] = [
      [makeSet({ set_type: 'warmup', is_completed: 1 })],
      [makeSet({ is_completed: 0 })],
    ];
    expect(getBestEstimated1RM('ex-1', history)).toBeNull();
  });

  it('returns null for empty history', () => {
    expect(getBestEstimated1RM('ex-1', [])).toBeNull();
  });

  it('returns result for a single valid session', () => {
    const history: SetLog[][] = [
      [
        makeSet({
          weight: 100,
          reps: 1,
          set_type: 'normal',
          is_completed: 1,
          completed_at: '2025-01-20T10:00:00Z',
        }),
      ],
    ];

    const result = getBestEstimated1RM('ex-1', history);
    expect(result).not.toBeNull();
    expect(result!.value).toBe(100);
    expect(result!.weight).toBe(100);
    expect(result!.reps).toBe(1);
    expect(result!.date).toBe('2025-01-20T10:00:00Z');
  });

  it('skips warmup sets even when they would be the best', () => {
    const history: SetLog[][] = [
      [
        makeSet({ weight: 200, reps: 10, set_type: 'warmup', is_completed: 1 }),
        makeSet({ weight: 80, reps: 6, set_type: 'normal', is_completed: 1 }),
      ],
    ];

    const result = getBestEstimated1RM('ex-1', history);
    expect(result).not.toBeNull();
    expect(result!.value).toBe(96);
    expect(result!.weight).toBe(80);
  });

  it('handles null completed_at gracefully', () => {
    const history: SetLog[][] = [
      [
        makeSet({
          weight: 100,
          reps: 1,
          set_type: 'normal',
          is_completed: 1,
          completed_at: null,
        }),
      ],
    ];

    const result = getBestEstimated1RM('ex-1', history);
    expect(result).not.toBeNull();
    expect(result!.date).toBe('');
  });
});
