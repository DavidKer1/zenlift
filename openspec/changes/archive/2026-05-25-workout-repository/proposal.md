## Why

Workout sessions are the core runtime artifact of Zenlift's active loop ("Iniciar workout -> Registrar sets -> Finalizar sesión"). Without a dedicated repository, the active workout screen would embed raw SQL for session lifecycle, set autosave, exercise management, and personal record detection — risking data loss on app crash, duplicating query logic, and making active-session recovery unreliable. A `WorkoutRepo` centralizes all workout CRUD, guarantees completed sets are persisted immediately, reconstructs full active state on app restart, and supports history queries with date/routine filters.

## What Changes

- Create `src/storage/repositories/workoutRepo.ts` — class `WorkoutRepo` with full CRUD for workout sessions, exercises, sets, personal records, and app settings
- Method set:
  - **Sessions**: `createSession`, `getSession`, `getActiveSession`, `getHistory`, `getHistoryByDateRange`, `getHistoryByRoutine`, `getFullSession` (nested exercises + sets + PRs), `completeSession` (calculates duration), `cancelSession`, `deleteSession` (CASCADE)
  - **Exercises**: `addExercise`, `removeExercise`, `getExercises`, `getPreviousPerformance`, `getLastWorkoutExerciseData`
  - **Sets**: `addSet`, `completeSet`, `updateSet`, `deleteSet`, `getSets`
  - **PRs**: `addPR`, `getPRsByExercise`, `getLatestPRs`, `getPRsBySession`
  - **Settings**: `getSetting`, `setSetting`, `deleteSetting`
- Constructor takes `db` parameter (SQLite database from `getDatabase()`)
- All IDs generated with `generateId()` from `id-generation` capability
- All queries parametrized; multi-table operations wrapped in transactions via `db.withTransactionAsync`
- `getActiveSession()` returns the single active session or `null`
- `getFullSession()` returns typed `FullWorkoutSession` read model with exercises, their sets, and personal records nested
- `getPreviousPerformance()` queries prior completed sessions for auto-fill data (last weight/reps per exercise)
- Autosave: `completeSet()` writes `is_completed=1` and `completed_at` immediately

## Capabilities

### New Capabilities

- `workout-repository`: Persistence layer for workout sessions, workout exercises, set logs, personal records, and app settings — acive session management, history with filters, nested read models, previous-performance lookups, and session lifecycle transitions

### Modified Capabilities

<!-- No existing capabilities are modified. -->

## Impact

- New file: `src/storage/repositories/workoutRepo.ts`
- Depends on `src/storage/database/connection.ts` (`getDatabase()`) from `db-connection-singleton` change
- Depends on `src/utils/id` (`generateId()`) from `id-generation` capability
- Consumes domain types: `WorkoutSession`, `WorkoutExercise`, `SetLog`, `PersonalRecord`, `FullWorkoutSession`, `WorkoutExerciseWithSets` from `src/domain/entities`
- Enables active-workout screen, workout history screen, and progress/PR tracking features
- No **BREAKING** changes — this is a new module with no existing consumers
