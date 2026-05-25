## 1. Core constants and file scaffold

- [x] 1.1 Create `src/storage/database/schema.ts` with JSDoc header and type imports from domain entities
- [x] 1.2 Define `CREATE_TABLES_SQL` constant as a template literal string

## 2. Reference/lookup tables

- [x] 2.1 Write `CREATE TABLE IF NOT EXISTS muscle_groups` with TEXT PK, UNIQUE name, snake_case columns
- [x] 2.2 Write `CREATE TABLE IF NOT EXISTS exercises` with all columns matching the Exercise entity

## 3. Junction and relationship tables

- [x] 3.1 Write `CREATE TABLE IF NOT EXISTS exercise_muscles` with FKs to exercises and muscle_groups, role CHECK, and CASCADE DELETE
- [x] 3.2 Write `CREATE TABLE IF NOT EXISTS routine_exercises` with FK to routine_days and exercises, CASCADE DELETE

## 4. Routine scaffolding tables

- [x] 4.1 Write `CREATE TABLE IF NOT EXISTS routines` with TEXT PK and appropriate defaults
- [x] 4.2 Write `CREATE TABLE IF NOT EXISTS routine_days` with FK to routines, CASCADE DELETE, default sort_order

## 5. Workout session tables

- [x] 5.1 Write `CREATE TABLE IF NOT EXISTS workout_sessions` with status CHECK constraint, nullable FK to routines/routine_days
- [x] 5.2 Write `CREATE TABLE IF NOT EXISTS workout_exercises` with FK to workout_sessions, exercises, CASCADE DELETE

## 6. Workout data tables

- [x] 6.1 Write `CREATE TABLE IF NOT EXISTS set_logs` with set_type CHECK constraint, FK to workout_exercises, CASCADE DELETE, default values
- [x] 6.2 Write `CREATE TABLE IF NOT EXISTS personal_records` with type CHECK constraint, FKs to exercises and workout_sessions

## 7. Meta tables

- [x] 7.1 Write `CREATE TABLE IF NOT EXISTS app_settings` with `key TEXT PRIMARY KEY`
- [x] 7.2 Write `CREATE TABLE IF NOT EXISTS _migrations` with `version INTEGER PRIMARY KEY`

## 8. Indices

- [x] 8.1 Define `CREATE_INDICES_SQL` constant with all 6 indices using `CREATE INDEX IF NOT EXISTS`
- [x] 8.2 Include indices for: exercise_muscles (exerciseId, muscleGroupId), workout_sessions (status, startedAt), workout_exercises (workoutSessionId), set_logs (workoutExerciseId)

## 9. Validation

- [x] 9.1 Run TypeScript typecheck (`npx tsc --noEmit`) to verify exports and syntax
- [x] 9.2 Verify all 12 table names are present in CREATE_TABLES_SQL
- [x] 9.3 Verify all 4 CHECK constraints are present (status, role, set_type, type)
- [x] 9.4 Verify all 6 index names are present in CREATE_INDICES_SQL
