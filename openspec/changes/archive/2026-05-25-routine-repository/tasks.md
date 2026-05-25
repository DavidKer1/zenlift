## 1. Setup

- [x] 1.1 Create `src/storage/repositories/RoutineRepo.ts` with class skeleton, constructor that takes `db` param, and all method signatures
- [x] 1.2 Add imports for `getDatabase`, `generateId`, and domain entity types

## 2. Routine CRUD

- [x] 2.1 Implement `getAll({ includeArchived? })` with parametrized SELECT + optional `WHERE isArchived = 0`, ORDER BY sortOrder
- [x] 2.2 Implement `getById(id)` with parametrized SELECT by id, return Routine or null
- [x] 2.3 Implement `getFullRoutine(id)`: fetch routine, then days, then exercises per day (with JOIN to exercises table), assemble FullRoutine
- [x] 2.4 Implement `create(data)` with UUID generation, INSERT, return created Routine
- [x] 2.5 Implement `update(id, updates)` with dynamic SET clause, parametrized
- [x] 2.6 Implement `archive(id)` and `unarchive(id)` with UPDATE isArchived
- [x] 2.7 Implement `delete(id)` — relies on CASCADE FK
- [x] 2.8 Implement `duplicate(id, newName)` in a transaction: copy routine → copy days → copy exercises, all with new UUIDs

## 3. Routine Day CRUD

- [x] 3.1 Implement `getDays(routineId)` with parametrized SELECT, ORDER BY sortOrder
- [x] 3.2 Implement `createDay(routineId, data)` with UUID generation, INSERT
- [x] 3.3 Implement `updateDay(id, updates)` with parametrized UPDATE
- [x] 3.4 Implement `deleteDay(id)` — relies on CASCADE FK
- [x] 3.5 Implement `reorderDays(routineId, dayIds)` — batch UPDATE sortOrder in transaction

## 4. Routine Exercise CRUD

- [x] 4.1 Implement `getExercises(dayId)` with JOIN to exercises table, ORDER BY sortOrder
- [x] 4.2 Implement `createExercise(dayId, data)` with UUID generation, INSERT
- [x] 4.3 Implement `updateExercise(id, updates)` with parametrized UPDATE
- [x] 4.4 Implement `deleteExercise(id)` — DELETE by id
- [x] 4.5 Implement `reorderExercises(dayId, exerciseIds)` — batch UPDATE sortOrder in transaction

## 5. Verification

- [x] 5.1 Write `RoutineRepo` unit test: getFullRoutine returns correctly nested data
- [x] 5.2 Write `RoutineRepo` unit test: duplicate copies entire tree with new UUIDs
- [x] 5.3 Write `RoutineRepo` unit test: reorderDays and reorderExercises update sortOrder correctly
- [x] 5.4 Write `RoutineRepo` unit test: delete cascades properly (routine → days → exercises)
- [x] 5.5 Write `RoutineRepo` unit test: getAll filters archived routines
- [x] 5.6 Run typecheck and lint to confirm no errors
