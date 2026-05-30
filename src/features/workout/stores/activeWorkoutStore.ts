import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import type {
  WorkoutSession,
  WorkoutExerciseWithSets,
  SetLog,
  SetType,
  FullSession,
  WorkoutSummary,
} from '@/domain/entities';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';
import { getDatabase } from '@/storage/database/connection';
import { detectPRs } from '@/domain/services/prDetection';
import { calculateSessionVolume } from '@/domain/calculations/volume';
import {
  getSessionId,
  setSessionId,
  clearSessionId,
} from './mmkv';

export interface StartWorkoutParams {
  routineId?: string;
  routineDayId?: string;
  name?: string;
  /** If set, the exercise will be added to the session after creation/recovery. */
  exerciseId?: string;
}

export interface ActiveWorkoutState {
  session: WorkoutSession | null;
  exercises: WorkoutExerciseWithSets[];
}

export interface ActiveWorkoutActions {
  startWorkout: (params: StartWorkoutParams) => Promise<WorkoutSession>;
  addSet: (
    workoutExerciseId: string,
    data: { weight: number; reps: number; set_type?: SetType; notes?: string },
  ) => Promise<SetLog>;
  completeSet: (exerciseId: string, setId: string) => Promise<void>;
  updateSet: (
    setId: string,
    data: { weight?: number; reps?: number; set_type?: SetType; notes?: string },
  ) => Promise<void>;
  deleteSet: (setId: string) => Promise<void>;
  addExercise: (exerciseId: string) => Promise<WorkoutExerciseWithSets>;
  removeExercise: (workoutExerciseId: string) => Promise<void>;
  reorderExercises: (orderedIds: string[]) => void;
  finishWorkout: () => Promise<WorkoutSummary>;
  cancelWorkout: () => Promise<void>;
  recoverSession: () => Promise<void>;
}

export type ActiveWorkoutStore = ActiveWorkoutState & ActiveWorkoutActions;

let _repoPromise: Promise<WorkoutRepo> | null = null;

async function getRepo(): Promise<WorkoutRepo> {
  if (_repoPromise) {
    return _repoPromise;
  }
  _repoPromise = getDatabase().then((db) => new WorkoutRepo(db));
  return _repoPromise;
}

function countCompletedSets(exercises: WorkoutExerciseWithSets[]): number {
  let count = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.is_completed) count++;
    }
  }
  return count;
}

function computeDurationSeconds(startedAt: string): number {
  return Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>((set, get) => ({
  session: null,
  exercises: [],

  startWorkout: async (params) => {
    const existingMMKVSid = getSessionId();
    if (existingMMKVSid) {
      const repo = await getRepo();
      const existing = await repo.getActiveSession();
      if (existing && existing.id === existingMMKVSid && existing.status === 'active') {
        const full = await repo.getFullSession(existing.id);
        if (full) {
          set({
            session: {
              id: full.id,
              routine_id: full.routine_id,
              routine_day_id: full.routine_day_id,
              name: full.name,
              started_at: full.started_at,
              ended_at: full.ended_at,
              duration_seconds: full.duration_seconds,
              status: full.status,
              notes: full.notes,
              created_at: full.created_at,
              updated_at: full.updated_at,
            },
            exercises: full.exercises,
          });
          return existing;
        }
      }
      clearSessionId();
    }

    const repo = await getRepo();
    const existingActive = await repo.getActiveSession();
    if (existingActive) {
      const full = await repo.getFullSession(existingActive.id);
      if (full) {
        setSessionId(full.id);
        set({
          session: {
            id: full.id,
            routine_id: full.routine_id,
            routine_day_id: full.routine_day_id,
            name: full.name,
            started_at: full.started_at,
            ended_at: full.ended_at,
            duration_seconds: full.duration_seconds,
            status: full.status,
            notes: full.notes,
            created_at: full.created_at,
            updated_at: full.updated_at,
          },
          exercises: full.exercises,
        });
        return existingActive;
      }
    }

    const session = await repo.createSession({
      name: params.name,
      routineId: params.routineId,
      routineDayId: params.routineDayId,
    });

    if (params.routineDayId) {
      await repo.addRoutineDayExercisesToSession(session.id, params.routineDayId);
      const fullSession = await repo.getFullSession(session.id);

      if (fullSession) {
        setSessionId(fullSession.id);
        set({
          session: {
            id: fullSession.id,
            routine_id: fullSession.routine_id,
            routine_day_id: fullSession.routine_day_id,
            name: fullSession.name,
            started_at: fullSession.started_at,
            ended_at: fullSession.ended_at,
            duration_seconds: fullSession.duration_seconds,
            status: fullSession.status,
            notes: fullSession.notes,
            created_at: fullSession.created_at,
            updated_at: fullSession.updated_at,
          },
          exercises: fullSession.exercises,
        });
        return session;
      }
    }

    setSessionId(session.id);
    set({
      session,
      exercises: [],
    });
    return session;
  },

  addSet: async (workoutExerciseId, data) => {
    const repo = await getRepo();
    const setLog = await repo.addSet(workoutExerciseId, data);
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === workoutExerciseId
          ? { ...ex, sets: [...ex.sets, setLog] }
          : ex,
      ),
    }));
    return setLog;
  },

  completeSet: async (_exerciseId, setId) => {
    const repo = await getRepo();
    const currentSet = get()
      .exercises.flatMap((ex) => ex.sets)
      .find((setLog) => setLog.id === setId);
    const shouldUncomplete = currentSet?.is_completed === 1;
    const completedAt = shouldUncomplete ? null : new Date().toISOString();

    if (shouldUncomplete) {
      await repo.uncompleteSet(setId);
    } else {
      await repo.completeSet(setId);
    }

    set((state) => ({
      exercises: state.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) =>
          s.id === setId
            ? {
                ...s,
                is_completed: shouldUncomplete ? 0 as const : 1 as const,
                completed_at: completedAt,
              }
            : s,
        ),
      })),
    }));

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics may not be available on all platforms
    }
  },

  updateSet: async (setId, data) => {
    const repo = await getRepo();
    await repo.updateSet(setId, data);

    set((state) => ({
      exercises: state.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => {
          if (s.id !== setId) return s;
          return {
            ...s,
            weight: data.weight !== undefined ? data.weight : s.weight,
            reps: data.reps !== undefined ? data.reps : s.reps,
            set_type: data.set_type !== undefined ? data.set_type : s.set_type,
            notes: data.notes !== undefined ? data.notes : s.notes,
          };
        }),
      })),
    }));
  },

  deleteSet: async (setId) => {
    const repo = await getRepo();
    await repo.deleteSet(setId);

    set((state) => ({
      exercises: state.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.filter((s) => s.id !== setId),
      })),
    }));
  },

  addExercise: async (exerciseId) => {
    const repo = await getRepo();
    const { session } = get();
    if (!session) {
      throw new Error('[ActiveWorkoutStore] addExercise: no active session');
    }

    const workoutExercise = await repo.addExercise(session.id, exerciseId);
    const fullSession = await repo.getFullSession(session.id);
    const exerciseWithSets = fullSession?.exercises.find(
      (we) => we.id === workoutExercise.id,
    );

    if (exerciseWithSets) {
      set((state) => ({
        exercises: [...state.exercises, exerciseWithSets],
      }));
    }

    return (
      exerciseWithSets ?? {
        ...workoutExercise,
        exercise: { id: exerciseId } as WorkoutExerciseWithSets['exercise'],
        sets: [],
      }
    );
  },

  removeExercise: async (workoutExerciseId) => {
    const repo = await getRepo();
    await repo.removeExercise(workoutExerciseId);

    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== workoutExerciseId),
    }));
  },

  reorderExercises: (orderedIds) => {
    set((state) => {
      const exerciseMap = new Map(
        state.exercises.map((ex) => [ex.id, ex]),
      );
      const reordered = orderedIds
        .map((id, index) => {
          const ex = exerciseMap.get(id);
          if (!ex) return null;
          return { ...ex, sort_order: index + 1 };
        })
        .filter((ex): ex is WorkoutExerciseWithSets => ex !== null);

      return { exercises: reordered };
    });
  },

  finishWorkout: async () => {
    const { session, exercises } = get();
    if (!session) {
      throw new Error('[ActiveWorkoutStore] finishWorkout: no active session');
    }

    const completedCount = countCompletedSets(exercises);
    if (completedCount === 0) {
      throw new Error(
        '[ActiveWorkoutStore] finishWorkout: at least one completed set is required',
      );
    }

    const repo = await getRepo();
    const fullSession = await repo.getFullSession(session.id);
    if (!fullSession) {
      throw new Error(
        '[ActiveWorkoutStore] finishWorkout: session not found in database',
      );
    }

    const previousPRs = await repo.getPRsBySession(session.id);
    const historySessions = await repo.getHistory(20, 0);
    const historyIds = historySessions.map((s) => s.id);
    const allHistory: FullSession[] = [];
    for (const historyId of historyIds) {
      const histFull = await repo.getFullSession(historyId);
      if (histFull) {
        allHistory.push(histFull);
      }
    }

    const detectedResults = detectPRs(fullSession, previousPRs, allHistory);

    for (const pr of detectedResults) {
      if (pr.type === 'max_session_volume') continue;
      await repo.addPR({
        exerciseId: pr.exerciseId,
        workoutSessionId: session.id,
        type: pr.type,
        value: pr.value,
        weight: pr.exerciseId ? pr.value : null,
        reps: pr.type === 'max_reps' ? pr.value : null,
      });
    }

    await repo.completeSession(session.id);

    const durationSeconds = computeDurationSeconds(session.started_at);
    const totalVolume = calculateSessionVolume(fullSession.exercises);

    clearSessionId();

    set({
      session: null,
      exercises: [],
    });

    const summary: WorkoutSummary = {
      session_id: session.id,
      routine_id: session.routine_id,
      routine_day_id: session.routine_day_id,
      name: session.name,
      started_at: session.started_at,
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      status: 'completed',
      exercise_count: fullSession.exercises.length,
      completed_set_count: completedCount,
      total_volume: totalVolume,
      personal_record_count: detectedResults.length,
      prs: detectedResults,
    };

    return summary;
  },

  cancelWorkout: async () => {
    const { session } = get();
    if (!session) return;

    const repo = await getRepo();
    await repo.cancelSession(session.id);

    clearSessionId();

    set({
      session: null,
      exercises: [],
    });
  },

  recoverSession: async () => {
    const mmkvSessionId = getSessionId();
    const repo = await getRepo();

    // Try MMKV first, fall back to SQLite active-session lookup
    let fullSession: FullSession | null = null;

    if (mmkvSessionId) {
      fullSession = await repo.getFullSession(mmkvSessionId);
    }

    if (!fullSession || fullSession.status !== 'active') {
      // Fallback: check SQLite for any active session not tracked by MMKV
      const activeSession = await repo.getActiveSession();
      if (activeSession) {
        fullSession = await repo.getFullSession(activeSession.id);
        if (fullSession && fullSession.status === 'active') {
          setSessionId(fullSession.id);
        }
      }
    }

    if (!fullSession || fullSession.status !== 'active') {
      clearSessionId();
      return;
    }

    set({
      session: {
        id: fullSession.id,
        routine_id: fullSession.routine_id,
        routine_day_id: fullSession.routine_day_id,
        name: fullSession.name,
        started_at: fullSession.started_at,
        ended_at: fullSession.ended_at,
        duration_seconds: fullSession.duration_seconds,
        status: fullSession.status,
        notes: fullSession.notes,
        created_at: fullSession.created_at,
        updated_at: fullSession.updated_at,
      },
      exercises: fullSession.exercises,
    });
  },
}));
