import { Alert } from 'react-native';
import { useActiveWorkoutStore, type StartWorkoutParams } from './stores/activeWorkoutStore';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';

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
): Promise<void> {
  console.log('[StartWorkoutFlow] ENTRY — params:', JSON.stringify(params));
  try {
    const db = await getDatabase();
    const workoutRepo = new WorkoutRepo(db);

    const activeSession = await workoutRepo.getActiveSession();
    console.log('[StartWorkoutFlow] getActiveSession result:', activeSession?.id ?? 'null');

    if (activeSession) {
      Alert.alert(
        'Sesión activa',
        'Ya tienes una sesión de workout activa. ¿Quieres continuarla o iniciar una nueva?',
        [
          {
            text: 'Nueva sesión',
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
                Alert.alert('Error', 'No se pudo iniciar la nueva sesión.');
              }
            },
          },
          {
            text: 'Continuar',
            onPress: async () => {
              try {
                await useActiveWorkoutStore.getState().startWorkout(params);
                if (params.exerciseId) {
                  await useActiveWorkoutStore.getState().addExercise(params.exerciseId);
                }
                console.log('[StartWorkoutFlow] Session recovered — store hydrated');
              } catch (error) {
                console.error('[StartWorkoutFlow] Failed to recover session:', error);
                Alert.alert('Error', 'No se pudo recuperar la sesión activa.');
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
    Alert.alert('Error', 'No se pudo iniciar la sesión de workout.');
  }
}
