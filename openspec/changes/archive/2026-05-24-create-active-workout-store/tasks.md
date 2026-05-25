## 1. Setup and MMKV utilities

- [x] 1.1 Create `src/features/workout/stores/` directory
- [x] 1.2 Create `src/features/workout/stores/activeWorkoutStore.ts` with Zustand `create` call and initial state
- [x] 1.3 Create `src/features/workout/stores/mmkv.ts` with Workout MMKV instance using ID `zenlift-workout`, MMKV key constants (`WORKOUT_SESSION_ID_KEY`, `WORKOUT_TIMER_TARGET_KEY`), and helper functions (`getSessionId`, `setSessionId`, `clearSessionId`, `getTimerTarget`, `setTimerTarget`, `clearTimerTarget`)
- [x] 1.4 Verify Zustand and expo-haptics are in package.json dependencies

## 2. Store interface and types

- [x] 2.1 Define `ActiveWorkoutState` interface (session, exercises, isResting, timerTargetEnd)
- [x] 2.2 Define `ActiveWorkoutActions` interface (all actions: startWorkout, addSet, completeSet, updateSet, deleteSet, addExercise, removeExercise, reorderExercises, startTimer, getTimerRemaining, skipTimer, finishWorkout, cancelWorkout, recoverSession)
- [x] 2.3 Define `StartWorkoutParams` type for startWorkout input
- [x] 2.4 Export typed `useActiveWorkoutStore` hook (store is internal, only actions are exposed)

## 3. Core workout lifecycle

- [x] 3.1 Implement `startWorkout`: check for existing active session (MMKV + getActiveSession), create or return existing session, persist sessionId to MMKV, load exercises from full session, load previous performance, set store state
- [x] 3.2 Implement `finishWorkout`: validate active session and >= 1 completed set, calculate duration from started_at, call `reloadFullSession()` for fresh data, call `detectPRs`, insert PRs via `addPR`, call `completeSession`, clear MMKV sessionId + timer, clear store state, return WorkoutSummary
- [x] 3.3 Implement `cancelWorkout`: call `cancelSession` in SQLite, clear store state, clear MMKV sessionId + timer
- [x] 3.4 Implement `recoverSession`: read sessionId from MMKV, call `getFullSession`, validate session exists and is active, populate session + exercises + previous performance, recover timer target from MMKV

## 4. Set operations

- [x] 4.1 Implement `addSet`: call `WorkoutRepo.addSet` with exerciseId and set data, update local exercises state with the new set
- [x] 4.2 Implement `completeSet`: call `WorkoutRepo.completeSet`, update local set's is_completed, trigger haptic feedback via `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`, start rest timer with default rest from settings if configured
- [x] 4.3 Implement `updateSet`: call `WorkoutRepo.updateSet`, update local set's weight/reps
- [x] 4.4 Implement `deleteSet`: call `WorkoutRepo.deleteSet`, remove set from local state

## 5. Exercise management

- [x] 5.1 Implement `addExercise`: call `WorkoutRepo.addExercise` with active sessionId and exerciseId, load exercise with sets, append to local exercises state
- [x] 5.2 Implement `removeExercise`: call `WorkoutRepo.removeExercise`, remove exercise and its sets from local state
- [x] 5.3 Implement `reorderExercises`: update local exercises order to match provided ID array, persist new sort_order to SQLite

## 6. Rest timer

- [x] 6.1 Implement `startTimer`: calculate `targetEnd = Date.now() + seconds * 1000`, set in store state, persist to MMKV, set `isResting = true`
- [x] 6.2 Implement `getTimerRemaining`: read `timerTargetEnd` from store, calculate `Math.max(0, Math.ceil((timerTargetEnd - Date.now()) / 1000))`, return seconds
- [x] 6.3 Implement `skipTimer`: clear `timerTargetEnd` in state, remove from MMKV, set `isResting = false`

## 7. Integration and validation

- [x] 7.1 Add `reloadFullSession()` internal helper that calls `getFullSession` and maps to store state shape for use in finishWorkout
- [x] 7.2 Write unit tests for `activeWorkoutStore` covering start, addSet, completeSet, finishWorkout, cancelWorkout, recoverSession (file: `src/features/workout/stores/__tests__/activeWorkoutStore.test.ts`)
- [x] 7.3 Run `npx tsc --noEmit` to verify typecheck
- [x] 7.4 Run `npx jest --testPathPattern="activeWorkoutStore"` to verify tests pass
