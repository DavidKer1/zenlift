## 1. Active Workout Break Removal

- [x] 1.1 Delete `src/components/workout/RestTimer.tsx` and `src/components/workout/__tests__/RestTimer.test.tsx`.
- [x] 1.2 Remove `RestTimer`, `REST_DURATIONS`, `timerTargetEnd`, `startTimer`, and `skipTimer` usage from `src/app/workout/active.tsx`.
- [x] 1.3 Remove `RestTimer` props and rendering from `src/components/workout/ActiveWorkoutExpandedSurface.tsx`.
- [x] 1.4 Remove timer target reads, completion timeout effect, add-rest-time handlers, and timer props from `src/components/workout/ActiveWorkoutModal.tsx`.
- [x] 1.5 Update active workout UI tests/snapshots so completing a set never renders break/rest controls.

## 2. Active Workout Store And MMKV

- [x] 2.1 Remove `isResting`, `timerTargetEnd`, `startTimer`, `getTimerRemaining`, and `skipTimer` from active workout store types and implementation.
- [x] 2.2 Remove `getSettingsValue('defaultRest')` and timer start side effects from `completeSet`, preserving SQLite completion, local state update, and haptic feedback.
- [x] 2.3 Remove workout timer MMKV key/helpers from `src/features/workout/stores/mmkv.ts` while keeping active session id persistence.
- [x] 2.4 Update active workout store tests to assert set completion does not start a timer and recovery only restores session/exercises.

## 3. Settings Cleanup

- [x] 3.1 Remove `DEFAULT_REST_RANGE`, `DEFAULT_SETTINGS.defaultRest`, and `SETTINGS_KEYS.defaultRest` from `src/features/settings/constants.ts`.
- [x] 3.2 Remove `defaultRest`, `setDefaultRest`, default rest reads, and default rest listeners from `src/features/settings/useSettings.ts`.
- [x] 3.3 Remove the rest timer slider, `formatRestTime`, slider import, labels, and accessibility values from `src/app/settings.tsx`.
- [x] 3.4 Update settings specs/tests so the General section only includes weight unit, theme, and weekly goal.

## 4. Routine Form And Display Cleanup

- [x] 4.1 Remove `restSeconds` from routine form Zod schema, form value types, mapping helpers, and schema tests.
- [x] 4.2 Remove the "Descanso" input, local state, validation, props, and returned config field from `ExerciseConfigurator`.
- [x] 4.3 Remove `restSeconds` passing and display text from `DayEditor`, `ExerciseRow`, and routine detail components.
- [x] 4.4 Update routine form persistence so create/update queries no longer read or write `rest_seconds`.
- [x] 4.5 Update routine UI tests to verify target sets/reps display without rest text.

## 5. Domain, Repository, And Schema

- [x] 5.1 Remove `rest_seconds` from the `RoutineExercise` domain entity and related read model expectations.
- [x] 5.2 Remove `rest_seconds` from `CREATE_TABLES_SQL` for `routine_exercises`.
- [x] 5.3 Add a migration that rebuilds existing `routine_exercises` tables without `rest_seconds` while preserving all remaining columns and rows.
- [x] 5.4 Remove `restSeconds` from `RoutineRepo` data/update types, join row mapping, select lists, insert/update SQL, and duplicate copy logic.
- [x] 5.5 Update `RoutineRepo` tests and schema/migration tests for the new column set.
- [x] 5.6 Update data portability column lists/import-export logic so `.zenlift` files no longer export or import `rest_seconds`.

## 6. Specs And Docs Alignment

- [x] 6.1 Update compact docs (`docs/ux_workflows.md`, `docs/architecture.md`, `docs/data_model.md`, `docs/roadmap_testing.md`) to remove current-phase break/rest timer references.
- [x] 6.2 Search `src`, `docs`, and active `openspec/specs` for `RestTimer`, `defaultRest`, `default_rest`, `restSeconds`, `rest_seconds`, `Descanso`, and `break`, then remove or update every current-phase reference.
- [x] 6.3 Leave archived OpenSpec changes untouched unless active validation includes them.

## 7. Verification

- [x] 7.1 Run typecheck and lint.
- [x] 7.2 Run unit tests for settings, routine form, routine repository, migrations/schema, active workout store, and workout UI components.
- [ ] 7.3 Smoke test the core loop: create routine, start workout, add/log sets, finish session, and confirm no break/rest UI appears.
- [x] 7.4 Re-run `rg` checks for break/rest identifiers to confirm only allowed historical archive references remain.
