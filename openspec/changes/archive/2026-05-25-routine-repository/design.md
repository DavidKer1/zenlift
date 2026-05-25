## Context

Zenlift is an offline-first mobile workout tracker built with Expo/React Native + expo-sqlite. The routine data model (`routines` → `routine_days` → `routine_exercises` → `exercises`) is a three-level tree. Every operation that reads or writes routine data must handle this nesting correctly, respect the immutability rule (editing routines must not mutate past workout sessions), and ensure referential integrity via SQLite foreign keys.

The `db-connection-singleton` change provides `getDatabase()` (with WAL mode, foreign keys ON, and migrations run). Domain entity types (`Routine`, `RoutineDay`, `RoutineExercise`, `FullRoutine`, etc.) are defined in `src/domain/entities/index.ts`. The `id-generation` capability provides `generateId()`.

## Goals / Non-Goals

**Goals:**
- Provide a single `RoutineRepo` class with methods for every routine CRUD operation
- Return typed `FullRoutine` read models with days and exercises nested via JOINs
- Wrap multi-table mutations in transactions to avoid partial writes
- Use parametrized queries exclusively to prevent SQL injection
- Support archive/unarchive without deleting data
- Support deep clone (`duplicate`) with new UUIDs throughout the tree
- Support batch reorder operations via `sortOrder` column updates

**Non-Goals:**
- No UI components or screen integration — pure data layer
- No caching or reactivity layer — callers are responsible for re-fetching
- No migration or schema changes — tables already defined by `migration-system`
- No permission or auth checks — repository operates on raw data
- No batch inserts (create multiple days/exercises at once) — individual creates suffice for now

## Decisions

1. **Constructor receives `db` parameter** — Dependency injection over internal singleton access. This makes the repository testable with an in-memory database and keeps the class unaware of how the connection is obtained.

2. **`getFullRoutine` uses three queries, not a single giant JOIN** — Querying routine, then days, then exercises (with JOIN to `exercises` table) in sequence avoids a Cartesian product explosion and mapping complexity. The tree depth is fixed at 3 levels and the volume is small (per user, per routine), so N+1 overhead is negligible.

3. **`duplicate` runs inside a single transaction** — The routine, all days, and all exercises are copied with new UUIDs in one atomic operation. If any step fails, nothing is committed. New timestamps are generated for the copy.

4. **`reorderDays`/`reorderExercises` use `runAsync` in a loop inside a transaction** — Each day/exercise gets its index as the new `sortOrder`. Done in a single transaction to avoid inconsistent ordering mid-update.

5. **`delete` relies on SQLite `ON DELETE CASCADE`** — No manual deletion of child rows. The FK constraints defined in the schema cascade deletions automatically.

6. **All queries are parametrized** — `?` placeholders with `runAsync`/`getFirstAsync`/`getAllAsync` param arrays. No string interpolation of SQL.

7. **`getExercises` JOINs with `exercises`** — Returns `RoutineExerciseWithExercise` (includes `exercise` sub-object). Fields from `exercises` are aliased to match the types.

## Risks / Trade-offs

- **N+1 pattern in `getFullRoutine`** → Mitigation: Accepted for now. A routine typically has 3-7 days with 4-8 exercises each. Query count is 1 + D + D (where D is days), max ~15 queries. This is fast enough for local SQLite. Can optimize later with a single multi-JOIN if profiling shows a bottleneck.

- **No optimistic concurrency** → Mitigation: Single-user local database. No concurrent writers. This is acceptable for the MVP scope.

- **`duplicate` copies all fields verbatim except IDs** → Mitigation: This is the desired behavior. The user can rename and edit the copy afterward.

- **Sort order gaps after deletions** → Mitigation: Accepted. `reorder` operations explicitly set contiguous indices. Gaps from deletions are harmless; queries sort by `sortOrder`.
