import { createMMKV } from 'react-native-mmkv';

export const WORKOUT_MMKV_ID = 'zenlift-workout';

export const WORKOUT_SESSION_ID_KEY = 'zenlift.workout.session_id';
export const WORKOUT_TIMER_TARGET_KEY = 'zenlift.workout.timer_target';

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

export function getTimerTarget(): number | undefined {
  const value = workoutStorage.getString(WORKOUT_TIMER_TARGET_KEY);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function setTimerTarget(targetEnd: number): void {
  workoutStorage.set(WORKOUT_TIMER_TARGET_KEY, String(targetEnd));
}

export function clearTimerTarget(): void {
  workoutStorage.remove(WORKOUT_TIMER_TARGET_KEY);
}
