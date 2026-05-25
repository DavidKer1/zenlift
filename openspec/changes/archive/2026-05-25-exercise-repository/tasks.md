## 1. Setup

- [x] 1.1 Create `src/storage/repositories/` directory if it does not exist
- [x] 1.2 Verify database connection singleton exports `getDatabase` from `src/storage/database/connection.ts` and schema tables exist

## 2. MuscleGroupRepo

- [x] 2.1 Create `src/storage/repositories/muscleGroupRepo.ts` with class `MuscleGroupRepo` accepting `db` in constructor
- [x] 2.2 Implement `getAll()` — parametrized `SELECT * FROM muscle_groups ORDER BY name`
- [x] 2.3 Implement `getById(id)` — parametrized `SELECT * FROM muscle_groups WHERE id = ?`

## 3. ExerciseRepo — Read Operations

- [x] 3.1 Create `src/storage/repositories/exerciseRepo.ts` with class `ExerciseRepo` accepting `db` in constructor
- [x] 3.2 Implement `getAll()` — `SELECT * FROM exercises ORDER BY name`
- [x] 3.3 Implement `getById(id)` — `SELECT * FROM exercises WHERE id = ?`
- [x] 3.4 Implement `getByMuscle(muscleGroupId)` — JOIN query: `SELECT DISTINCT e.* FROM exercises e JOIN exercise_muscles em ON e.id = em.exerciseId WHERE em.muscleGroupId = ?`
- [x] 3.5 Implement `getByCategory(category)` — `SELECT * FROM exercises WHERE category = ? ORDER BY name`
- [x] 3.6 Implement `getByEquipment(equipment)` — `SELECT * FROM exercises WHERE equipment = ? ORDER BY name`
- [x] 3.7 Implement `search(query)` — case-insensitive LIKE: `SELECT * FROM exercises WHERE name LIKE '%' || ? || '%' COLLATE NOCASE`
- [x] 3.8 Implement `getFavorites()` — `SELECT * FROM exercises WHERE isFavorite = 1 ORDER BY name`
- [x] 3.9 Implement `getMuscles(exerciseId)` — JOIN query: `SELECT mg.* FROM muscle_groups mg JOIN exercise_muscles em ON mg.id = em.muscleGroupId WHERE em.exerciseId = ?`

## 4. ExerciseRepo — Write Operations

- [x] 4.1 Implement `create(data, muscleIds)` — transaction wrapping exercise INSERT + muscle INSERTs with generated UUIDs
- [x] 4.2 Implement `update(id, updates)` — parametrized partial UPDATE with dynamic field building, sets `updatedAt`
- [x] 4.3 Implement `delete(id)` — `DELETE FROM exercises WHERE id = ?` (CASCADE cleans exercise_muscles)

## 5. ExerciseRepo — Favorites and Muscle Management

- [x] 5.1 Implement `toggleFavorite(id)` — `UPDATE exercises SET isFavorite = NOT isFavorite WHERE id = ?`, return updated row
- [x] 5.2 Implement `addMuscle(exerciseId, muscleGroupId, role)` — `INSERT INTO exercise_muscles (id, exerciseId, muscleGroupId, role) VALUES (?, ?, ?, ?)`
- [x] 5.3 Implement `removeMuscle(exerciseId, muscleGroupId)` — `DELETE FROM exercise_muscles WHERE exerciseId = ? AND muscleGroupId = ?`

## 6. Verification

- [x] 6.1 Write Jest tests for ExerciseRepo covering all CRUD + search + favorites + muscle join methods
- [x] 6.2 Write Jest tests for MuscleGroupRepo covering getAll and getById
- [x] 6.3 Run `npx tsc --noEmit` to verify typecheck passes (exerciseRepo/muscleGroupRepo clean; pre-existing RoutineRepo errors unrelated)
- [x] 6.4 Run `npx jest` to verify all tests pass (21 new tests pass; 2 pre-existing test files fail due to missing test() blocks)
