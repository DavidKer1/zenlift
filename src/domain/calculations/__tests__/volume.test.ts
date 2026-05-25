import {
  calculateSetVolume,
  calculateExerciseVolume,
  calculateSessionVolume,
  calculateMuscleVolume,
  calculateWeeklyVolume,
  getISOWeek,
  formatISOWeek,
} from '../volume';
import type { SetLog, WorkoutExerciseWithSets, MuscleGroup, FullSession, Exercise } from '@/domain/entities';

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'set-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 60,
    reps: 10,
    set_type: 'normal',
    is_completed: 1,
    completed_at: null,
    notes: null,
    ...overrides,
  };
}

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    is_custom: 0,
    is_favorite: 0,
    notes: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  };
}

function makeWorkoutExerciseWithSets(
  overrides: Partial<WorkoutExerciseWithSets> = {},
  sets: SetLog[] = [],
): WorkoutExerciseWithSets {
  return {
    id: 'we-1',
    workout_session_id: 'ws-1',
    exercise_id: 'ex-1',
    sort_order: 1,
    notes: null,
    exercise: makeExercise(),
    sets,
    ...overrides,
  };
}

function makeMuscleGroup(overrides: Partial<MuscleGroup> = {}): MuscleGroup {
  return {
    id: 'chest',
    name: 'Chest',
    display_name_es: 'Pecho',
    color: '#FF0000',
    ...overrides,
  };
}

function makeSession(
  overrides: Partial<FullSession> = {},
  exercises: WorkoutExerciseWithSets[] = [],
): FullSession {
  return {
    id: 's-1',
    routine_id: null,
    routine_day_id: null,
    name: null,
    started_at: '2025-01-15T10:00:00.000Z',
    ended_at: null,
    duration_seconds: null,
    status: 'completed',
    notes: null,
    created_at: null,
    updated_at: null,
    routine: null,
    routine_day: null,
    exercises,
    personal_records: [],
    ...overrides,
  };
}

describe('calculateSetVolume', () => {
  it('returns weight * reps for normal set', () => {
    expect(calculateSetVolume(60, 10)).toBe(600);
  });

  it('returns 0 when weight is 0', () => {
    expect(calculateSetVolume(0, 10)).toBe(0);
  });

  it('returns 0 when reps is 0', () => {
    expect(calculateSetVolume(60, 0)).toBe(0);
  });

  it('returns 0 when both weight and reps are 0', () => {
    expect(calculateSetVolume(0, 0)).toBe(0);
  });

  it('handles fractional weight', () => {
    expect(calculateSetVolume(22.5, 8)).toBe(180);
  });
});

describe('calculateExerciseVolume', () => {
  it('sums volumes of completed non-warmup sets', () => {
    const sets = [
      makeSet({ weight: 60, reps: 10, is_completed: 1, set_type: 'normal' }),
      makeSet({ weight: 65, reps: 8, is_completed: 1, set_type: 'normal' }),
    ];
    expect(calculateExerciseVolume(sets)).toBe(1120);
  });

  it('excludes warmup sets', () => {
    const sets = [
      makeSet({ weight: 40, reps: 10, is_completed: 1, set_type: 'warmup' }),
      makeSet({ weight: 60, reps: 10, is_completed: 1, set_type: 'normal' }),
    ];
    expect(calculateExerciseVolume(sets)).toBe(600);
  });

  it('excludes not completed sets', () => {
    const sets = [
      makeSet({ weight: 60, reps: 10, is_completed: 1, set_type: 'normal' }),
      makeSet({ weight: 70, reps: 5, is_completed: 0, set_type: 'normal' }),
    ];
    expect(calculateExerciseVolume(sets)).toBe(600);
  });

  it('returns 0 when all sets are warmups', () => {
    const sets = [
      makeSet({ weight: 40, reps: 10, is_completed: 1, set_type: 'warmup' }),
      makeSet({ weight: 45, reps: 8, is_completed: 1, set_type: 'warmup' }),
    ];
    expect(calculateExerciseVolume(sets)).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(calculateExerciseVolume([])).toBe(0);
  });
});

describe('calculateSessionVolume', () => {
  it('sums volumes across multiple exercises', () => {
    const exercises = [
      makeWorkoutExerciseWithSets({}, [
        makeSet({ weight: 60, reps: 10, is_completed: 1 }),
        makeSet({ weight: 60, reps: 5, is_completed: 1 }),
      ]),
      makeWorkoutExerciseWithSets({ id: 'we-2', exercise_id: 'ex-2', exercise: makeExercise({ id: 'ex-2' }) }, [
        makeSet({ weight: 40, reps: 15, is_completed: 1 }),
      ]),
    ];
    expect(calculateSessionVolume(exercises)).toBe(1500);
  });

  it('returns 0 for empty array', () => {
    expect(calculateSessionVolume([])).toBe(0);
  });

  it('excludes warmups from one exercise', () => {
    const exercises = [
      makeWorkoutExerciseWithSets({}, [
        makeSet({ weight: 40, reps: 10, is_completed: 1, set_type: 'warmup' }),
        makeSet({ weight: 60, reps: 10, is_completed: 1, set_type: 'normal' }),
      ]),
    ];
    expect(calculateSessionVolume(exercises)).toBe(600);
  });
});

describe('calculateMuscleVolume', () => {
  it('maps exercise volume to single muscle', () => {
    const exercises = [
      makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 60, reps: 10, is_completed: 1 }),
      ]),
    ];
    const muscleMap = new Map([
      ['ex-1', [makeMuscleGroup({ id: 'chest', name: 'Chest' })]],
    ]);
    const result = calculateMuscleVolume(exercises, muscleMap);
    expect(result.get('chest')).toBe(600);
  });

  it('maps exercise volume to multiple muscles', () => {
    const exercises = [
      makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 60, reps: 10, is_completed: 1 }),
      ]),
    ];
    const muscleMap = new Map([
      ['ex-1', [
        makeMuscleGroup({ id: 'chest', name: 'Chest' }),
        makeMuscleGroup({ id: 'triceps', name: 'Triceps' }),
      ]],
    ]);
    const result = calculateMuscleVolume(exercises, muscleMap);
    expect(result.get('chest')).toBe(600);
    expect(result.get('triceps')).toBe(600);
  });

  it('aggregates volume across exercises targeting same muscle', () => {
    const exercises = [
      makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 60, reps: 10, is_completed: 1 }),
      ]),
      makeWorkoutExerciseWithSets({
        id: 'we-2',
        exercise_id: 'ex-2',
        exercise: makeExercise({ id: 'ex-2' }),
      }, [
        makeSet({ weight: 40, reps: 10, is_completed: 1 }),
      ]),
    ];
    const muscleMap = new Map([
      ['ex-1', [makeMuscleGroup({ id: 'chest', name: 'Chest' })]],
      ['ex-2', [makeMuscleGroup({ id: 'chest', name: 'Chest' })]],
    ]);
    const result = calculateMuscleVolume(exercises, muscleMap);
    expect(result.get('chest')).toBe(1000);
  });

  it('skips exercise not found in muscleMap', () => {
    const exercises = [
      makeWorkoutExerciseWithSets({ exercise_id: 'ex-unknown' }, [
        makeSet({ weight: 60, reps: 10, is_completed: 1 }),
      ]),
    ];
    const muscleMap = new Map<string, MuscleGroup[]>();
    const result = calculateMuscleVolume(exercises, muscleMap);
    expect(result.size).toBe(0);
  });

  it('returns empty map for empty exercises', () => {
    const result = calculateMuscleVolume([], new Map());
    expect(result.size).toBe(0);
  });
});

describe('calculateWeeklyVolume', () => {
  it('aggregates sessions in same ISO week', () => {
    const sessions = [
      makeSession(
        { id: 's-1', started_at: '2025-01-15T10:00:00.000Z' },
        [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 50, reps: 10, is_completed: 1 })])],
      ),
      makeSession(
        { id: 's-2', started_at: '2025-01-16T10:00:00.000Z' },
        [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 30, reps: 10, is_completed: 1 })])],
      ),
    ];
    const result = calculateWeeklyVolume(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].volume).toBe(800);
  });

  it('groups sessions into different weeks', () => {
    // 2025-W01: Jan 1 (Wednesday)
    const s1 = makeSession(
      { id: 's-1', started_at: '2025-01-01T10:00:00.000Z' },
      [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 50, reps: 10, is_completed: 1 })])],
    );
    // 2025-W02: Jan 8 (Wednesday)
    const s2 = makeSession(
      { id: 's-2', started_at: '2025-01-08T10:00:00.000Z' },
      [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 30, reps: 10, is_completed: 1 })])],
    );
    const result = calculateWeeklyVolume([s1, s2]);
    expect(result).toHaveLength(2);
    expect(result[0].weekStart < result[1].weekStart).toBe(true);
    expect(result[0].volume).toBe(500);
    expect(result[1].volume).toBe(300);
  });

  it('handles year boundary correctly', () => {
    // 2024-W52: Dec 23, 2024 (Monday)
    const s1 = makeSession(
      { id: 's-1', started_at: '2024-12-23T10:00:00.000Z' },
      [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 40, reps: 10, is_completed: 1 })])],
    );
    // 2025-W01: Jan 1, 2025 (Wednesday) — belongs to W01 since Jan 4 is Saturday
    const s2 = makeSession(
      { id: 's-2', started_at: '2025-01-01T10:00:00.000Z' },
      [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 50, reps: 10, is_completed: 1 })])],
    );
    const result = calculateWeeklyVolume([s1, s2]);
    expect(result).toHaveLength(2);
    expect(result[0].weekStart).toBe('2024-W52');
    expect(result[1].weekStart).toBe('2025-W01');
    expect(result[0].weekStart < result[1].weekStart).toBe(true);
  });

  it('skips session without started_at', () => {
    const sessions = [
      makeSession(
        { id: 's-1', started_at: '' as unknown as string },
        [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 50, reps: 10, is_completed: 1 })])],
      ),
    ];
    const result = calculateWeeklyVolume(sessions);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty sessions', () => {
    expect(calculateWeeklyVolume([])).toEqual([]);
  });

  it('skips session with invalid date', () => {
    const sessions = [
      makeSession(
        { id: 's-1', started_at: 'not-a-date' },
        [makeWorkoutExerciseWithSets({}, [makeSet({ weight: 50, reps: 10, is_completed: 1 })])],
      ),
    ];
    const result = calculateWeeklyVolume(sessions);
    expect(result).toHaveLength(0);
  });
});

describe('getISOWeek', () => {
  it('returns correct ISO week for a normal date', () => {
    const result = getISOWeek(new Date('2025-01-15T10:00:00.000Z'));
    expect(result.year).toBe(2025);
    expect(result.week).toBe(3);
  });

  it('handles year start', () => {
    const result = getISOWeek(new Date('2025-01-01T10:00:00.000Z'));
    expect(result.year).toBe(2025);
    expect(result.week).toBe(1);
  });

  it('handles year end (Dec 31)', () => {
    // Dec 31, 2025 is a Wednesday, week 1 of 2026
    const result = getISOWeek(new Date('2025-12-31T10:00:00.000Z'));
    expect(result.year).toBe(2026);
    expect(result.week).toBe(1);
  });

  it('handles Sunday correctly (getUTCDay returns 0)', () => {
    // Jan 5, 2025 is a Sunday
    const result = getISOWeek(new Date('2025-01-05T10:00:00.000Z'));
    expect(result.year).toBe(2025);
    expect(result.week).toBe(1);
  });

  it('handles edge case where Dec 29-31 belong to week 1 of next year', () => {
    // 2024-12-30 is Monday, may belong to 2025-W01 depending on the year
    const result = getISOWeek(new Date('2024-12-30T10:00:00.000Z'));
    expect(result.year).toBe(2025);
    expect(result.week).toBe(1);
  });
});

describe('formatISOWeek', () => {
  it('formats with zero-padded week', () => {
    expect(formatISOWeek(2025, 3)).toBe('2025-W03');
  });

  it('formats with double-digit week', () => {
    expect(formatISOWeek(2025, 12)).toBe('2025-W12');
  });

  it('formats single digit week', () => {
    expect(formatISOWeek(2025, 1)).toBe('2025-W01');
  });
});
