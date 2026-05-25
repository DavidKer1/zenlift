## Why

Routines are the entry point to Zenlift's core loop ("Crear rutina -> Iniciar workout -> Registrar sets -> Finalizar sesión -> Ver progreso"). Without a repository layer, screens will embed raw SQL scattered across route files, making it impossible to guarantee transactional consistency when mutating nested routine data (days + exercises). A dedicated `RoutineRepo` centralizes all routine CRUD operations, enforces UUID generation, wraps multi-table mutations in transactions, and provides composed read models via JOINs.

## What Changes

- Create `src/storage/repositories/routineRepo.ts` — class `RoutineRepo` with full CRUD for routines, routine days, and routine exercises
- Method set: `getAll`, `getById`, `getFullRoutine` (nested JOIN), `create`, `update`, `archive`/`unarchive`, `delete` (CASCADE), `duplicate`, `getDays`, `createDay`, `updateDay`, `deleteDay`, `reorderDays`, `getExercises` (JOIN with exercises), `createExercise`, `updateExercise`, `deleteExercise`, `reorderExercises`
- All SQL queries parametrized; multi-table operations wrapped in `db.exec` transactions via `getDatabase()`
- `duplicate()` copies the full routine tree with new UUIDs, preserving structure without mutating the original
- `getFullRoutine()` returns typed `FullRoutine` read model with days and exercises nested

## Capabilities

### New Capabilities

- `routine-repository`: Persistence layer for routines, routine days, and routine exercises — full CRUD, nesting via JOINs, transaction-protected mutations, archive/unarchive, batch reorder, and deep clone (duplicate)

### Modified Capabilities

<!-- No existing capabilities are modified. -->

## Impact

- New file: `src/storage/repositories/routineRepo.ts`
- Depends on `src/storage/database/connection.ts` (`getDatabase()`) from `db-connection-singleton` change
- Depends on `src/utils/id` (`generateId()`) from `id-generation` capability
- Consumes domain types: `Routine`, `RoutineDay`, `RoutineExercise`, `FullRoutine`, `FullRoutineDay`, `RoutineExerciseWithExercise` from `src/domain/entities`
- No **BREAKING** changes — this is a new module with no existing consumers
