## MODIFIED Requirements

### Requirement: Core persisted entities
The domain layer SHALL define TypeScript interfaces for every documented core persisted entity, using only launch-phase fields.

#### Scenario: Entity interfaces exist
- **WHEN** `src/domain/entities/index.ts` is inspected
- **THEN** it exports interfaces for muscle groups, exercises, exercise muscles, routines, routine days, routine exercises, workout sessions, workout exercises, set logs, personal records, app settings, and migrations

#### Scenario: Routine exercise excludes rest seconds
- **WHEN** the `RoutineExercise` interface is inspected
- **THEN** it SHALL include target sets and target reps fields
- **AND** it SHALL NOT include `rest_seconds` or any break/rest field
