import { Alert } from 'react-native';
import { useActiveWorkoutStore, type StartWorkoutParams } from './stores/activeWorkoutStore';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';

type Translate = (key: string, options?: Record<string, unknown>) => unknown;

export type StartWorkoutFlowCopy = {
  activeBody: string;
  activeTitle: string;
  continueLabel: string;
  errorTitle: string;
  newSession: string;
  recoverFailed: string;
  startFailed: string;
  startNewFailed: string;
};

export function createStartWorkoutFlowCopy(t: Translate): StartWorkoutFlowCopy {
  return {
    activeBody: String(t('workout.start.activeBody')),
    activeTitle: String(t('workout.start.activeTitle')),
    continueLabel: String(t('workout.start.continue')),
    errorTitle: String(t('common.error')),
    newSession: String(t('workout.start.newSession')),
    recoverFailed: String(t('workout.start.recoverFailed')),
    startFailed: String(t('workout.start.startFailed')),
    startNewFailed: String(t('workout.start.startNewFailed')),
  };
}

/**
 * Shared workout start flow used by Home Quick Workout, Routine Start, and
 * Exercise Detail quick-start.
 *
 * Hydrates useActiveWorkoutStore with an active session (creating one if
 * needed). The Home screen observes the store and renders ActiveWorkoutScreen
 * when a session is present — no Expo Router navigation needed.
 */
export async function startWorkoutFlow(
  params: StartWorkoutParams = {},
  copy: StartWorkoutFlowCopy,
): Promise<void> {
  console.log('[StartWorkoutFlow] ENTRY — params:', JSON.stringify(params));
  try {
    const db = await getDatabase();
    const workoutRepo = new WorkoutRepo(db);

    const activeSession = await workoutRepo.getActiveSession();
    console.log('[StartWorkoutFlow] getActiveSession result:', activeSession?.id ?? 'null');

    if (activeSession) {
      Alert.alert(
        copy.activeTitle,
        copy.activeBody,
        [
          {
            text: copy.newSession,
            style: 'destructive',
            onPress: async () => {
              try {
                await useActiveWorkoutStore.getState().cancelWorkout();
                await useActiveWorkoutStore.getState().startWorkout(params);
                if (params.exerciseId) {
                  await useActiveWorkoutStore.getState().addExercise(params.exerciseId);
                }
                console.log('[StartWorkoutFlow] New session created — store hydrated');
              } catch (error) {
                console.error('[StartWorkoutFlow] Failed to start new session:', error);
                Alert.alert(copy.errorTitle, copy.startNewFailed);
              }
            },
          },
          {
            text: copy.continueLabel,
            onPress: async () => {
              try {
                await useActiveWorkoutStore.getState().startWorkout(params);
                if (params.exerciseId) {
                  await useActiveWorkoutStore.getState().addExercise(params.exerciseId);
                }
                console.log('[StartWorkoutFlow] Session recovered — store hydrated');
              } catch (error) {
                console.error('[StartWorkoutFlow] Failed to recover session:', error);
                Alert.alert(copy.errorTitle, copy.recoverFailed);
              }
            },
          },
        ],
      );
      return;
    }

    console.log('[StartWorkoutFlow] No active session — creating via store.startWorkout');
    await useActiveWorkoutStore.getState().startWorkout(params);
    console.log('[StartWorkoutFlow] Store session id after startWorkout:', useActiveWorkoutStore.getState().session?.id);
    if (params.exerciseId) {
      await useActiveWorkoutStore.getState().addExercise(params.exerciseId);
      console.log('[StartWorkoutFlow] Added exercise:', params.exerciseId);
    }
    console.log('[StartWorkoutFlow] Store hydrated — Home screen will render ActiveWorkout');
  } catch (error) {
    console.error('[StartWorkoutFlow] Failed:', error);
    Alert.alert(copy.errorTitle, copy.startFailed);
  }
}
