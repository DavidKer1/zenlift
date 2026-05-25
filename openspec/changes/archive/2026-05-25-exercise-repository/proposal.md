## Why

The app needs to display, search, and filter exercises by name, muscle group, category, and equipment. Without a repository layer, every screen would duplicate SQL queries or rely on raw SQLite calls. A dedicated repository encapsulates the many-to-many relationship between exercises and muscle groups, ensuring parametrized queries, transactional integrity on create/delete, and a clean API for the rest of the app.

## What Changes

- New `ExerciseRepo` class with full CRUD, search, favorites, and muscle-based queries using JOINs
- New `MuscleGroupRepo` class with read-only `getAll` and `getById`
- Both repos accept the database instance via constructor (dependency injection from `getDatabase()`)
- `create` wraps exercise insert + exercise_muscles inserts in a single transaction
- `delete` relies on CASCADE to clean up exercise_muscles rows
- All SQL queries use parametrized placeholders — no string interpolation
- Search is case-insensitive via `COLLATE NOCASE` with `LIKE`

## Capabilities

### New Capabilities

- `exercise-repository`: CRUD operations for exercises with muscle-group relationship management, parametrized queries, transactional create, and search/filter capabilities

### Modified Capabilities

<!-- None — this is a new capability -->

## Impact

- New files: `src/storage/repositories/exerciseRepo.ts`, `src/storage/repositories/muscleGroupRepo.ts`
- Depends on: `src/storage/database/connection.ts` (`getDatabase()`) and `src/storage/database/schema.ts` (exercises, muscle_groups, exercise_muscles tables)
- Future screens (exercise list, exercise detail, routine builder, workout flow) will consume these repos
