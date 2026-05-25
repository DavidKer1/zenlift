## 1. Prerequisites

- [x] 1.1 Create `assets/exercise.json` with all 13 muscle groups and 25 exercises with muscle relationships as the source of truth for seed data
- [x] 1.2 Verify exercise-repository change provides table access functions for `muscle_groups`, `exercises`, and `exercise_muscles`

## 2. Seed data module

- [x] 2.1 Create `src/storage/repositories/seedData.ts` with a `generateSeedId(prefix, name)` helper that produces deterministic UUIDs from entity names
- [x] 2.2 Implement the hardcoded fallback seed data arrays (13 muscle groups, 25 exercises, and their exercise_muscles relationships) with all required fields
- [x] 2.3 Implement `seedDatabase(db)` that inserts muscle_groups, exercises, and exercise_muscles using INSERT OR IGNORE within a single transaction
- [x] 2.4 Implement `seedIfEmpty(db)` that checks `SELECT COUNT(*) FROM muscle_groups` and calls `seedDatabase` only if count is 0
- [x] 2.5 Implement Plan A (load from `assets/exercise.json` using `require` or `expo-asset`) with fallback to hardcoded Plan B data

## 3. Integration

- [x] 3.1 Wire `seedIfEmpty` into the database initialization flow (call after migrations, before app renders)
- [x] 3.2 Verify idempotency: test that running `seedIfEmpty` multiple times produces the same result with no duplicates

## 4. Testing and validation

- [x] 4.1 Write unit tests for `seedIfEmpty`: empty database triggers seed, populated database skips seed
- [x] 4.2 Write unit tests for `seedDatabase`: verifies exactly 13 muscle groups and 25 exercises after seeding
- [x] 4.3 Write unit test for idempotency: calling `seedDatabase` twice produces same row counts
- [x] 4.4 Write unit test for exercise-muscle relationships: every exercise has at least one primary muscle
- [x] 4.5 Verify JSON fallback: test that hardcoded data is used when JSON is unavailable
- [x] 4.6 Verify JSON loading: test that valid JSON produces same data as hardcoded fallback
