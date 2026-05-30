# Tasks

## 1. OpenSpec

- [ ] 1.1 Add proposal, design, tasks, and delta spec for removing per-exercise collapse.
- [ ] 1.2 Reconcile the active `stabilize-active-workout-set-logging` delta if it still references expanded/collapsed exercise state.

## 2. Tests First

- [ ] 2.1 Add tests for exercise completion derivation.
- [ ] 2.2 Update exercise card memoization test helpers to remove collapse props.

## 3. Exercise Card

- [ ] 3.1 Remove `isExpanded` and `onToggle` from `WorkoutExerciseCardProps`.
- [ ] 3.2 Always render set rows and the add-set control.
- [ ] 3.3 Remove the chevron and header tap-to-collapse behavior.
- [ ] 3.4 Apply static completed opacity and a `Completado` badge.

## 4. Active Workout Screens

- [ ] 4.1 Remove `expandedExerciseId` state and first-exercise auto-expand from `src/app/workout/active.tsx`.
- [ ] 4.2 Remove auto-expand-next-on-complete from `src/app/workout/active.tsx`.
- [ ] 4.3 Remove per-exercise collapse state from `src/components/workout/ActiveWorkoutModal.tsx`.
- [ ] 4.4 Keep add-exercise scroll-to-new-card behavior.

## 5. Verification

- [ ] 5.1 Run focused Jest tests.
- [ ] 5.2 Run typecheck.
- [ ] 5.3 Run lint and document any pre-existing unrelated failures separately.
- [ ] 5.4 Run or update Playwright active workout smoke.
