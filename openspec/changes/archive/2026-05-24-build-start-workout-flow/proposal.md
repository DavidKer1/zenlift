## Why

Starting a workout is the core action in Zenlift, yet there is no unified entry point. The routine detail screen creates sessions via direct `WorkoutRepo` calls and the Home screen's CTA merely navigates to /routines. Users need a centralized flow that checks for existing active sessions and supports both routine-based and Quick (empty) workout starts.

## What Changes

- Create `StartWorkoutFlow` as a pure function/class that orchestrates workout initiation: checks for active sessions via `WorkoutRepo.getActiveSession()`, prompts the user to continue or start fresh, and delegates session creation to `activeWorkoutStore.startWorkout()`.
- Add a "Quick Workout" option on the Home screen that calls `StartWorkoutFlow` with no `routineId`, starting an empty workout immediately.
- Refactor `StartWorkoutButton.tsx` (routine detail) to use `StartWorkoutFlow` instead of direct `WorkoutRepo` calls. **BREAKING**: removes inline `createSession`/`addExercise` logic from the component.
- Support both paths: start from a routine day (loads exercises) or start Quick (empty session).

## Capabilities

### New Capabilities

- `start-workout-flow`: Centralized flow for checking active sessions and initiating workouts, delegating session management to `activeWorkoutStore`. Supports routine-based and Quick/empty starts.

### Modified Capabilities

- `home-screen`: The Home screen's Start Workout section gains a "Quick Workout" button alongside the existing "Start Workout" CTA that navigates to routines.

## Impact

- Creates `src/features/workout/StartWorkoutFlow.ts` (new module).
- Modifies `src/components/routine/StartWorkoutButton.tsx` to remove direct `WorkoutRepo` calls and use `StartWorkoutFlow` instead.
- Modifies `src/app/index.tsx` to add Quick Workout button alongside existing Start Workout CTA.
- Depends on Task 27 (`ActiveWorkoutStore` at `src/features/workout/stores/activeWorkoutStore.ts`) for `startWorkout()` and `cancelWorkout()` methods.
- Depends on existing `WorkoutRepo.getActiveSession()` and `WorkoutRepo.cancelSession()` for session check/prompt logic.
- Navigates to `/workout/active` after starting.
