import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useActiveWorkoutStore, type StartWorkoutParams } from './stores/activeWorkoutStore';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';

export async function startWorkoutFlow(
  params: StartWorkoutParams = {},
): Promise<void> {
  try {
    const db = await getDatabase();
    const workoutRepo = new WorkoutRepo(db);

    const activeSession = await workoutRepo.getActiveSession();

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
                router.push('/workout/active' as never);
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
                await useActiveWorkoutStore.getState().recoverSession();
                router.push('/workout/active' as never);
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

    await useActiveWorkoutStore.getState().startWorkout(params);
    router.push('/workout/active' as never);
  } catch (error) {
    console.error('[StartWorkoutFlow] Failed:', error);
    Alert.alert('Error', 'No se pudo iniciar la sesión de workout.');
  }
}
