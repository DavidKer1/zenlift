## MODIFIED Requirements

### Requirement: Singleton database instance
The Flutter app SHALL provide a single Drift-backed SQLite database instance for the application lifecycle.

#### Scenario: First call opens database
- **WHEN** the Flutter database provider is initialized for the first time
- **THEN** the system opens `zenlift.db`, activates WAL mode and foreign keys, runs Drift migrations, and returns the database instance.

#### Scenario: Subsequent calls return same instance
- **WHEN** the database provider is read after the database has already been opened
- **THEN** the system returns the existing Drift database instance without re-running initialization.

#### Scenario: Concurrent reads do not duplicate initialization
- **WHEN** multiple providers or repositories request the database before initialization completes
- **THEN** initialization executes exactly once and all callers share the same instance.

### Requirement: WAL journal mode
The Flutter database connection SHALL enable Write-Ahead Logging (WAL) journal mode.

#### Scenario: WAL mode is active
- **WHEN** the Drift database connection opens
- **THEN** `PRAGMA journal_mode` returns `wal`.

### Requirement: Foreign key enforcement
The Flutter database connection SHALL enable foreign key constraint enforcement.

#### Scenario: Foreign keys are enforced
- **WHEN** the Drift database connection opens
- **THEN** `PRAGMA foreign_keys` returns `1`.

### Requirement: Automatic migration execution
The Flutter database connection SHALL execute pending Drift migrations automatically during initialization before repositories can use the database.

#### Scenario: Migrations run on first open
- **WHEN** the Drift database initializes the connection
- **THEN** all pending migrations execute before the database instance is exposed.

#### Scenario: Failed migration prevents database use
- **WHEN** a Drift migration fails during initialization
- **THEN** the error is surfaced
- **AND** no repository receives a partially initialized database instance.

### Requirement: Graceful teardown
The Flutter database layer SHALL support closing the Drift database connection and resetting singleton state for app shutdown and tests.

#### Scenario: Close database
- **WHEN** database teardown is requested
- **THEN** the Drift database connection is closed
- **AND** singleton state is cleared.

#### Scenario: Reset for testing
- **WHEN** a test resets the database provider
- **THEN** the Drift database is closed synchronously enough for the next test to create an isolated database instance.
