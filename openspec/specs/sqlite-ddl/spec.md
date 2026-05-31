# sqlite-ddl Specification

## Purpose
TBD - created by archiving change sqlite-schema. Update Purpose after archive.
## Requirements
### Requirement: DDL definitions are available
The Drift schema SHALL define the tables and indices needed by the local SQLite database.

#### Scenario: Constants are importable
- **WHEN** any module imports the Drift database schema
- **THEN** table and index definitions are available for database initialization

### Requirement: All 12 tables are defined
`CREATE_TABLES_SQL` SHALL contain `CREATE TABLE IF NOT EXISTS` statements for all 12 tables: `muscle_groups`, `exercise_muscles`, `exercises`, `routines`, `routine_days`, `routine_exercises`, `workout_sessions`, `workout_exercises`, `set_logs`, `personal_records`, `app_settings`, `_migrations`.

#### Scenario: Every domain entity has a table
- **WHEN** `CREATE_TABLES_SQL` is inspected
- **THEN** it contains a `CREATE TABLE IF NOT EXISTS` statement for each of the 12 tables

### Requirement: Snake_case column names match domain entities
Every SQLite column name SHALL use snake_case and map cleanly to the corresponding Dart storage row and domain model fields.

#### Scenario: Column names match Dart models
- **WHEN** a SQL column name is compared to its corresponding Dart model field
- **THEN** it has a deterministic mapper to the corresponding Dart model field

### Requirement: TEXT primary keys for entity tables
All entity tables SHALL use `TEXT PRIMARY KEY` for their `id` column, except `app_settings` which uses `key TEXT PRIMARY KEY`, and `_migrations` which uses `version INTEGER PRIMARY KEY`.

#### Scenario: Primary keys are text
- **WHEN** a `CREATE TABLE` statement for a domain entity (excluding `app_settings` and `_migrations`) is inspected
- **THEN** the primary key column definition includes `TEXT` and `PRIMARY KEY`

### Requirement: Foreign keys with CASCADE DELETE
All foreign key columns SHALL include `REFERENCES <parent_table>(<parent_column>) ON DELETE CASCADE`.

#### Scenario: Foreign keys cascade on delete
- **WHEN** a `CREATE TABLE` statement has a foreign key column
- **THEN** the column definition includes `REFERENCES ... ON DELETE CASCADE`

### Requirement: CHECK constraints on enum columns
The schema SHALL include CHECK constraints on `status`, `role`, `set_type`, and `type` columns matching their respective Dart enum values.

#### Scenario: Status CHECK constraint
- **WHEN** the `workout_sessions` table DDL is inspected
- **THEN** it includes `CHECK(status IN ('active','completed','cancelled'))`

#### Scenario: Role CHECK constraint
- **WHEN** the `exercise_muscles` table DDL is inspected
- **THEN** it includes `CHECK(role IN ('primary','secondary'))`

#### Scenario: Set type CHECK constraint
- **WHEN** the `set_logs` table DDL is inspected
- **THEN** it includes `CHECK(set_type IN ('normal','warmup','drop','failure','amrap'))`

#### Scenario: PR type CHECK constraint
- **WHEN** the `personal_records` table DDL is inspected
- **THEN** it includes `CHECK(type IN ('max_weight','max_volume','max_reps','estimated_1rm','max_session_volume'))`

### Requirement: Five performance indices
`CREATE_INDICES_SQL` SHALL contain `CREATE INDEX IF NOT EXISTS` statements for the five query hotspot indices.

#### Scenario: All five indices are present
- **WHEN** `CREATE_INDICES_SQL` is inspected
- **THEN** it contains index creation for `idx_exercise_muscles_exercise`, `idx_exercise_muscles_muscle`, `idx_workout_sessions_status`, `idx_workout_sessions_started`, `idx_workout_exercises_session`, and `idx_set_logs_workout_exercise`

### Requirement: DEFAULT values on boolean and ordering columns
Columns representing booleans (e.g., `is_custom`, `is_favorite`, `is_archived`, `is_completed`) SHALL use `DEFAULT 0`. Columns representing sort order SHALL use `DEFAULT 0`. The `set_type` column SHALL use `DEFAULT 'normal'`.

#### Scenario: Default values are set
- **WHEN** the schema DDL is inspected
- **THEN** boolean columns default to 0, sort_order columns default to 0, and set_type defaults to 'normal'

### Requirement: SQL syntax is valid SQLite
The generated Drift schema SHALL be syntactically valid SQLite DDL that can be executed by SQLite without errors.

#### Scenario: Schema executes without errors
- **WHEN** the Drift database opens against a fresh SQLite database
- **THEN** all 12 tables and 6 indices exist with no syntax errors

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
