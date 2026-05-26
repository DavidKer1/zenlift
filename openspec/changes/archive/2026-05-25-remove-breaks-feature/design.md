## Context

Zenlift currently has rest/break behavior spread across multiple layers: active workout UI, the active workout store, workout MMKV keys, settings storage/UI, routine exercise configuration, routine repository contracts, routine detail display, and the SQLite/domain shape for `routine_exercises.rest_seconds`.

The product decision is to remove breaks completely from the launch phase and reserve them for a future release. The core loop must remain focused on creating routines, starting workouts, logging sets quickly, finishing sessions, and reviewing progress. Completed set autosave, active-session recovery, haptics on set completion, history, PR detection, and progress calculations must not regress.

## Goals / Non-Goals

**Goals:**

- Remove all current-phase user-facing break/rest timer UI.
- Remove active workout timer state/actions and MMKV timer persistence.
- Remove default rest timer settings from UI, settings storage, and consumers.
- Remove rest seconds from routine forms, routine detail display, repository APIs, domain entities, and current SQLite DDL.
- Add a migration strategy for existing local databases so removing `rest_seconds` does not damage routine, workout, or history data.
- Update tests, docs, and OpenSpec contracts to prevent reintroducing break behavior in this phase.

**Non-Goals:**

- Do not replace breaks with a hidden feature flag or disabled UI.
- Do not add a new future-phase timer architecture.
- Do not alter workout session, set logging, PR detection, volume calculations, or progress behavior beyond removing timer side effects.
- Do not add backend, sync, analytics, or remote configuration.

## Decisions

1. Remove the feature rather than hide it.

   Rest/break behavior will be deleted from visible UI, state, settings, and type contracts. Keeping a dormant `RestTimer` or `defaultRest` path would leave product ambiguity and future maintenance cost.

   Alternative considered: leave code behind a flag. Rejected because the request is to eliminate the feature completely for this phase, and Zenlift should avoid abstractions for features that do not exist.

2. Treat set completion as only persistence plus feedback.

   `completeSet` will keep calling `WorkoutRepo.completeSet`, update local set state, and trigger success haptics when available. It will no longer read `defaultRest`, call `startTimer`, or mutate timer fields.

   Alternative considered: keep timer actions for future reuse. Rejected because callers and tests would still depend on removed behavior.

3. Remove `default_rest` from the active settings contract.

   `useSettings` will expose only launch-phase settings: weight unit, theme mode, and weekly goal. The old MMKV key may be left unread and harmless, or explicitly removed during cleanup/delete-all flows, but it must not appear in the hook return value or Settings UI.

   Alternative considered: keep `default_rest` storage without UI. Rejected because hidden state is still feature surface area and can accidentally drive active workout behavior.

4. Remove `rest_seconds` from launch-phase routine data.

   Routine form values, configurator props, persistence, repository data types, read models, and display rows will no longer include rest seconds. The current schema should no longer define `rest_seconds` in `routine_exercises`.

   Alternative considered: keep the database column while removing UI. Rejected because the user asked for complete removal and because future breaks can reintroduce the field deliberately with a new migration.

5. Use an additive migration path for existing SQLite databases.

   Existing installed databases may already contain `routine_exercises.rest_seconds`. Because SQLite column drops require table rebuilds on older runtimes and the value has no launch-phase meaning, implement a migration that recreates `routine_exercises` without `rest_seconds`, copies all remaining columns, preserves UUIDs and sort order, and keeps foreign keys/cascade behavior.

   Alternative considered: ignore existing columns. Rejected because repository/domain types would diverge from existing schema and export/import may continue carrying removed data.

## Risks / Trade-offs

- Existing routines lose configured rest seconds -> Acceptable because breaks are explicitly future scope; preserve all exercise, set, reps, notes, and ordering data.
- Migration table rebuild could fail on device -> Wrap migration in SQLite transaction and cover with migration/schema tests before shipping.
- Some archived OpenSpec changes still mention rest timer -> Current specs and docs must be updated; archived historical proposals can remain as history unless active validation reads them.
- UI spacing may shift after removing `RestTimer` -> Smoke test active workout expanded/minimized surfaces to ensure exercise list, bottom bar, and picker remain reachable.
- Future breaks will need a fresh design -> Preferred trade-off; future work can reintroduce a scoped timer model intentionally.

## Migration Plan

1. Remove references from active code paths and tests.
2. Add/update SQLite migration to rebuild `routine_exercises` without `rest_seconds` for existing installs.
3. Update `CREATE_TABLES_SQL`, domain entities, repositories, form persistence, import/export column lists, and tests to match the new schema.
4. Remove obsolete timer MMKV helpers and avoid reading/writing the old workout timer key.
5. Run unit tests for settings, routine form, repositories, migrations/schema, and active workout store.
6. Smoke test the active workout loop: start session, add exercise, add set, complete set, finish workout, confirm no break UI appears.

Rollback would require a new migration that re-adds `rest_seconds` and a future feature proposal that restores timer/settings/UI behavior. Existing removed rest values are not preserved by this change.
