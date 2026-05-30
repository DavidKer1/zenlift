## Why

Active Workout is Zenlift's core loop, and set logging currently has stale UI behavior: completing a set can persist successfully while the check state and exercise count do not update until another state change forces a render. This is especially visible after adding a new exercise and then adding/completing sets, which makes the gym workflow feel unreliable.

## What Changes

- Ensure Active Workout exercise cards re-render when visible set state changes without relying on `sets.length`.
- Ensure set rows re-render when previous values, units, completion state, weight, reps, or set metadata change.
- Remove weight and reps `+` / `-` stepper buttons from Active Workout set rows.
- Keep weight input, reps input, and check button as large direct controls suitable for one-handed gym use.
- Expand and scroll to newly added exercises so the next action is immediately visible.
- Add regression tests for render freshness and active set completion behavior.

## Capabilities

### New Capabilities

- `active-workout-screen`: Covers Active Workout screen set logging UX, render freshness, simplified set row controls, and add-exercise continuity.

### Modified Capabilities

None.

## Impact

- Affected code: `src/app/workout/active.tsx`, `src/components/workout/WorkoutExerciseCard.tsx`, `src/components/workout/SetRow.tsx`, active workout tests, and optional Playwright smoke assertions.
- Affected user flow: add exercise, add set, edit weight/reps, complete set, finish workout.
- No database schema changes.
- No new dependencies.
- Existing SQLite autosave and active-session recovery paths remain unchanged.
