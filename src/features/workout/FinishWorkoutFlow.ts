import { Alert } from 'react-native';
import { router, type Href } from 'expo-router';
import { useActiveWorkoutStore } from '@/features/workout/stores/activeWorkoutStore';

function formatApproxDuration(seconds: number): string {
  if (seconds < 60) return 'menos de 1min';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (rm === 0) return `${h}h`;
  return `${h}h ${rm}min`;
}

export async function finishWorkoutFlow(): Promise<void> {
  const state = useActiveWorkoutStore.getState();
  const { exercises, session } = state;

  let completedCount = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.is_completed && set.set_type !== 'warmup') {
        completedCount++;
      }
    }
  }

  if (completedCount === 0) {
    Alert.alert(
      'Sin sets completados',
      'Registra al menos un set antes de finalizar',
    );
    return;
  }

  const approxDuration = session
    ? formatApproxDuration(
        Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000),
      )
    : '--';

  return new Promise<void>((resolve) => {
    Alert.alert(
      '¿Finalizar entrenamiento?',
      `${exercises.length} ejercicios · ${approxDuration}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(),
        },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              const summary = await state.finishWorkout();
              const serialized = JSON.stringify(summary);
              router.replace(`/workout/summary?summary=${encodeURIComponent(serialized)}` as Href);
              resolve();
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Error desconocido';
              Alert.alert('Error al finalizar', message);
              resolve();
            }
          },
        },
      ],
      { cancelable: false },
    );
  });
}
