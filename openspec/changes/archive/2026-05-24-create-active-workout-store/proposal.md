## Why

Screens need a single source of truth for the active workout session. Without a Zustand store, every screen would independently query SQLite, race on state, and duplicate session-recovery logic. The Active Workout screen -- the most performance-critical view in the app -- requires sub-3-second set logging with guaranteed persistence and autosave. Building the store now unblocks the entire workout flow UI.

## What Changes

- Create `src/features/workout/stores/activeWorkoutStore.ts` with a Zustand store managing active session state
- Store holds `session`, `exercises`, `isResting`, and `timerTargetEnd` -- all synced with SQLite on every mutation
- Every action (addSet, completeSet, updateSet, deleteSet, addExercise, removeExercise, reorderExercises) persists to SQLite immediately and updates local state
- `startWorkout` creates a session in SQLite, loads exercise data and previous performance, persists sessionId to MMKV for recovery
- `finishWorkout` validates at least 1 completed set, calculates duration, runs PR detection, completes the session, and clears MMKV
- `recoverSession` reads sessionId from MMKV, loads `getFullSession` from SQLite, reconstructs full store state (including rest timer)
- `startTimer`/`skipTimer`/`getTimerRemaining` manage rest timer via MMKV-persisted targetEnd
- Store uses Zustand WITHOUT persist middleware (state is reconstructed from SQLite on startup)
- Import `WorkoutRepo` singleton, `detectPRs` from domain services, expo-haptics, and MMKV for session ID and timer persistence

## Capabilities

### New Capabilities

- **active-workout-store**: Zustand store that manages the active workout session lifecycle including SQLite sync, session recovery from MMKV, rest timer management, PR detection on completion, and optimistic state updates for set logging.

### Modified Capabilities

<!-- No existing specs have their requirements changed. This is a new module that consumes existing capabilities. -->

## Impact

- New file: `src/features/workout/stores/activeWorkoutStore.ts` (the first Zustand store in the project)
- Dependencies consumed: `WorkoutRepo` (workout-repository), `detectPRs` (pr-detection), domain entities (domain-entities), expo-haptics, react-native-mmkv (already in deps)
- MMKV namespace: `zenlift.workout.session_id`, `zenlift.workout.timer_target`
- No breaking changes -- purely additive
- Unblocks Phase 4 workout screen implementation
