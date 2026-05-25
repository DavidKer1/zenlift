import { detectPRs, DetectedPR } from '../prDetection';
import type {
  SetLog,
  WorkoutExerciseWithSets,
  FullSession,
  PersonalRecord,
  Exercise,
} from '@/domain/entities';

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'set-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 100,
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

function makePersonalRecord(overrides: Partial<PersonalRecord> = {}): PersonalRecord {
  return {
    id: 'pr-1',
    exercise_id: 'ex-1',
    workout_session_id: 'ws-1',
    type: 'max_weight',
    value: 100,
    weight: 100,
    reps: 10,
    achieved_at: '2025-01-15T10:00:00.000Z',
    ...overrides,
  };
}

function findPR(results: DetectedPR[], type: string, exerciseId?: string): DetectedPR | undefined {
  return results.find((r) => r.type === type && (exerciseId === undefined || r.exerciseId === exerciseId));
}

describe('detectPRs', () => {
  describe('first workout', () => {
    it('emits all 5 PR types with null previousBest for one exercise', () => {
      const sets: SetLog[] = [
        makeSet({ id: 's1', weight: 100, reps: 10, set_number: 1 }),
        makeSet({ id: 's2', weight: 100, reps: 8, set_number: 2 }),
        makeSet({ id: 's3', weight: 100, reps: 6, set_number: 3 }),
      ];
      const exercise = makeWorkoutExerciseWithSets({}, sets);
      const session = makeSession({}, [exercise]);

      const results = detectPRs(session, [], []);

      expect(results).toHaveLength(5);

      const weightPR = findPR(results, 'max_weight')!;
      expect(weightPR.value).toBe(100);
      expect(weightPR.previousBest).toBeNull();
      expect(weightPR.improvement).toBe(0);
      expect(weightPR.improvementPercent).toBe(0);

      const volumePR = findPR(results, 'max_volume')!;
      expect(volumePR.value).toBe(2400);
      expect(volumePR.previousBest).toBeNull();
      expect(volumePR.improvement).toBe(0);
      expect(volumePR.improvementPercent).toBe(0);

      const repsPR = findPR(results, 'max_reps')!;
      expect(repsPR.value).toBe(10);
      expect(repsPR.previousBest).toBeNull();
      expect(repsPR.improvement).toBe(0);
      expect(repsPR.improvementPercent).toBe(0);

      const e1rmPR = findPR(results, 'estimated_1rm')!;
      expect(e1rmPR.value).toBe(133.33);
      expect(e1rmPR.previousBest).toBeNull();
      expect(e1rmPR.improvement).toBe(0);
      expect(e1rmPR.improvementPercent).toBe(0);

      const sessionVolPR = findPR(results, 'max_session_volume')!;
      expect(sessionVolPR.value).toBe(2400);
      expect(sessionVolPR.previousBest).toBeNull();
      expect(sessionVolPR.improvement).toBe(0);
      expect(sessionVolPR.improvementPercent).toBe(0);
    });

    it('emits 9 entries for 2 exercises (4 per exercise + 1 session volume)', () => {
      const ex1 = makeWorkoutExerciseWithSets(
        { id: 'we-1', exercise_id: 'ex-1', exercise: makeExercise({ id: 'ex-1', name: 'Bench Press' }) },
        [makeSet({ id: 's1', weight: 80, reps: 10 })],
      );
      const ex2 = makeWorkoutExerciseWithSets(
        { id: 'we-2', exercise_id: 'ex-2', exercise: makeExercise({ id: 'ex-2', name: 'Squat' }) },
        [makeSet({ id: 's2', weight: 100, reps: 5 })],
      );
      const session = makeSession({}, [ex1, ex2]);

      const results = detectPRs(session, [], []);

      expect(results).toHaveLength(9);
      expect(findPR(results, 'max_weight', 'ex-1')).toBeDefined();
      expect(findPR(results, 'max_weight', 'ex-2')).toBeDefined();
      expect(findPR(results, 'max_session_volume')).toBeDefined();
    });
  });

  describe('max_weight PR', () => {
    it('emits PR when new weight exceeds previous best', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 120, reps: 5 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_weight', value: 100 })];

      const results = detectPRs(session, prevPRs, []);

      const weightPR = findPR(results, 'max_weight', 'ex-1')!;
      expect(weightPR).toBeDefined();
      expect(weightPR.value).toBe(120);
      expect(weightPR.previousBest).toBe(100);
      expect(weightPR.improvement).toBe(20);
      expect(weightPR.improvementPercent).toBe(20);
    });

    it('does not emit PR when weight equals previous best (tie)', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 100, reps: 5 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_weight', value: 100 })];

      const results = detectPRs(session, prevPRs, []);

      expect(findPR(results, 'max_weight', 'ex-1')).toBeUndefined();
    });

    it('does not emit PR when weight is less than previous best', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 80, reps: 5 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_weight', value: 100 })];

      const results = detectPRs(session, prevPRs, []);

      expect(findPR(results, 'max_weight', 'ex-1')).toBeUndefined();
    });
  });

  describe('max_volume PR', () => {
    it('emits PR with correct improvement when volume exceeds previous best', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 120, reps: 10, set_number: 1 }),
        makeSet({ weight: 120, reps: 10, set_number: 2 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_volume', value: 2000 })];

      const results = detectPRs(session, prevPRs, []);

      const volPR = findPR(results, 'max_volume', 'ex-1')!;
      expect(volPR).toBeDefined();
      expect(volPR.value).toBe(2400);
      expect(volPR.previousBest).toBe(2000);
      expect(volPR.improvement).toBe(400);
      expect(volPR.improvementPercent).toBe(20);
    });

    it('does not emit PR on tie for volume', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 100, reps: 20 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_volume', value: 2000 })];

      const results = detectPRs(session, prevPRs, []);

      expect(findPR(results, 'max_volume', 'ex-1')).toBeUndefined();
    });
  });

  describe('max_reps PR', () => {
    it('emits PR when a set has more reps than previous best', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 80, reps: 15 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_reps', value: 12 })];

      const results = detectPRs(session, prevPRs, []);

      const repsPR = findPR(results, 'max_reps', 'ex-1')!;
      expect(repsPR).toBeDefined();
      expect(repsPR.value).toBe(15);
      expect(repsPR.previousBest).toBe(12);
      expect(repsPR.improvement).toBe(3);
      expect(repsPR.improvementPercent).toBe(25);
    });

    it('does not emit PR when reps equal previous best (tie)', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 120, reps: 10 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'max_reps', value: 10 })];

      const results = detectPRs(session, prevPRs, []);

      expect(findPR(results, 'max_reps', 'ex-1')).toBeUndefined();
    });
  });

  describe('estimated_1rm PR', () => {
    it('emits PR when estimated 1RM exceeds previous best', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 120, reps: 5 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [makePersonalRecord({ exercise_id: 'ex-1', type: 'estimated_1rm', value: 130 })];

      const results = detectPRs(session, prevPRs, []);

      const e1rmPR = findPR(results, 'estimated_1rm', 'ex-1')!;
      expect(e1rmPR).toBeDefined();
      expect(e1rmPR.value).toBe(140);
      expect(e1rmPR.previousBest).toBe(130);
      expect(e1rmPR.improvement).toBe(10);
      expect(e1rmPR.improvementPercent).toBe(7.69);
    });

    it('does not emit estimated_1rm PR when estimate1RMFromSets returns null', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ set_type: 'warmup', is_completed: 1 }),
      ]);
      const session = makeSession({}, [exercise]);

      const results = detectPRs(session, [], []);

      expect(results).toHaveLength(0);
    });

    it('evaluates all 4 per-exercise types including estimated_1rm in a normal workout', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 100, reps: 10, is_completed: 1, set_type: 'normal' }),
      ]);
      const session = makeSession({}, [exercise]);

      const results = detectPRs(session, [], []);

      expect(findPR(results, 'max_weight', 'ex-1')).toBeDefined();
      expect(findPR(results, 'max_volume', 'ex-1')).toBeDefined();
      expect(findPR(results, 'max_reps', 'ex-1')).toBeDefined();
      expect(findPR(results, 'estimated_1rm', 'ex-1')).toBeDefined();
      expect(findPR(results, 'max_session_volume')).toBeDefined();
      expect(results).toHaveLength(5);
    });
  });

  describe('max_session_volume PR', () => {
    it('emits PR when session volume exceeds all historical sessions', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 100, reps: 50 }),
        makeSet({ weight: 100, reps: 50 }),
      ]);
      const session = makeSession({}, [exercise]);

      const histExercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 80, reps: 100 }),
      ]);
      const histSession = makeSession({ id: 'hist-1' }, [histExercise]);

      const results = detectPRs(session, [], [histSession]);

      const sessionVolPR = findPR(results, 'max_session_volume')!;
      expect(sessionVolPR).toBeDefined();
      expect(sessionVolPR.value).toBe(10000);
      expect(sessionVolPR.previousBest).toBe(8000);
      expect(sessionVolPR.improvement).toBe(2000);
      expect(sessionVolPR.improvementPercent).toBe(25);
    });

    it('does not emit PR when session volume equals previous best', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 80, reps: 100 }),
      ]);
      const session = makeSession({}, [exercise]);

      const histExercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 80, reps: 100 }),
      ]);
      const histSession = makeSession({ id: 'hist-1' }, [histExercise]);

      const results = detectPRs(session, [], [histSession]);

      expect(findPR(results, 'max_session_volume')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('returns empty array for session with no exercises', () => {
      const session = makeSession();
      const results = detectPRs(session, [], []);
      expect(results).toEqual([]);
    });

    it('skips exercise with no completed non-warmup sets', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ is_completed: 0, set_type: 'normal' }),
      ]);
      const session = makeSession({}, [exercise]);

      const results = detectPRs(session, [], []);

      expect(results).toEqual([]);
    });

    it('skips exercise where all sets are warmups', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 100, reps: 10, set_type: 'warmup', is_completed: 1 }),
        makeSet({ weight: 80, reps: 8, set_type: 'warmup', is_completed: 1 }),
      ]);
      const session = makeSession({}, [exercise]);

      const results = detectPRs(session, [], []);

      expect(results).toEqual([]);
    });

    it('emits max_weight PR with value 0 when weight is 0 and no previous PRs', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 0, reps: 10, set_type: 'normal', is_completed: 1 }),
      ]);
      const session = makeSession({}, [exercise]);

      const results = detectPRs(session, [], []);

      const weightPR = findPR(results, 'max_weight', 'ex-1')!;
      expect(weightPR).toBeDefined();
      expect(weightPR.value).toBe(0);
      expect(weightPR.previousBest).toBeNull();
      expect(weightPR.improvement).toBe(0);
      expect(weightPR.improvementPercent).toBe(0);
    });
  });

  describe('multiple exercises', () => {
    it('emits PRs only for exercises that beat previous bests', () => {
      const exA = makeWorkoutExerciseWithSets(
        { id: 'we-a', exercise_id: 'ex-a', exercise: makeExercise({ id: 'ex-a', name: 'Exercise A' }) },
        [makeSet({ id: 'sa', weight: 110, reps: 10 })],
      );
      const exB = makeWorkoutExerciseWithSets(
        { id: 'we-b', exercise_id: 'ex-b', exercise: makeExercise({ id: 'ex-b', name: 'Exercise B' }) },
        [makeSet({ id: 'sb', weight: 90, reps: 10 })],
      );
      const session = makeSession({}, [exA, exB]);

      const prevPRs = [
        makePersonalRecord({ exercise_id: 'ex-a', type: 'max_weight', value: 100 }),
        makePersonalRecord({ exercise_id: 'ex-b', type: 'max_weight', value: 100 }),
        makePersonalRecord({ exercise_id: 'ex-a', type: 'max_volume', value: 900 }),
        makePersonalRecord({ exercise_id: 'ex-b', type: 'max_volume', value: 1000 }),
        makePersonalRecord({ exercise_id: 'ex-a', type: 'max_reps', value: 8 }),
        makePersonalRecord({ exercise_id: 'ex-b', type: 'max_reps', value: 12 }),
        makePersonalRecord({ exercise_id: 'ex-a', type: 'estimated_1rm', value: 120 }),
        makePersonalRecord({ exercise_id: 'ex-b', type: 'estimated_1rm', value: 120 }),
      ];

      const results = detectPRs(session, prevPRs, []);

      // Exercise A: weight 110 > 100 (PR), volume 1100 > 900 (PR), reps 10 > 8 (PR), e1rm ~128 > 120 (PR)
      expect(findPR(results, 'max_weight', 'ex-a')).toBeDefined();
      expect(findPR(results, 'max_volume', 'ex-a')).toBeDefined();
      expect(findPR(results, 'max_reps', 'ex-a')).toBeDefined();
      expect(findPR(results, 'estimated_1rm', 'ex-a')).toBeDefined();

      // Exercise B: weight 90 < 100 (no PR), volume 900 < 1000 (no PR), reps 10 < 12 (no PR), e1rm ~105 < 120 (no PR)
      expect(findPR(results, 'max_weight', 'ex-b')).toBeUndefined();
      expect(findPR(results, 'max_volume', 'ex-b')).toBeUndefined();
      expect(findPR(results, 'max_reps', 'ex-b')).toBeUndefined();
      expect(findPR(results, 'estimated_1rm', 'ex-b')).toBeUndefined();
    });
  });

  describe('improvement calculations', () => {
    it('returns improvement 0 and improvementPercent 0 for first-ever PR', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 80, reps: 10 }),
      ]);
      const session = makeSession({}, [exercise]);
      const results = detectPRs(session, [], []);

      for (const pr of results) {
        expect(pr.improvement).toBe(0);
        expect(pr.improvementPercent).toBe(0);
      }
    });

    it('rounds improvementPercent to 2 decimal places', () => {
      const exercise = makeWorkoutExerciseWithSets({ exercise_id: 'ex-1' }, [
        makeSet({ weight: 95, reps: 10 }),
      ]);
      const session = makeSession({}, [exercise]);
      const prevPRs = [
        makePersonalRecord({ exercise_id: 'ex-1', type: 'max_weight', value: 90 }),
      ];

      const results = detectPRs(session, prevPRs, []);

      const weightPR = findPR(results, 'max_weight', 'ex-1')!;
      expect(weightPR).toBeDefined();
      expect(weightPR.value).toBe(95);
      expect(weightPR.previousBest).toBe(90);
      expect(weightPR.improvement).toBe(5);
      expect(weightPR.improvementPercent).toBe(5.56);
    });
  });
});
