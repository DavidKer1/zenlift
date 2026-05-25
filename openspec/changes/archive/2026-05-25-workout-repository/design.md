## Context

Zenlift stores workout sessions, exercises executed during sessions, set logs, personal records, and app settings in SQLite. The active workout loop ("Iniciar workout -> Registrar sets -> Finalizar sesión") is the most performance-critical path in the app. Sets must be persisted immediately on completion to avoid data loss on crash, and the full active session state must be reconstructable from SQLite after app restart.

The database connection is obtained through a singleton (`getDatabase()`), all IDs are UUID text strings generated client-side, and the schema defines FK relationships with `ON DELETE CASCADE` from sessions to workout_exercises to set_logs.

Current state: Schema, connection singleton, and id-generation are established in separate changes. The `domain-entities` spec defines `WorkoutSession`, `WorkoutExercise`, `SetLog`, `PersonalRecord`, `FullWorkoutSession`, `WorkoutExerciseWithSets`, `WorkoutSummary`, and `AppSettings` types.

## Goals / Non-Goals

**Goals:**
- Provide a clean, typed API for all workout runtime operations
- Support exactly one active session at a time; `getActiveSession()` returns it or `null`
- Auto-persist completed sets immediately; `completeSet()` writes `is_completed=1` + `completed_at`
- Reconstruct full nested session state (session → exercises → sets + PRs) via `getFullSession()`
- Provide `getPreviousPerformance()` for auto-fill of last-used weight/reps per exercise
- Support history queries with limit/offset, date range, and routine filters
- Handle session lifecycle transitions: create → active, active → completed (with duration calc), active → cancelled
- Enforce transaction atomicity for multi-table operations (session creation with exercises, completing sessions with PRs)
- All queries parametrized; no SQL injection risk

**Non-Goals:**
- Workout state management in Zustand (separate change)
- Active workout UI screens (separate change)
- Progress calculation, PR detection logic (belongs in `domain/services/` or `domain/calculations/`)
- Timer/rest countdown (uses MMKV + timestamps per architecture)
- Workout sharing or export
- Merging or importing sessions from external sources

## Decisions

### Class-based repository with constructor injection

**Decision:** `WorkoutRepo` is a class that receives `db: SQLiteDatabase` in its constructor.

**Rationale:** Matches the pattern used by `ExerciseRepo`, `MuscleGroupRepo`, and `RoutineRepo`. Constructor injection makes dependencies explicit and testable. Avoids module-level singletons that complicate unit testing.

**Alternatives considered:**
- Module-level functions with closure over db: less testable, implicit dependency.
- Splitting into separate repos (`SessionRepo`, `SetRepo`, `PRRepo`): adds unnecessary indirection for closely-related entities that are always queried together.

### Active session query: LIMIT 1

**Decision:** `getActiveSession()` executes `SELECT * FROM workout_sessions WHERE status = 'active' LIMIT 1`. The application layer enforces at most one active session.

**Rationale:** The schema has an index on `status`. Using `LIMIT 1` is a safety net. The app-level constraint is enforced in the store/feature layer, not the repository — the repo is a data access layer, not a business rule enforcer.

### UUID generation at repository level

**Decision:** Each create method generates its own UUID via `generateId()` before inserting.

**Rationale:** UUIDs must be generated in the same process as the insert to guarantee uniqueness. Generating them at the repository level keeps the API simple — callers pass data without IDs.

### `completeSession` calculates duration inline

**Decision:** `completeSession(id)` updates `status='completed'`, `ended_at=now`, and `duration_seconds = (julianday(ended_at) - julianday(started_at)) * 86400` using SQLite date functions directly in the UPDATE query.

**Rationale:** Avoids a separate SELECT + calculation round-trip. SQLite's `julianday()` handles ISO-8601 date strings natively.

**Alternative considered:** Calculate in JS with `date-fns`: requires separate SELECT, adds latency, and is error-prone if date formats diverge.

### `getFullSession` uses sequential queries, not JOINs

**Decision:** `getFullSession(id)` queries: (1) session row, (2) exercises for the session, (3) sets for each exercise via `getSets(workoutExerciseId)`, (4) PRs for the session. Results are assembled in JS into the `FullWorkoutSession` type.

**Rationale:** A single massive JOIN would return denormalized rows that require JS grouping anyway. Sequential queries are simpler to type, debug, and test. The overhead is negligible for a single session with ~5-15 exercises and ~3-5 sets each. Alternative: A raw JOIN query returning flat rows, grouped in JS. Would reduce round-trips but adds complexity in result parsing.

### `getPreviousPerformance` JOINs three tables

**Decision:** `getPreviousPerformance(exerciseId, limit?)` JOINs `set_logs` → `workout_exercises` → `workout_sessions`, filtering by `exercise_id` and `is_completed = 1`, ordered by `started_at DESC`.

**Rationale:** This provides the exact data needed for weight/reps auto-fill — the user's last completed sets for the same exercise across all prior sessions. The index on `started_at` in `workout_sessions` and the FK index on `workout_exercise_id` in `set_logs` make this efficient.

### CASCADE for delete

**Decision:** `deleteSession(id)` simply executes `DELETE FROM workout_sessions WHERE id = ?`. The schema defines `ON DELETE CASCADE` from workout_sessions → workout_exercises → set_logs.

**Rationale:** Keeps the repository simple. Personal records remain (they reference the session but should not be deleted — PRs are historical achievements, not just session artifacts). If the product later requires PR cleanup on session delete, we add explicit `deleteSession` logic.

### `setSetting` uses `INSERT OR REPLACE`

**Decision:** `setSetting(key, value)` executes `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`.

**Rationale:** Single statement handles both create and update. The `key` column is the PK, so `INSERT OR REPLACE` is safe and idiomatic for SQLite key-value stores.

### Sorting: `sortOrder` for exercises, `setNumber` for sets

**Decision:** `addExercise()` computes `nextSortOrder` as `COALESCE(MAX(sort_order), 0) + 1`. `addSet()` computes `nextSetNumber` similarly. Constants `DEFAULT 0` in the schema.

**Rationale:** Keeps ordering deterministic. Callers don't need to provide ordering — the repo handles it.

## Risks / Trade-offs

- **[Risk] Active session recovery relies on `getActiveSession()` returning consistent data** → Mitigation: The repository uses explicit SELECT * which always returns current committed state. WAL mode ensures reads see the latest committed data even during concurrent writes.
- **[Risk] `getFullSession` makes N+1 queries for sets** → Mitigation: In practice, N (exercises per session) is 5-15. For MVP volumes, this is acceptable. If profiling shows latency >100ms, we can batch set queries into a single SELECT with `IN (exercise_ids)`.
- **[Risk] `completeSession` duration calculation via `julianday()` may be imprecise across DST or timezone shifts** → Mitigation: `started_at` and `ended_at` use the same clock (ISO-8601 local device time). For workout durations (typical range 30-120 minutes), the precision is more than adequate.
- **[Risk] `INSERT OR REPLACE` on `setSetting` triggers a DELETE + INSERT internally, losing the row's implicit `rowid`** → Mitigation: No code references implicit `rowid`; the `app_settings` table uses `key` as TEXT PK, so no data is lost.
- **[Trade-off] WorkoutRepo is a large class (20+ methods)** → Acceptable because the methods operate on tightly coupled entities. The alternative (split repos) would scatter related queries and make `getFullSession` coordination more complex.

## Migration Plan

No schema migration needed — this change consumes the tables already defined in the `sqlite-schema` change. Deployment is a code-only change.

## Open Questions

<!-- None at this stage -->
