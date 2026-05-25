## Context

Zenlift stores exercises in SQLite with a many-to-many relationship to muscle groups via the `exercise_muscles` junction table. Every exercise has exactly one primary muscle and zero or more secondary muscles. The database connection is obtained through a singleton (`getDatabase()`), and all IDs are UUID text strings generated client-side.

Current state: Schema and connection are defined in separate changes (`sqlite-schema`, `db-connection-singleton`). This change introduces the first repositories that consume them.

## Goals / Non-Goals

**Goals:**
- Provide a clean, typed API for exercise and muscle-group queries
- Enforce transaction safety on create (exercise + exercise_muscles atomically)
- Support search by name (case-insensitive), filter by muscle/category/equipment
- Support favorite toggling and muscle-assignment management
- All queries parametrized; no SQL injection risk

**Non-Goals:**
- Exercise seed data loading (separate change)
- UI components or screens
- Routine-exercise or workout-exercise queries (separate repos)
- Pagination (MVP scope — load all, optimize later with FlashList)

## Decisions

### Class-based repositories with constructor injection

**Decision:** `ExerciseRepo` and `MuscleGroupRepo` are classes that receive `db: ReturnType<typeof getDatabase>` in their constructor.

**Rationale:** Constructor injection makes dependencies explicit, testable (pass a mock or in-memory DB), and avoids module-level singletons that complicate testing. Matches the pattern used in other Expo/SQLite projects.

**Alternatives considered:**
- Module-level functions with closure over db: simpler but harder to test and less explicit.
- Static class methods: no dependency injection; testing requires module mocking.

### Transaction scope on create

**Decision:** `create(data, muscleIds)` wraps the exercise INSERT and all exercise_muscles INSERTs in a single SQLite transaction (`db.exec` with BEGIN/COMMIT or `db.withTransactionAsync`).

**Rationale:** An exercise without its muscle associations is invalid per domain rules (exactly one primary). If a muscle insert fails mid-way, we must roll back the exercise insert too.

### CASCADE for delete

**Decision:** `delete(id)` executes `DELETE FROM exercises WHERE id = ?`. The schema already defines `ON DELETE CASCADE` on `exercise_muscles.exerciseId`, so junction rows are cleaned up automatically.

**Rationale:** Keeps the repository simple. External FKs (routine_exercises, workout_exercises) will handle their own references or be cleaned before exercise deletion at the application layer.

### Case-insensitive search via COLLATE NOCASE

**Decision:** `search(query)` uses `WHERE name LIKE '%' || ? || '%' COLLATE NOCASE`.

**Rationale:** SQLite's `COLLATE NOCASE` handles ASCII case-insensitive comparison efficiently. For non-ASCII (Spanish characters like ñ/á/é/í/ó/ú), SQLite's NOCASE does NOT handle them, but since exercise names are primarily English/ASCII, this is acceptable for MVP.

### No separate search index

**Decision:** No FTS5 table for MVP. `LIKE` with `COLLATE NOCASE` is sufficient for the exercise count expected in the seed (~100-200 exercises).

**Rationale:** Adds complexity and migration surface. Revisit when exercise count exceeds 500 or full-text search becomes a user need.

## Risks / Trade-offs

- **SQLite NOCASE doesn't handle Spanish characters** → Exercise names are predominantly in English; revisit if Spanish-named custom exercises become common.
- **No pagination on getAll** → Return all exercises. Acceptable for MVP seed (~150 rows). Add FlashList pagination when needed.
- **toggleFavorite uses `SET isFavorite = NOT isFavorite`** → Requires read-after-write to return new state, or separate SELECT. Repository returns the updated exercise via `getById` after toggle.

## Migration Plan

No schema migration needed — this change consumes the tables already defined in the `sqlite-schema` change. Deployment is a code-only change.

## Open Questions

<!-- None at this stage -->
