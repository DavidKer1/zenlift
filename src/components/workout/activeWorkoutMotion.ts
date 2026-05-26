import { Platform } from 'react-native';
import { SharedTransition } from 'react-native-reanimated';

export const ACTIVE_WORKOUT_SHARED_TAGS = {
  headerContainer: 'active-workout-header-container',
  title: 'active-workout-header-title',
  timer: 'active-workout-header-timer',
} as const;

export const activeWorkoutSharedTransition = Platform.OS === 'web'
  ? undefined
  : SharedTransition.duration(220);

export function getActiveWorkoutSharedProps(tag: string) {
  if (Platform.OS === 'web') {
    return {};
  }

  return {
    sharedTransitionStyle: activeWorkoutSharedTransition,
    sharedTransitionTag: tag,
  };
}
