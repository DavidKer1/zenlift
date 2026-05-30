# Design: Remove Active Exercise Collapse

## Current Problem

`WorkoutExerciseCard` receives `isExpanded` and `onToggle`, then conditionally renders set rows. Both active workout entry points maintain `expandedExerciseId`, auto-expand the first exercise, and auto-expand the next exercise when all sets are complete. That state is extra work for a flow whose fastest path is seeing and logging sets immediately.

## Proposed Design

Exercise cards are always expanded. Completion is derived locally:

```ts
export function isWorkoutExerciseComplete(exercise: WorkoutExerciseWithSets): boolean {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.is_completed === 1);
}
```

When an exercise is complete, the card applies a static opacity style to non-structural content. The card remains mounted and interactive. The check button remains pressable so a completed set can be unchecked.

## Visual Treatment

- Use `opacity: 0.58` as a single static style for completed exercise content.
- Keep the card border, add-set button, and touch targets active.
- Keep the completion counter visible and add a textual `Completado` badge so completion is not communicated by opacity alone.
- Do not use `BlurView`, gradients, Reanimated, timers, or layout animation for this state.

## Non-Goals

- Do not remove the workout-level minimized header/modal behavior.
- Do not change set persistence, finish workout validation, or rest timer behavior.
- Do not introduce a new global UI state for completed exercises.
