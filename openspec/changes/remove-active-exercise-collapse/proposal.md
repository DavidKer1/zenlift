# Remove Active Exercise Collapse

## Why

The Active Workout exercise card collapse/minimize behavior feels inconsistent while logging sets. It can hide newly relevant controls, compete with automatic scrolling, and adds state that is not necessary for the core gym flow.

## What Changes

- Remove per-exercise expand/collapse from Active Workout.
- Always render every exercise card's set rows and add-set control.
- Visually de-emphasize exercises only when all of their sets are complete.
- Use static React Native opacity styles, not blur, filters, timers, or animations.
- Keep completed exercises editable: users can uncheck sets, edit weight/reps, and add more sets.

## Impact

- Active Workout route and active workout modal card rendering become simpler.
- Tests must assert completion state is derived from set data, not from collapse state.
- The workout-level minimized overlay remains unchanged.
