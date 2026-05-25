import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  WorkoutSession,
  WorkoutExerciseWithSets,
  SetLog,
  Exercise,
  FullSession,
} from '@/domain/entities';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';

const mockDb: SQLiteDatabase = {
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  runAsync: jest.fn().mockResolvedValue(undefined),
  execAsync: jest.fn().mockResolvedValue(undefined),
} as unknown as SQLiteDatabase;

jest.mock('@/storage/database/connection', () => ({
  getDatabase: jest.fn().mockResolvedValue(mockDb),
}));

const mockMMKVStore: Record<string, string> = {};
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn((key: string) => mockMMKVStore[key] ?? undefined),
    set: jest.fn((key: string, value: string) => {
      mockMMKVStore[key] = value;
    }),
    remove: jest.fn((key: string) => {
      delete mockMMKVStore[key];
    }),
    clearAll: jest.fn(() => {
      Object.keys(mockMMKVStore).forEach((k) => delete mockMMKVStore[k]);
    }),
    addOnValueChangedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('@/domain/services/prDetection', () => ({
  detectPRs: jest.fn().mockReturnValue([]),
}));

jest.mock('@/domain/calculations/volume', () => ({
  calculateSessionVolume: jest.fn().mockReturnValue(5000),
}));

jest.mock('@/features/settings/useSettings', () => ({
  getSettingsValue: jest.fn().mockReturnValue(0),
}));

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    is_custom: 0,
    is_favorite: 0,
    notes: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'ws-1',
    routine_id: null,
    routine_day_id: null,
    name: 'Test Workout',
    started_at: '2025-06-01T10:00:00.000Z',
    ended_at: null,
    duration_seconds: null,
    status: 'active',
    notes: null,
    created_at: '2025-06-01T10:00:00.000Z',
    updated_at: null,
    ...overrides,
  };
}

function makeSetLog(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'sl-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 100,
    reps: 10,
    set_type: 'normal',
    is_completed: 0,
    completed_at: null,
    notes: null,
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

function clearStore() {
  const { useActiveWorkoutStore } =
    require('@/features/workout/stores/activeWorkoutStore');
  jest.restoreAllMocks();
  useActiveWorkoutStore.setState({
    session: null,
    exercises: [],
    isResting: false,
    timerTargetEnd: null,
  });
  Object.keys(mockMMKVStore).forEach((k) => delete mockMMKVStore[k]);
  jest.clearAllMocks();
}

function mockWorkoutRepoMethods() {
  (mockDb.runAsync as jest.Mock).mockResolvedValue(undefined);
  (mockDb.execAsync as jest.Mock).mockResolvedValue(undefined);
}

describe('activeWorkoutStore', () => {
  beforeEach(() => {
    clearStore();
    mockWorkoutRepoMethods();
  });

  describe('startWorkout', () => {
    it('creates a new session with routine details', async () => {
      const session = makeSession({ routine_id: 'r-1', routine_day_id: 'rd-1', name: 'Push Day' });
      const routineExercise = makeWorkoutExerciseWithSets({
        id: 'we-routine',
        workout_session_id: session.id,
      });
      const fullSession: FullSession = {
        ...session,
        routine: null,
        routine_day: null,
        exercises: [routineExercise],
        personal_records: [],
      };
      (mockDb.runAsync as jest.Mock).mockResolvedValue(undefined);
      (mockDb.getFirstAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      (mockDb.runAsync as jest.Mock).mockResolvedValue(undefined);

      jest.spyOn(WorkoutRepo.prototype, 'createSession').mockResolvedValue(session);
      jest.spyOn(WorkoutRepo.prototype, 'getActiveSession').mockResolvedValue(null);
      jest.spyOn(WorkoutRepo.prototype, 'addRoutineDayExercisesToSession').mockResolvedValue([
        {
          id: routineExercise.id,
          workout_session_id: routineExercise.workout_session_id,
          exercise_id: routineExercise.exercise_id,
          sort_order: routineExercise.sort_order,
          notes: routineExercise.notes,
        },
      ]);
      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(fullSession);

      const result = await useActiveWorkoutStore.getState().startWorkout({
        routineId: 'r-1',
        routineDayId: 'rd-1',
        name: 'Push Day',
      });

      expect(result).toEqual(session);
      expect(WorkoutRepo.prototype.addRoutineDayExercisesToSession).toHaveBeenCalledWith('ws-1', 'rd-1');
      expect(useActiveWorkoutStore.getState().session).toEqual(session);
      expect(useActiveWorkoutStore.getState().exercises).toEqual([routineExercise]);
    });

    it('creates a freestyle session without routine', async () => {
      const session = makeSession({ name: 'Freestyle' });
      (mockDb.getFirstAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      jest.spyOn(WorkoutRepo.prototype, 'createSession').mockResolvedValue(session);
      jest.spyOn(WorkoutRepo.prototype, 'getActiveSession').mockResolvedValue(null);
      const preloadSpy = jest.spyOn(WorkoutRepo.prototype, 'addRoutineDayExercisesToSession');

      const result = await useActiveWorkoutStore.getState().startWorkout({ name: 'Freestyle' });

      expect(result.routine_id).toBeNull();
      expect(result.routine_day_id).toBeNull();
      expect(preloadSpy).not.toHaveBeenCalled();
    });

    it('returns existing active session when one exists', async () => {
      const existingSession = makeSession({ id: 'ws-existing', name: 'Existing' });
      const weWithSets = makeWorkoutExerciseWithSets({ id: 'we-existing' }, [makeSetLog()]);
      const fullSession: FullSession = {
        ...existingSession,
        routine: null,
        routine_day: null,
        exercises: [weWithSets],
        personal_records: [],
      };

      jest.spyOn(WorkoutRepo.prototype, 'getActiveSession').mockResolvedValue(existingSession);
      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(fullSession);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      const result = await useActiveWorkoutStore.getState().startWorkout({
        name: 'Should not create',
      });

      expect(result.id).toBe('ws-existing');
      expect(useActiveWorkoutStore.getState().exercises.length).toBe(1);
    });
  });

  describe('addSet', () => {
    it('adds a set and updates local state', async () => {
      const session = makeSession();
      const exercise = makeWorkoutExerciseWithSets();
      const newSet = makeSetLog({ id: 'sl-new', weight: 80, reps: 10, set_type: 'normal' });

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'addSet').mockResolvedValue(newSet);

      const result = await useActiveWorkoutStore.getState().addSet('we-1', {
        weight: 80,
        reps: 10,
      });

      expect(result).toEqual(newSet);
      const updatedExercises = useActiveWorkoutStore.getState().exercises;
      expect(updatedExercises[0].sets.length).toBe(1);
      expect(updatedExercises[0].sets[0].id).toBe('sl-new');
    });
  });

  describe('completeSet', () => {
    it('completes a set, triggers haptics, and may start timer', async () => {
      const session = makeSession();
      const set = makeSetLog({ is_completed: 0 });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [set]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'completeSet').mockResolvedValue(undefined);

      await useActiveWorkoutStore.getState().completeSet('ex-1', 'sl-1');

      const updated = useActiveWorkoutStore.getState().exercises[0].sets[0];
      expect(updated.is_completed).toBe(1);

      const Haptics = require('expo-haptics');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('starts rest timer when defaultRest is configured', async () => {
      const { getSettingsValue } = require('@/features/settings/useSettings');
      getSettingsValue.mockReturnValue(90);

      const session = makeSession();
      const set = makeSetLog({ is_completed: 0 });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [set]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'completeSet').mockResolvedValue(undefined);

      await useActiveWorkoutStore.getState().completeSet('ex-1', 'sl-1');

      expect(useActiveWorkoutStore.getState().isResting).toBe(true);
      expect(useActiveWorkoutStore.getState().timerTargetEnd).not.toBeNull();
    });
  });

  describe('updateSet', () => {
    it('updates weight and reps of a set', async () => {
      const session = makeSession();
      const set = makeSetLog({ weight: 100, reps: 10 });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [set]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'updateSet').mockResolvedValue(undefined);

      await useActiveWorkoutStore.getState().updateSet('sl-1', { weight: 120, reps: 8 });

      const updated = useActiveWorkoutStore.getState().exercises[0].sets[0];
      expect(updated.weight).toBe(120);
      expect(updated.reps).toBe(8);
    });
  });

  describe('deleteSet', () => {
    it('removes a set from local state', async () => {
      const session = makeSession();
      const set = makeSetLog({ id: 'sl-1' });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [set]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'deleteSet').mockResolvedValue(undefined);

      await useActiveWorkoutStore.getState().deleteSet('sl-1');

      expect(useActiveWorkoutStore.getState().exercises[0].sets.length).toBe(0);
    });
  });

  describe('addExercise', () => {
    it('throws if no active session', async () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      await expect(
        useActiveWorkoutStore.getState().addExercise('ex-1'),
      ).rejects.toThrow('no active session');
    });

    it('adds an exercise to the session', async () => {
      const session = makeSession();
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [] });

      const weWithSets = makeWorkoutExerciseWithSets({ id: 'we-new', exercise_id: 'ex-2' });
      weWithSets.exercise = makeExercise({ id: 'ex-2', name: 'Squat' });
      weWithSets.sets = [];

      const we = { id: 'we-new', workout_session_id: 'ws-1', exercise_id: 'ex-2', sort_order: 1, notes: null };
      const fullSession: FullSession = {
        ...session,
        routine: null,
        routine_day: null,
        exercises: [weWithSets],
        personal_records: [],
      };

      jest.spyOn(WorkoutRepo.prototype, 'addExercise').mockResolvedValue(we);
      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(fullSession);

      const result = await useActiveWorkoutStore.getState().addExercise('ex-2');

      expect(result.id).toBe('we-new');
      expect(useActiveWorkoutStore.getState().exercises.length).toBe(1);
    });
  });

  describe('removeExercise', () => {
    it('removes an exercise from local state', async () => {
      const session = makeSession();
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [makeSetLog()]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'removeExercise').mockResolvedValue(undefined);

      await useActiveWorkoutStore.getState().removeExercise('we-1');

      expect(useActiveWorkoutStore.getState().exercises.length).toBe(0);
    });
  });

  describe('reorderExercises', () => {
    it('reorders exercises by provided ID array', () => {
      const session = makeSession();
      const ex1 = makeWorkoutExerciseWithSets({ id: 'we-1', sort_order: 1 }, [makeSetLog({ id: 'sl-1' })]);
      const ex2 = makeWorkoutExerciseWithSets({ id: 'we-2', sort_order: 2 }, [makeSetLog({ id: 'sl-2' })]);
      const ex3 = makeWorkoutExerciseWithSets({ id: 'we-3', sort_order: 3 }, [makeSetLog({ id: 'sl-3' })]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [ex1, ex2, ex3] });

      useActiveWorkoutStore.getState().reorderExercises(['we-3', 'we-1', 'we-2']);

      const reordered = useActiveWorkoutStore.getState().exercises;
      expect(reordered.map((e: { id: string }) => e.id)).toEqual(['we-3', 'we-1', 'we-2']);
      expect(reordered[0].sort_order).toBe(1);
      expect(reordered[1].sort_order).toBe(2);
      expect(reordered[2].sort_order).toBe(3);
    });
  });

  describe('timer operations', () => {
    it('startTimer sets state and MMKV', () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      const before = Date.now();
      useActiveWorkoutStore.getState().startTimer(90);

      const state = useActiveWorkoutStore.getState();
      expect(state.isResting).toBe(true);
      expect(state.timerTargetEnd).toBeGreaterThanOrEqual(before + 90000);
    });

    it('getTimerRemaining returns remaining seconds', () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      const future = Date.now() + 45000;
      useActiveWorkoutStore.setState({ timerTargetEnd: future, isResting: true });

      const remaining = useActiveWorkoutStore.getState().getTimerRemaining();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(45);
    });

    it('getTimerRemaining returns 0 and clears state when expired', () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      const past = Date.now() - 1000;
      useActiveWorkoutStore.setState({ timerTargetEnd: past, isResting: true });

      const remaining = useActiveWorkoutStore.getState().getTimerRemaining();

      expect(remaining).toBe(0);
      expect(useActiveWorkoutStore.getState().isResting).toBe(false);
      expect(useActiveWorkoutStore.getState().timerTargetEnd).toBeNull();
    });

    it('skipTimer clears timer state', () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      useActiveWorkoutStore.setState({
        timerTargetEnd: Date.now() + 90000,
        isResting: true,
      });

      useActiveWorkoutStore.getState().skipTimer();

      const state = useActiveWorkoutStore.getState();
      expect(state.timerTargetEnd).toBeNull();
      expect(state.isResting).toBe(false);
    });
  });

  describe('finishWorkout', () => {
    it('throws if no active session', async () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      await expect(
        useActiveWorkoutStore.getState().finishWorkout(),
      ).rejects.toThrow('no active session');
    });

    it('throws if no completed sets', async () => {
      const session = makeSession();
      const set = makeSetLog({ is_completed: 0 });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [set]);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      await expect(
        useActiveWorkoutStore.getState().finishWorkout(),
      ).rejects.toThrow('at least one completed set is required');
    });

    it('completes workout, detects PRs, and returns summary', async () => {
      const session = makeSession({ started_at: '2025-06-01T10:00:00.000Z' });
      const completedSet = makeSetLog({ id: 'sl-1', is_completed: 1 });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [completedSet]);
      const fullSession: FullSession = {
        ...session,
        routine: null,
        routine_day: null,
        exercises: [exercise],
        personal_records: [],
      };

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [exercise] });

      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(fullSession);
      jest.spyOn(WorkoutRepo.prototype, 'getPRsBySession').mockResolvedValue([]);
      jest.spyOn(WorkoutRepo.prototype, 'getHistory').mockResolvedValue([]);
      jest.spyOn(WorkoutRepo.prototype, 'addPR').mockResolvedValue({} as any);
      jest.spyOn(WorkoutRepo.prototype, 'completeSession').mockResolvedValue(undefined);

      const { detectPRs } = require('@/domain/services/prDetection');
      detectPRs.mockReturnValue([
        {
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          type: 'max_weight',
          value: 100,
          previousBest: 90,
          improvement: 10,
          improvementPercent: 11.11,
        },
      ]);

      const summary = await useActiveWorkoutStore.getState().finishWorkout();

      expect(summary.status).toBe('completed');
      expect(summary.exercise_count).toBe(1);
      expect(summary.completed_set_count).toBe(1);
      expect(summary.personal_record_count).toBe(1);

      expect(useActiveWorkoutStore.getState().session).toBeNull();
      expect(useActiveWorkoutStore.getState().exercises).toEqual([]);
    });
  });

  describe('cancelWorkout', () => {
    it('cancels active session and clears state', async () => {
      const session = makeSession();
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      useActiveWorkoutStore.setState({ session, exercises: [] });

      jest.spyOn(WorkoutRepo.prototype, 'cancelSession').mockResolvedValue(undefined);

      await useActiveWorkoutStore.getState().cancelWorkout();

      expect(useActiveWorkoutStore.getState().session).toBeNull();
      expect(useActiveWorkoutStore.getState().exercises).toEqual([]);
    });

    it('does nothing when no active session', async () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
      await useActiveWorkoutStore.getState().cancelWorkout();
    });
  });

  describe('recoverSession', () => {
    it('recovers session from MMKV', async () => {
      const session = makeSession({ status: 'active' });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [makeSetLog({ is_completed: 1 })]);
      const fullSession: FullSession = {
        ...session,
        routine: null,
        routine_day: null,
        exercises: [exercise],
        personal_records: [],
      };

      mockMMKVStore['zenlift.workout.session_id'] = 'ws-1';

      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(fullSession);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      await useActiveWorkoutStore.getState().recoverSession();

      const state = useActiveWorkoutStore.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.id).toBe('ws-1');
      expect(state.exercises.length).toBe(1);
    });

    it('clears MMKV if session not found', async () => {
      mockMMKVStore['zenlift.workout.session_id'] = 'ws-missing';

      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(null);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      await useActiveWorkoutStore.getState().recoverSession();

      expect(useActiveWorkoutStore.getState().session).toBeNull();
      expect(mockMMKVStore['zenlift.workout.session_id']).toBeUndefined();
    });

    it('does nothing when no session in MMKV and no SQLite active session', async () => {
      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      jest.spyOn(WorkoutRepo.prototype, 'getActiveSession').mockResolvedValue(null);

      await useActiveWorkoutStore.getState().recoverSession();

      expect(useActiveWorkoutStore.getState().session).toBeNull();
    });

    it('falls back to SQLite when MMKV has no session ID but SQLite has an active session', async () => {
      const session = makeSession({ status: 'active' });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [makeSetLog()]);
      const fullSession: FullSession = {
        ...session,
        routine: null,
        routine_day: null,
        exercises: [exercise],
        personal_records: [],
      };

      // No MMKV session ID set
      delete mockMMKVStore['zenlift.workout.session_id'];

      (mockDb.getFirstAsync as jest.Mock)
        .mockResolvedValueOnce(null) // getFullSession with no MMKV id → null
        .mockResolvedValueOnce(session) // getActiveSession → found
        .mockResolvedValueOnce(fullSession); // getFullSession with active session id

      jest.spyOn(WorkoutRepo.prototype, 'getActiveSession').mockResolvedValue(session);
      jest.spyOn(WorkoutRepo.prototype, 'getFullSession').mockResolvedValue(fullSession);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      await useActiveWorkoutStore.getState().recoverSession();

      const state = useActiveWorkoutStore.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.id).toBe('ws-1');
      expect(state.exercises.length).toBe(1);
      // Should have set MMKV for future recovery
      expect(mockMMKVStore['zenlift.workout.session_id']).toBe('ws-1');
    });

    it('clears stale MMKV and falls back to SQLite when MMKV session is not active', async () => {
      const staleSession = makeSession({ id: 'ws-stale', status: 'cancelled' });
      const activeSession = makeSession({ id: 'ws-active', status: 'active' });
      const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' });
      const fullSession: FullSession = {
        ...activeSession,
        routine: null,
        routine_day: null,
        exercises: [exercise],
        personal_records: [],
      };

      mockMMKVStore['zenlift.workout.session_id'] = 'ws-stale';

      jest.spyOn(WorkoutRepo.prototype, 'getFullSession')
        .mockResolvedValueOnce({ ...staleSession, routine: null, routine_day: null, exercises: [], personal_records: [] } as FullSession)
        .mockResolvedValueOnce(fullSession);
      jest.spyOn(WorkoutRepo.prototype, 'getActiveSession').mockResolvedValue(activeSession);

      const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');

      await useActiveWorkoutStore.getState().recoverSession();

      const state = useActiveWorkoutStore.getState();
      expect(state.session?.id).toBe('ws-active');
      expect(mockMMKVStore['zenlift.workout.session_id']).toBe('ws-active');
    });
  });
});
