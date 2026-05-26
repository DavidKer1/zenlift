import { createMMKV } from 'react-native-mmkv';

export const WORKOUT_MMKV_ID = 'zenlift-workout';

export const WORKOUT_SESSION_ID_KEY = 'zenlift.workout.session_id';

export const workoutStorage = createMMKV({
  id: WORKOUT_MMKV_ID,
});

export function getSessionId(): string | undefined {
  return workoutStorage.getString(WORKOUT_SESSION_ID_KEY);
}

export function setSessionId(sessionId: string): void {
  workoutStorage.set(WORKOUT_SESSION_ID_KEY, sessionId);
}

export function clearSessionId(): void {
  workoutStorage.remove(WORKOUT_SESSION_ID_KEY);
}
