## ADDED Requirements

### Requirement: Singleton database instance

The system SHALL provide a single database instance via `getDatabase()` that always returns the same `SQLite.SQLiteDatabase` object throughout the application lifecycle.

#### Scenario: First call opens database

- **WHEN** `getDatabase()` is called for the first time
- **THEN** the system opens `zenlift.db` via `SQLite.openDatabaseAsync`, activates WAL mode and foreign keys, runs migrations, and returns the database instance

#### Scenario: Subsequent calls return same instance

- **WHEN** `getDatabase()` is called after the database has already been opened
- **THEN** the system returns the existing database instance immediately without re-running initialization

#### Scenario: Concurrent calls do not duplicate initialization

- **WHEN** multiple callers invoke `getDatabase()` simultaneously before the first initialization completes
- **THEN** all callers receive the same promise and initialization executes exactly once

### Requirement: WAL journal mode

The system SHALL enable Write-Ahead Logging (WAL) journal mode on the database connection.

#### Scenario: WAL mode is active

- **WHEN** the database connection is initialized
- **THEN** `PRAGMA journal_mode` returns `wal`

### Requirement: Foreign key enforcement

The system SHALL enable foreign key constraint enforcement on the database connection.

#### Scenario: Foreign keys are enforced

- **WHEN** the database connection is initialized
- **THEN** `PRAGMA foreign_keys` returns `1`

### Requirement: Automatic migration execution

The system SHALL execute pending database migrations automatically during initialization, before returning the database instance.

#### Scenario: Migrations run on first open

- **WHEN** `getDatabase()` initializes the connection
- **THEN** `runMigrations(db)` is called and completes before `getDatabase()` resolves

#### Scenario: Failed migration prevents database use

- **WHEN** a migration fails during initialization
- **THEN** the `initPromise` is cleared, the error is thrown, and no database instance is stored

### Requirement: Graceful teardown

The system SHALL support closing the database connection and resetting the singleton state.

#### Scenario: Close database

- **WHEN** `closeDatabase()` is called
- **THEN** the database connection is closed and the singleton instance is set to `null`

#### Scenario: Reset for testing

- **WHEN** `resetDatabaseInstance()` is called
- **THEN** the database connection is closed and the singleton state is cleared, identical to `closeDatabase()`
