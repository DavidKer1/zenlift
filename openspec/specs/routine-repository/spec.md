# routine-repository Specification

## Purpose
TBD - created by archiving change routine-repository. Update Purpose after archive.
## Requirements
### Requirement: Routine repository class structure
The system SHALL expose a `RoutineRepo` class that accepts a database instance via its constructor and provides methods for all routine CRUD operations.

#### Scenario: Class is constructable with database
- **WHEN** `new RoutineRepo(db)` is called with an expo-sqlite database instance
- **THEN** the instance is created without errors and the `db` parameter is stored for use in all methods

### Requirement: List routines with optional archive filter
The system SHALL provide a method to list all routines, optionally filtering out archived ones, ordered by `sortOrder`.

#### Scenario: List active routines only
- **WHEN** `getAll()` is called without arguments (or `includeArchived` is falsy)
- **THEN** only routines where `isArchived = 0` are returned, ordered by `sortOrder ASC`

#### Scenario: List all routines including archived
- **WHEN** `getAll({ includeArchived: true })` is called
- **THEN** all routines are returned, ordered by `sortOrder ASC`

### Requirement: Get routine by ID
The system SHALL provide a method to retrieve a single routine by its ID.

#### Scenario: Routine exists
- **WHEN** `getById(id)` is called with a valid routine ID
- **THEN** the corresponding `Routine` object is returned

#### Scenario: Routine does not exist
- **WHEN** `getById(id)` is called with a non-existent ID
- **THEN** `null` is returned

### Requirement: Get full routine with nested days and exercises
The system SHALL provide a method that returns a complete routine tree: the routine, its days, and each day's exercises (joined with the exercises table for name and equipment).

#### Scenario: Full routine with nested data
- **WHEN** `getFullRoutine(id)` is called with a routine that has days and exercises
- **THEN** a `FullRoutine` object is returned with a `days` array, where each day has an `exercises` array of `RoutineExerciseWithExercise` objects (including `exerciseName`, `equipment`, etc.)

#### Scenario: Routine with no days
- **WHEN** `getFullRoutine(id)` is called with a routine that has no days
- **THEN** a `FullRoutine` with an empty `days` array is returned

#### Scenario: Routine does not exist
- **WHEN** `getFullRoutine(id)` is called with a non-existent ID
- **THEN** `null` is returned

### Requirement: Create routine
The system SHALL create a new routine with a generated UUID and current timestamps.

#### Scenario: Create routine with required fields
- **WHEN** `create({ name: "Push Day", description: "...", goal: "..." })` is called
- **THEN** a new row is inserted into `routines` with a generated UUID, `isArchived = 0`, `sortOrder = 0`, and `createdAt`/`updatedAt` set to the current ISO timestamp. The created `Routine` object is returned.

### Requirement: Update routine
The system SHALL update an existing routine's fields using a parametrized query.

#### Scenario: Update routine name and description
- **WHEN** `update(id, { name: "New Name", description: "Updated" })` is called
- **THEN** the corresponding `routines` row has its `name`, `description`, and `updatedAt` fields updated. Other fields remain unchanged.

### Requirement: Archive and unarchive routine
The system SHALL support toggling a routine's archived state without deleting data.

#### Scenario: Archive a routine
- **WHEN** `archive(id)` is called
- **THEN** the routine's `isArchived` is set to `1`

#### Scenario: Unarchive a routine
- **WHEN** `unarchive(id)` is called
- **THEN** the routine's `isArchived` is set to `0`

### Requirement: Delete routine with cascade
The system SHALL delete a routine and all its child rows (days, exercises) via SQLite CASCADE.

#### Scenario: Delete routine cascades to days and exercises
- **WHEN** `delete(id)` is called for a routine with days and exercises
- **THEN** the routine, all its `routine_days`, and all associated `routine_exercises` are removed from the database

### Requirement: Duplicate routine with new UUIDs
The system SHALL deep-clone a routine, its days, and its exercises, assigning new UUIDs to every row, within a single transaction.

#### Scenario: Duplicate copies entire tree
- **WHEN** `duplicate(id, "Copy of Push Day")` is called
- **THEN** a new routine is inserted with a different UUID from the original, the given name, and new `createdAt`/`updatedAt`. All days and exercises from the original are copied with new UUIDs and proper FK references to the new routine/day IDs. The original routine is not modified.

#### Scenario: Duplicate preserves exercise configuration
- **WHEN** `duplicate(id, "Copy")` is called for a routine where exercises have `targetSets`, `targetRepsMin`, `targetRepsMax`, `restSeconds`, `notes`, and `sortOrder`
- **THEN** all copied exercises retain the same configuration values (only IDs change)

### Requirement: Get days for a routine
The system SHALL retrieve all days belonging to a routine, ordered by `sortOrder`.

#### Scenario: Get days ordered
- **WHEN** `getDays(routineId)` is called
- **THEN** `RoutineDay[]` is returned, ordered by `sortOrder ASC`

### Requirement: Create routine day
The system SHALL create a new day within a routine with a generated UUID.

#### Scenario: Create day
- **WHEN** `createDay(routineId, { name: "Day 1", dayOfWeek: 1 })` is called
- **THEN** a new `routine_days` row is inserted with a generated UUID, the given `routineId`, `sortOrder = 0`, and the provided fields. The created `RoutineDay` is returned.

### Requirement: Update routine day
The system SHALL update an existing routine day's fields.

#### Scenario: Update day name
- **WHEN** `updateDay(dayId, { name: "Updated Day" })` is called
- **THEN** the corresponding `routine_days` row's `name` field is updated

### Requirement: Delete routine day with cascade
The system SHALL delete a routine day and cascade to its exercises.

#### Scenario: Delete day cascades to exercises
- **WHEN** `deleteDay(dayId)` is called for a day with exercises
- **THEN** the day and all its `routine_exercises` are removed

### Requirement: Reorder days in batch
The system SHALL update `sortOrder` for multiple days in a single transaction.

#### Scenario: Reorder days
- **WHEN** `reorderDays(routineId, ["day-id-3", "day-id-1", "day-id-2"])` is called
- **THEN** day "day-id-3" gets `sortOrder = 0`, "day-id-1" gets `sortOrder = 1`, "day-id-2" gets `sortOrder = 2`, all within one transaction

### Requirement: Get exercises for a day with exercise JOIN
The system SHALL retrieve exercises for a given day, joined with the `exercises` table to include exercise name and equipment.

#### Scenario: Get exercises with exercise data
- **WHEN** `getExercises(dayId)` is called
- **THEN** `RoutineExerciseWithExercise[]` is returned. Each item includes all `RoutineExercise` fields plus `exerciseName` (from `exercises.name`) and `equipment` (from `exercises.equipment`), ordered by `sortOrder ASC`

### Requirement: Create routine exercise
The system SHALL create a new exercise within a routine day with a generated UUID.

#### Scenario: Create exercise with target configuration
- **WHEN** `createExercise(dayId, { exerciseId: "ex-1", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90 })` is called
- **THEN** a new `routine_exercises` row is inserted with a generated UUID, the given `routineDayId`, and the provided configuration fields. The created `RoutineExercise` is returned.

### Requirement: Update routine exercise
The system SHALL update an existing routine exercise's configuration fields.

#### Scenario: Update exercise targets
- **WHEN** `updateExercise(exerciseId, { targetSets: 5, targetRepsMin: 6, targetRepsMax: 8 })` is called
- **THEN** the corresponding `routine_exercises` row's fields are updated

### Requirement: Delete routine exercise
The system SHALL delete a routine exercise by its ID.

#### Scenario: Delete exercise
- **WHEN** `deleteExercise(exerciseId)` is called
- **THEN** the `routine_exercises` row is removed

### Requirement: Reorder exercises in batch
The system SHALL update `sortOrder` for multiple exercises in a single transaction.

#### Scenario: Reorder exercises
- **WHEN** `reorderExercises(dayId, ["re-id-c", "re-id-a", "re-id-b"])` is called
- **THEN** exercise "re-id-c" gets `sortOrder = 0`, "re-id-a" gets `sortOrder = 1`, "re-id-b" gets `sortOrder = 2`, all within one transaction

### Requirement: All queries are parametrized
All SQL statements SHALL use parametrized queries with `?` placeholders and never concatenate user-provided values into SQL strings.

#### Scenario: No string interpolation in queries
- **WHEN** any repository method constructs a SQL query
- **THEN** all variable values are passed via parameter arrays to `runAsync`/`getFirstAsync`/`getAllAsync`

### Requirement: Multi-table mutations use transactions
Any operation that modifies more than one table SHALL execute within a single transaction to guarantee atomicity.

#### Scenario: Duplicate runs in a transaction
- **WHEN** `duplicate()` is called
- **THEN** all INSERT operations are wrapped in `db.withTransactionAsync()` (or equivalent)

#### Scenario: Reorder runs in a transaction
- **WHEN** `reorderDays()` or `reorderExercises()` is called
- **THEN** all UPDATE operations are wrapped in a transaction

