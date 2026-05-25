# migration-runner Specification

## Purpose
TBD - created by archiving change migration-system. Update Purpose after archive.
## Requirements
### Requirement: Migration interface defines version, description, and SQL
The system SHALL define a `Migration` interface with `version: number`, `description: string`, and `sql: string` fields.

#### Scenario: Migration object shape
- **WHEN** a `Migration` object is created
- **THEN** it MUST have a numeric `version`, a human-readable `description`, and a `sql` string containing one or more SQL statements

### Requirement: MIGRATIONS array contains all migrations in version order
The system SHALL export a `MIGRATIONS` constant array with all migrations sorted by `version` ascending.

#### Scenario: v1 migration present
- **WHEN** the `MIGRATIONS` array is inspected
- **THEN** index 0 SHALL contain the v1 migration with description describing initial schema creation

#### Scenario: Future migrations appended
- **WHEN** a new migration (e.g., v2) is added to the system
- **THEN** it SHALL be appended to the `MIGRATIONS` array after existing migrations

### Requirement: runMigrations applies pending migrations idempotently
The system SHALL provide `runMigrations(db)` that reads the `_migrations` table, determines the current maximum version, and applies all pending migrations in order.

#### Scenario: Empty database applies all migrations
- **WHEN** `runMigrations()` is called on a fresh database with no `_migrations` table and no rows
- **THEN** all migrations from `MIGRATIONS` SHALL be applied in version order starting from v1

#### Scenario: Partial migrations apply only pending
- **WHEN** `runMigrations()` is called on a database where v1 has already been applied but v2 is pending
- **THEN** only v2 SHALL be applied

#### Scenario: No pending migrations does nothing
- **WHEN** `runMigrations()` is called on a database where all known migrations have been applied
- **THEN** no SQL SHALL be executed and no new rows SHALL be inserted into `_migrations`

#### Scenario: Migration v1 applies full schema
- **WHEN** migration v1 is applied
- **THEN** it SHALL execute `CREATE_TABLES_SQL` followed by `CREATE_INDICES_SQL` from `src/storage/database/schema.ts`

### Requirement: Each migration runs in its own transaction
The system SHALL wrap each migration's SQL execution in `db.transaction()` so that a single migration either fully succeeds or fully rolls back.

#### Scenario: Migration succeeds within transaction
- **WHEN** a migration's SQL executes successfully
- **THEN** the migration SHALL be committed and its version recorded in `_migrations` via `INSERT INTO _migrations (version, description, appliedAt) VALUES (...)`

#### Scenario: Migration fails within transaction
- **WHEN** a migration's SQL fails (e.g., invalid statement)
- **THEN** the entire migration SHALL be rolled back and no version row SHALL be inserted into `_migrations`

### Requirement: getCurrentVersion returns the highest applied migration version
The system SHALL provide `getCurrentVersion(db)` returning the maximum `version` from the `_migrations` table, or 0 if no migrations have been applied.

#### Scenario: No migrations applied returns 0
- **WHEN** `getCurrentVersion()` is called on a database with no rows in `_migrations`
- **THEN** it SHALL return `0`

#### Scenario: v1 applied returns 1
- **WHEN** `getCurrentVersion()` is called after v1 has been successfully applied
- **THEN** it SHALL return `1`

#### Scenario: v2 applied returns 2
- **WHEN** `getCurrentVersion()` is called after v1 and v2 have been applied
- **THEN** it SHALL return `2`

### Requirement: First-run handles missing _migrations table
The system SHALL handle the case where the `_migrations` table does not yet exist by treating the current version as 0 and proceeding with migration v1 (which creates the `_migrations` table as part of `CREATE_TABLES_SQL`).

#### Scenario: Database exists but _migrations table missing
- **WHEN** `getCurrentVersion()` is called and the `_migrations` table does not exist
- **THEN** it SHALL return `0` without throwing an error

