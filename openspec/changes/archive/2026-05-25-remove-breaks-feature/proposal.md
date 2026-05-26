## Why

Breaks/rest timer behavior is no longer part of the current Zenlift launch scope and should be reserved for a future phase. Removing it now keeps the active workout loop focused on fast set logging, reduces UI and state complexity, and avoids shipping settings or routine fields for a feature the product is not ready to support.

## What Changes

- **BREAKING** Remove all break/rest timer UI from the active workout experience, including the `RestTimer` component and any expanded modal references to rest content.
- **BREAKING** Stop starting, persisting, recovering, skipping, or adjusting rest timers when sets are completed.
- **BREAKING** Remove the default rest timer setting from Settings UI and MMKV-backed settings storage.
- **BREAKING** Remove rest/break configuration from routine exercise forms and routine form validation.
- **BREAKING** Remove rest/break fields from routine repository contracts and mapping where they are only used to support the removed feature.
- Update tests and product docs/specs so no current-phase behavior requires breaks, rest timers, or default rest settings.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `active-workout-modal`: Expanded active workout content no longer includes or fades a `RestTimer`; minimized behavior must not expose break/rest UI.
- `settings-ui`: General settings no longer show a default rest timer slider.
- `settings-storage`: Settings storage no longer exposes or persists a `default_rest` preference.
- `routine-form-screen`: Routine exercise configuration no longer includes rest seconds.
- `routine-detail-screen`: Routine detail rows no longer display rest time or preserve rest configuration.
- `routine-repository`: Routine exercise create/update/duplicate contracts no longer include `restSeconds`.
- `domain-entities`: Routine exercise domain entities no longer include `rest_seconds`.
- `sqlite-ddl`: The current schema no longer defines a `rest_seconds` column for `routine_exercises`.

## Impact

- Affected UI/components: `src/app/workout/active.tsx`, `src/components/workout/ActiveWorkoutExpandedSurface.tsx`, `src/components/workout/RestTimer.tsx`, workout component tests, `src/app/settings.tsx`, routine configurator components.
- Affected state/storage: active workout store timer actions/state, MMKV settings keys and hooks, settings tests.
- Affected routine flow: routine form schema, mapping, persistence, repository types, repository tests, and any display copy that says "descanso".
- Affected data model: `RoutineExercise` TypeScript shape and SQLite DDL/migration handling for `routine_exercises.rest_seconds`.
- Affected documentation/specs: OpenSpec requirements, compact docs that list rest timer as current scope, and code references that imply breaks are launch behavior.
- No backend or network impact. Core local-first workout logging, autosave, history, PR detection, and progress calculations must remain unchanged.
