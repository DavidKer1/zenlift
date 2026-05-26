## MODIFIED Requirements

### Requirement: Duplicate routine with new UUIDs
The system SHALL deep-clone a routine, its days, and its exercises, assigning new UUIDs to every row, within a single transaction.

#### Scenario: Duplicate copies entire tree
- **WHEN** `duplicate(id, "Copy of Push Day")` is called
- **THEN** a new routine is inserted with a different UUID from the original, the given name, and new `createdAt`/`updatedAt`. All days and exercises from the original are copied with new UUIDs and proper FK references to the new routine/day IDs. The original routine is not modified.

#### Scenario: Duplicate preserves exercise configuration
- **WHEN** `duplicate(id, "Copy")` is called for a routine where exercises have `targetSets`, `targetRepsMin`, `targetRepsMax`, `notes`, and `sortOrder`
- **THEN** all copied exercises retain the same configuration values (only IDs change)

### Requirement: Create routine exercise
The system SHALL create a new exercise within a routine day with a generated UUID.

#### Scenario: Create exercise with target configuration
- **WHEN** `createExercise(dayId, { exerciseId: "ex-1", targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 })` is called
- **THEN** a new `routine_exercises` row is inserted with a generated UUID, the given `routineDayId`, and the provided configuration fields. The created `RoutineExercise` is returned.
