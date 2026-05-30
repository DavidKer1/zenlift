import { Alert } from 'react-native';
import { router, type Href } from 'expo-router';
import { useActiveWorkoutStore } from '@/features/workout/stores/activeWorkoutStore';

type Translate = (key: string, options?: Record<string, unknown>) => unknown;

export type FinishWorkoutFlowCopy = {
  cancel: string;
  confirmBody: (count: number, duration: string) => string;
  confirmTitle: string;
  errorFallback: string;
  errorTitle: string;
  finish: string;
  lessThanOneMinute: string;
  noSetsBody: string;
  noSetsTitle: string;
};

export function createFinishWorkoutFlowCopy(t: Translate): FinishWorkoutFlowCopy {
  return {
    cancel: String(t('common.cancel')),
    confirmBody: (count, duration) =>
      String(t('workout.finish.confirmBody', { count, duration })),
    confirmTitle: String(t('workout.finish.confirmTitle')),
    errorFallback: String(t('workout.finish.errorFallback')),
    errorTitle: String(t('workout.finish.errorTitle')),
    finish: String(t('workout.active.finishShort')),
    lessThanOneMinute: String(t('workout.finish.lessThanOneMinute')),
    noSetsBody: String(t('workout.finish.noSetsBody')),
    noSetsTitle: String(t('workout.finish.noSetsTitle')),
  };
}

function formatApproxDuration(seconds: number, lessThanOneMinute: string): string {
  if (seconds < 60) return lessThanOneMinute;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (rm === 0) return `${h}h`;
  return `${h}h ${rm}min`;
}

export async function finishWorkoutFlow(copy: FinishWorkoutFlowCopy): Promise<void> {
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
      copy.noSetsTitle,
      copy.noSetsBody,
    );
    return;
  }

  const approxDuration = session
    ? formatApproxDuration(
        Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000),
        copy.lessThanOneMinute,
      )
    : '--';

  return new Promise<void>((resolve) => {
    Alert.alert(
      copy.confirmTitle,
      copy.confirmBody(completedCount, approxDuration),
      [
        {
          text: copy.cancel,
          style: 'cancel',
          onPress: () => resolve(),
        },
        {
          text: copy.finish,
          onPress: async () => {
            try {
              const summary = await state.finishWorkout();
              const serialized = JSON.stringify(summary);
              router.replace(`/workout/summary?summary=${encodeURIComponent(serialized)}` as Href);
              resolve();
            } catch (err) {
              const message =
                err instanceof Error ? err.message : copy.errorFallback;
              Alert.alert(copy.errorTitle, message);
              resolve();
            }
          },
        },
      ],
      { cancelable: false },
    );
  });
}
