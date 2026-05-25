## Why

Zenlift requires a consistent set of muscle groups and exercises to be available from first launch so users can immediately build routines and log workouts without manual data entry. The 13 muscle groups and 25 essential exercises form the foundation of the exercise catalog. Without seed data, the app launches empty and forces every user to create exercises before starting their first workout, breaking the core loop.

## What Changes

- Add `src/storage/repositories/seedData.ts` with `seedDatabase()` and `seedIfEmpty()` functions
- Insert 13 muscle groups with distinct colors (idempotent via INSERT OR IGNORE)
- Insert 25 essential exercises with `isCustom=0`, each linked to at least one primary muscle via `exercise_muscles`
- `seedIfEmpty()` checks if `muscle_groups` has rows before executing `seedDatabase()`
- Optionally load exercises from `assets/exercise.json` if available, with hardcoded fallback
- All operations run within a single SQLite transaction for performance

## Capabilities

### New Capabilities

- `seed-data`: Database seeding of muscle groups, exercises, and exercise-muscle relationships on first app launch

### Modified Capabilities

<!-- None - new capability only -->

## Impact

- **New file**: `src/storage/repositories/seedData.ts`
- **Optional prerequisite**: `assets/exercise.json` for data-driven seeding (fallback to hardcoded data exists)
- **Dependencies**: `exercise-repository` change (exerciseRepo.ts for table access), database initialization flow (call `seedIfEmpty` after migrations)
- **No breaking changes**: purely additive, idempotent seeding
