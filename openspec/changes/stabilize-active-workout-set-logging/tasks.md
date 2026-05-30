## 1. Render Freshness Tests

- [x] 1.1 Create `src/components/workout/__tests__/activeWorkoutRenderState.test.ts` with failing tests for `WorkoutExerciseCard` re-rendering when a set changes completion, weight, reps, or set number without changing `sets.length`.
- [x] 1.2 Add failing tests in the same file for `SetRow` re-rendering when `previousWeight`, `previousReps`, or `unit` changes.
- [x] 1.3 Run `pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts` and confirm it fails because comparator helpers are not exported yet.

## 2. WorkoutExerciseCard Comparator

- [x] 2.1 Export `WorkoutExerciseCardProps` from `src/components/workout/WorkoutExerciseCard.tsx`.
- [x] 2.2 Add `areWorkoutExerciseCardPropsEqual()` that compares exercise identity/name, set id, set number, weight, reps, set type, completion flag, completed timestamp, notes, expansion state, unit, previous performance, and muscle metadata.
- [x] 2.3 Replace the existing `React.memo` inline comparator with `areWorkoutExerciseCardPropsEqual`.
- [x] 2.4 Run `pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts` and confirm only the missing `SetRow` comparator work remains.

## 3. Simplified SetRow

- [x] 3.1 Export `SetRowProps` from `src/components/workout/SetRow.tsx` and remove the `increment` prop.
- [x] 3.2 Remove the weight and reps `+` / `-` stepper handlers and pressable controls from `SetRow`.
- [x] 3.3 Increase weight input, reps input, and check button dimensions to at least 48px while keeping the row stable and scannable.
- [x] 3.4 Add `areSetRowPropsEqual()` that compares set id, set number, previous weight/reps, weight, reps, set type, completion state, and unit.
- [x] 3.5 Replace the existing `SetRow` `React.memo` inline comparator with `areSetRowPropsEqual`.
- [x] 3.6 Remove `increment` from `WorkoutExerciseCardProps`, `WorkoutExerciseCardComponent`, the `<SetRow />` call site, and `src/app/workout/active.tsx`.
- [x] 3.7 Run `pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts` and confirm it passes.

## 4. Add Exercise Continuity

- [x] 4.1 Update `handleExerciseSelected` in `src/app/workout/active.tsx` to use the `addExercise()` return value.
- [x] 4.2 Set `expandedExerciseId` to the newly added workout exercise id after successful selection.
- [x] 4.3 Locate the newly added exercise index from `useActiveWorkoutStore.getState().exercises`.
- [x] 4.4 Attempt a deferred `FlashList` scroll to the new exercise with `requestAnimationFrame`, and catch scroll errors without blocking the add flow.
- [x] 4.5 Keep the existing ExercisePicker close behavior and failure alert.
- [x] 4.6 Run `pnpm typecheck` and fix any `FlashListRef` typing issue by removing unsupported fallback scroll calls. No FlashList typing issue remained; final typecheck passed after later active workout toggle changes.

## 5. Store Regression

- [x] 5.1 Add a regression test in `src/features/workout/stores/__tests__/activeWorkoutStore.test.ts` proving `completeSet()` replaces the containing exercise object and completed set object while preserving unaffected set references.
- [x] 5.2 Run `pnpm test -- src/features/workout/stores/__tests__/activeWorkoutStore.test.ts` and confirm it passes.

## 6. UX Copy And Local Changes

- [x] 6.1 Inspect `git diff -- src/components/workout/BottomBar.tsx` before editing because the file had pre-existing local changes when this proposal was created.
- [x] 6.2 Change `+ Add Set` in `WorkoutExerciseCard.tsx` to Spanish copy such as `+ Agregar set`.
- [x] 6.3 If compatible with existing local changes, change bottom bar action copy from `Add Exercise` and `Finish Workout` to Spanish labels.
- [x] 6.4 Run `pnpm lint` and confirm copy/style changes do not introduce lint failures. Lint is currently blocked by unrelated `src/i18n/__tests__/locales.test.ts` import resolution from another active change; no active workout copy/style error was reported.

## 7. Agent Smoke Coverage

- [x] 7.1 Inspect `e2e/playwright/core-loop.spec.ts` for the current active workout flow and available test IDs.
- [x] 7.2 Add a focused assertion that after tapping a set check button, the completion control has an accessible completed state or visible completed label.
- [x] 7.3 If the smoke flow covers adding an exercise, assert the newly added exercise exposes its add-set control immediately. The current smoke starts from a routine and does not cover add-exercise during Active Workout.
- [x] 7.4 Run `pnpm test:agent:web` when Expo web is available, or record the concrete blocker if web smoke is blocked by existing Expo SQLite web issues. Blocked before test execution: Expo web server prompts in non-interactive mode with `Required input: > Use port null instead?`, including with `EXPO_WEB_PORT=8090`.

## 8. Final Verification

- [x] 8.1 Run `pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts src/features/workout/stores/__tests__/activeWorkoutStore.test.ts`.
- [x] 8.2 Run `pnpm typecheck`. Passed after the active workout toggle changes.
- [x] 8.3 Run `pnpm lint`. Blocked by unrelated i18n worktree state: `src/i18n/__tests__/locales.test.ts` cannot resolve `@/i18n/locales`.
- [ ] 8.4 Manually smoke test: start or continue workout, add exercise, confirm it expands, add set, edit weight/reps, tap check, verify completed state and header count update immediately, add another set, and finish workout. Not completed in this session because Expo web smoke could not start; requires native/manual app run.
- [x] 8.5 Rebuild Graphify with `/graphify src` after implementation if available, and do not commit `.graphify/branch.json`, `.graphify/worktree.json`, `.graphify/needs_update`, or `.graphify/cache/`. Blocked: `/graphify` is not available in this shell.
- [x] 8.6 Update this task file with verification results before archiving the change.

## 9. Completed Set Toggle

- [x] 9.1 Add an Active Workout screen requirement that completed sets can be unchecked from the same completion control.
- [x] 9.2 Add `WorkoutRepo.uncompleteSet()` to persist `is_completed = 0` and clear `completed_at`.
- [x] 9.3 Update `activeWorkoutStore.completeSet()` to toggle completed sets back to incomplete when tapped again.
- [x] 9.4 Keep completed set check buttons pressable and update the accessibility label to describe unchecking.
- [x] 9.5 Add a store regression test proving a completed set toggles back to incomplete and clears `completed_at`.
- [x] 9.6 Run focused active workout tests after the toggle change.
