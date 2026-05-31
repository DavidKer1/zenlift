# database-connection Specification

## Purpose
TBD - created by archiving change db-connection-singleton. Update Purpose after archive.
## Requirements
### Requirement: Singleton database instance

The system SHALL provide a single Drift `AppDatabase` instance for the application lifecycle.

#### Scenario: First call opens database

- **WHEN** the application creates the first `AppDatabase`
- **THEN** the database is constructed with `openZenliftDatabaseConnection()`, which returns a `LazyDatabase` backed by `NativeDatabase.createInBackground` for `zenlift.db`

#### Scenario: Subsequent calls return same instance

- **WHEN** application code reads the database dependency after the first `AppDatabase` has been created
- **THEN** the system returns the existing database instance immediately without re-running initialization

#### Scenario: Concurrent calls do not duplicate initialization

- **WHEN** multiple callers read the database dependency while Drift is lazily opening the connection
- **THEN** all callers share the same `AppDatabase` and underlying `LazyDatabase` open operation instead of creating duplicate database connections

### Requirement: WAL journal mode

The system SHALL enable Write-Ahead Logging (WAL) journal mode on the database connection.

#### Scenario: WAL mode is active

- **WHEN** the database connection is initialized
- **THEN** `MigrationStrategy.beforeOpen` executes `PRAGMA journal_mode = WAL` before the connection is used

### Requirement: Foreign key enforcement

The system SHALL enable foreign key constraint enforcement on the database connection.

#### Scenario: Foreign keys are enforced

- **WHEN** the database connection is initialized
- **THEN** `MigrationStrategy.beforeOpen` executes `PRAGMA foreign_keys = ON` before the connection is used

### Requirement: Automatic migration execution

The system SHALL execute pending Drift migrations automatically during connection opening, before the database is used.

#### Scenario: Migrations run on first open

- **WHEN** the first query, transaction, or stream causes the `LazyDatabase` to open
- **THEN** the `AppDatabase.migration` `MigrationStrategy` runs the required `onCreate` or `onUpgrade` path before user data operations proceed

#### Scenario: Failed migration prevents database use

- **WHEN** a migration fails during initialization
- **THEN** Drift surfaces the migration error to the caller and the database dependency MUST NOT be treated as ready for use

### Requirement: Graceful teardown

The system SHALL support closing the database connection and resetting the singleton state.

#### Scenario: Close database

- **WHEN** `closeDatabase()` is called
- **THEN** `database.close()` is awaited and the stored `AppDatabase` instance is cleared

#### Scenario: Reset for testing

- **WHEN** `resetDatabaseInstance()` is called
- **THEN** `database.close()` is awaited when an instance exists and the singleton state is cleared, identical to `closeDatabase()`
