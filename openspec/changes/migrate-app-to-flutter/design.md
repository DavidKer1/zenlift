# Design: Flutter Migration

## Architecture

The Flutter app is local-first and uses Clean Architecture for every migrated capability. Shared app bootstrap, theme, router, and database infrastructure can stay in top-level folders, but product behavior belongs inside feature modules with explicit layer boundaries.

- `features/<feature>/presentation/`: screens, widgets, route entry points, stable `ValueKey`s, accessibility labels, and UI-only formatting.
- `features/<feature>/application/`: use cases, controllers/notifiers, Riverpod providers, command/query orchestration, and view state models.
- `features/<feature>/domain/`: pure Dart entities, value objects, repository interfaces, domain services, calculations, and validation contracts.
- `features/<feature>/data/`: Drift repository implementations, row/entity mappers, DTOs, local data sources, transaction handling, and platform persistence adapters.
- `storage/`: shared Drift database connection, generated database classes, migrations, seed loader, and migration bridge primitives.
- `core/`: cross-feature primitives such as result types, app failures, IDs, clocks, and shared pure helpers.
- `theme/`: exact Zenlift tokens from `DESIGN.md`.
- `app/`: bootstrap, provider scope, and go_router route tree.

The dependency rule is strict: presentation can depend on application and domain; application can depend on domain; data can depend on domain and shared storage; domain cannot import Flutter, Riverpod, Drift, SQLite, generated Drift rows, platform APIs, or widget code. Drift rows are mapped to domain entities inside `data/` before crossing into application or presentation. Repository contracts live in domain; implementations live in data and are wired through application-level providers.

The app remains in `flutter-version/` during migration so each worker can compare against Expo source files, docs, specs, and assets without leaving the repository.

## State

Riverpod owns presentation/application state, not domain logic. The app root uses `ProviderScope`, feature controllers expose testable providers from application layers, and active workout state is an `AsyncNotifier` backed by use cases and repository contracts rather than volatile widget state. Settings are read through a reactive settings store with namespaced keys and mapped to domain-facing settings values before UI consumption.

## Data

Drift owns SQLite schema, migrations, and typed persistence adapters. Feature data layers own repository implementations and mappers. All IDs remain text UUIDs. Foreign keys and WAL are enabled when the connection opens. Completed set writes MUST retry transient failures before returning a `DatabaseError`; if all retries fail, the app MUST persist a pending completed-set write with enough data to replay it, surface a recoverable warning in Active Workout, and retry the pending write on app resume or active-session recovery.

The migration bridge is additive and non-destructive. Import merges by UUID and never overwrites existing local records. First launch of the Flutter build detects the existing Expo SQLite/MMKV stores, imports from a verified `.zenlift` export or validated bridge snapshot, writes a cutover marker only after row counts and required UUIDs are verified, and leaves the original Expo SQLite/MMKV data intact until the user explicitly confirms deletion. Any failed validation, import, or verification aborts cutover and preserves the current Flutter and Expo stores for retry.

## UI

Flutter widgets must preserve the existing visual language: dark default, tonal surfaces, Inter, JetBrains Mono, no shadows, lavender primary, green success-only, icon-only accessible tabs, and Active Workout optimized for one-handed logging.

## Verification

Every migrated capability needs matching Dart tests before the screen is considered complete. Visual parity uses golden tests plus manual screenshots on Android hardware. Core loop parity uses `integration_test/core_loop_test.dart` and Maestro smoke when available. `flutter analyze` must pass before a migrated batch is accepted.

## Parallel Agent Coordination

One orchestrator owns integration, sequencing, task status, and cutover decisions. Worker agents receive minimal context for their owned files, report files touched, tests, commands, failures, assumptions, and risks, and do not edit overlapping files unless the orchestrator serializes the work.

## Clean Architecture Verification

Each feature batch must include at least one focused domain or application test when business behavior is introduced. Domain tests must run without Flutter bindings. The orchestrator checks boundaries with import scans before accepting a feature batch:

```bash
rg -n "package:flutter|package:flutter_riverpod|package:drift|sqlite3|drift_database" flutter-version/lib/features/*/domain flutter-version/lib/core
rg -n "package:drift|drift_database|\\.g\\.dart" flutter-version/lib/features/*/presentation flutter-version/lib/features/*/application
```

Both commands should return no matches except documented false positives in comments or generated files outside those paths.
