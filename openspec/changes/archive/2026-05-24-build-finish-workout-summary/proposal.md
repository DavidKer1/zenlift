## Why

The finish workout flow (confirmation → calculations → save → summary screen) is the culmination of the core workout loop. Without it, users can start workouts but never complete them or see session results, new PRs, and progress comparisons. Building this now completes the main product loop end-to-end.

## What Changes

- Create `src/features/workout/FinishWorkoutFlow.ts` — orchestration function that validates at least 1 completed set, shows confirmation with session preview, calls `activeWorkoutStore.finishWorkout()` (which runs PR detection, saves PRs, calculates duration, marks session complete, returns `WorkoutSummary`), and navigates to summary
- Create `src/app/workout/summary.tsx` — summary screen displaying celebration header with duration, total volume, exercise/set counts, PR highlight cards, comparison vs previous session deltas, optional notes input, and navigation to Home or History
- Modify `src/app/workout/active.tsx` — wire Finish button to `FinishWorkoutFlow`

## Capabilities

### New Capabilities

- **finish-workout-flow**: Orchestration logic that validates, confirms, and executes workout completion — bridging the active workout screen to the summary screen via the active workout store
- **workout-summary-screen**: Post-workout summary screen showing session results, PRs, previous-session comparison, notes, and navigation home

### Modified Capabilities

<!-- No existing specs have their requirements changed. This is a new consumer of existing capabilities. -->

## Impact

- New files: `src/features/workout/FinishWorkoutFlow.ts`, `src/app/workout/summary.tsx`
- Modified files: `src/app/workout/active.tsx` (wire Finish button)
- Dependencies consumed: `activeWorkoutStore` (active-workout-store), `detectPRs` (pr-detection), `calculateSessionVolume` (domain-volume-calculation), `WorkoutRepo` (workout-repository), `WorkoutSummary` type (domain-entities)
- **Depends on**: `build-active-workout-screen` (task 29) — provides the Finish button and activeWorkoutStore state
- Navigation: adds `/workout/summary` route with summary data passed as params
- No breaking changes — purely additive
