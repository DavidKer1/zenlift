## Context

Zenlift is a local-first mobile workout tracker where Active Workout is the highest-priority screen. The critical path is adding exercises, logging sets, completing sets, and finishing a session without losing data or making the user second-guess whether a tap registered.

Current Active Workout state is managed in `useActiveWorkoutStore` and persisted through `WorkoutRepo`. The reported stale-state behavior is not primarily a persistence issue: `completeSet()` updates SQLite and produces new Zustand state, but `WorkoutExerciseCard` is memoized with a comparator that only checks `exercise.sets.length`. Completing a set changes `is_completed` while length stays the same, so the UI can skip the render that would show the check state and updated completed count.

There is also adjacent UI debt: `SetRow` ignores previous-value props in its memo comparator, stepper buttons make the row crowded, and newly added exercises are not consistently expanded or scrolled into view.

## Goals / Non-Goals

**Goals:**

- Make completed-set state render immediately after the store update.
- Keep previous-value labels current when neighboring set state changes.
- Simplify set rows to direct numeric inputs plus a completion check button.
- Preserve local-first autosave and existing SQLite session recovery.
- Make newly added exercises immediately actionable by expanding and scrolling to them.
- Add focused regression tests around memoization and active workout state changes.

**Non-Goals:**

- No database schema changes.
- No backend, sync, analytics, coach dashboard, marketplace, nutrition, or social behavior.
- No rest timer or break behavior.
- No broad redesign of Active Workout outside the stale-state and row-control fixes.
- No routine editing changes.

## Decisions

1. **Fix render freshness at the memo comparator boundary.**

   `WorkoutExerciseCard` will expose and use `areWorkoutExerciseCardPropsEqual()`. The comparator will compare the visible set fields that affect the rendered card and rows: set id, set number, weight, reps, set type, completion flag, completed timestamp, and notes. It will also compare expansion state, unit, exercise identity/name, previous performance, and optional muscle metadata.

   Alternative considered: remove `React.memo` from `WorkoutExerciseCard`. That would be correct but throws away useful optimization for large workouts. A field-aware comparator preserves the existing performance intent while fixing correctness.

2. **Fix row freshness with an explicit `SetRow` comparator.**

   `SetRow` will expose and use `areSetRowPropsEqual()`. The comparator will include previous weight/reps and unit in addition to the row's own set id, number, weight, reps, type, and completion state.

   Alternative considered: depend on parent card rerender only. That still leaves the row comparator able to suppress visible previous-label changes, so the row needs its own correction.

3. **Remove stepper controls instead of hiding them behind a flag.**

   The current product request is to remove `+` and `-` buttons. Keeping a feature flag or dormant prop would preserve complexity without a current requirement. `increment` will be removed from `SetRow`, `WorkoutExerciseCard`, and the active screen path.

   Alternative considered: make steppers optional. That is unnecessary for this fix and risks reintroducing crowded controls.

4. **Keep persistence unchanged.**

   `WorkoutRepo.completeSet()`, `WorkoutRepo.updateSet()`, and store actions already write the set data. The bug is visual stale state, so repository changes are not part of the first implementation pass.

   Alternative considered: refetch the whole full session after every completion. That would mask the memo bug, add latency, and make the core set logging path heavier.

5. **Expand and scroll after `addExercise()` returns.**

   `active.tsx` will use the returned workout exercise id from `addExercise()` to set `expandedExerciseId`, locate its index in the store, and attempt a deferred FlashList scroll. Scroll failures will not block the addition.

   Alternative considered: rely on the existing first-exercise expansion effect. That only helps empty workouts and leaves the reported add-exercise path awkward.

## Risks / Trade-offs

- **[Risk] More complete comparator checks can increase renders.** Mitigation: the active workout list is bounded by practical workout size, and correctness in the logging path matters more than avoiding every render.
- **[Risk] Comparator signatures can drift as visible fields are added.** Mitigation: export comparator helpers and add regression tests so future visible prop additions have an obvious test surface.
- **[Risk] Removing steppers changes an archived expectation.** Mitigation: this change introduces the active current spec for simplified set rows; archived specs remain history.
- **[Risk] FlashList may not have measured the newly added item when scroll runs.** Mitigation: defer scroll with `requestAnimationFrame` and catch scroll errors; expansion still makes the new exercise actionable.
- **[Risk] There are pre-existing local changes in `BottomBar.tsx` and `src/theme/index.ts`.** Mitigation: implementation must inspect and preserve those changes before touching `BottomBar.tsx`, and should avoid `src/theme/index.ts`.

## Migration Plan

No data migration is required. This is a UI/render behavior change over existing local state and SQLite persistence.

Implementation should land in small commits: OpenSpec artifacts, failing render tests, card comparator fix, row simplification, add-exercise continuity, store regression, optional copy cleanup, and verification notes.

Rollback is local to `active.tsx`, `WorkoutExerciseCard.tsx`, `SetRow.tsx`, and tests. Reverting these changes does not require data cleanup.

## Open Questions

None. The product decision is to remove the `+` and `-` buttons for this phase.
