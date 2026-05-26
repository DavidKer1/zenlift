## ADDED Requirements

### Requirement: Routine exercises schema excludes rest seconds
The `routine_exercises` table SHALL NOT define `rest_seconds` or any break/rest column in the current launch-phase schema.

#### Scenario: Current DDL has no rest seconds column
- **WHEN** `CREATE_TABLES_SQL` is inspected
- **THEN** the `routine_exercises` table definition SHALL include target sets and target reps columns
- **AND** it SHALL NOT include `rest_seconds`

#### Scenario: Existing databases migrate without rest seconds
- **WHEN** migrations run against a database that already has `routine_exercises.rest_seconds`
- **THEN** the migrated `routine_exercises` table SHALL preserve id, routine_day_id, exercise_id, target_sets, target_reps_min, target_reps_max, notes, and sort_order
- **AND** the migrated table SHALL NOT include `rest_seconds`
