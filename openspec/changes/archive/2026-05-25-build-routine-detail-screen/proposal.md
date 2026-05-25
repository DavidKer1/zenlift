## Why

The Routines tab leads to individual routines with no detail view. Users need to see a routine's days and exercises, edit targets, reorder exercises, duplicate routines, and start workouts from a specific day. This screen is the bridge between routine planning and the active workout flow.

## What Changes

- Create `app/routine/[id].tsx` as a detail screen that loads a full routine tree via `RoutineRepo.getFullRoutine(id)`.
- Render the routine header with name, description, and action buttons (edit name, duplicate, archive/delete).
- Render `DaySection` components for each day, each containing a list of `ExerciseRow` components showing exercise name, primary muscle (colored dot), target sets x reps, and rest time.
- Support drag-to-reorder exercises via `RoutineRepo.reorderExercises()`.
- Add a `StartWorkoutButton` on each day that creates an active `WorkoutSession` pre-populated with the day's exercises.
- Navigate to exercise library to add exercises to a day via `RoutineRepo.createExercise()`.
- Implement routine duplication via `RoutineRepo.duplicate()` with new UUIDs.
- Implement routine archive via `RoutineRepo.archive()` and delete with confirmation alert.
- Implement inline routine name editing via `RoutineRepo.update()`.
- Keep the screen thin: data fetching through repository, UI through presentational components, no heavy business logic in the route file.

## Capabilities

### New Capabilities

- `routine-detail-screen`: Full routine detail screen showing days and exercises, with actions to edit, duplicate, archive/delete, add exercises, reorder exercises, and start a workout from a specific day.

### Modified Capabilities

## Impact

- Creates `src/app/routine/[id].tsx` (new Expo Router dynamic route).
- Adds components: `RoutineHeader`, `DaySection`, `ExerciseRow`, `StartWorkoutButton` under `src/components/routine/`.
- Reads from `RoutineRepo` (already implemented: `getFullRoutine`, `update`, `duplicate`, `archive`, `delete`, `createExercise`, `deleteExercise`, `reorderExercises`).
- Writes to `WorkoutRepo.createSession()` and `WorkoutRepo.addExercise()` for starting workouts.
- Depends on existing theme provider, base tab navigation, and domain entities.
- No new dependencies required.
