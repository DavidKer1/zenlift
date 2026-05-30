## MODIFIED Requirements

### Requirement: Import reads a .zenlift file
The Flutter app SHALL allow the user or first-launch migration bridge to read a `.zenlift` export, validate its structure, and merge its data into the local Drift database by UUID without overwriting existing local records.

#### Scenario: Import merges by UUID without overwrite
- **WHEN** a record in the import file has a UUID that already exists in the Flutter database
- **THEN** the existing Flutter record SHALL NOT be overwritten
- **AND** the import result SHALL report the UUID as skipped or already present.

#### Scenario: Import inserts new records
- **WHEN** a record in the import file has a UUID that does not exist locally
- **THEN** the record SHALL be inserted into the corresponding table
- **AND** its original UUID SHALL be preserved.

#### Scenario: Import preserves referential integrity
- **WHEN** a `.zenlift` file contains routines, routine days, routine exercises, workout sessions, workout exercises, set logs, exercises, exercise muscles, personal records, and settings
- **THEN** the import SHALL merge parent rows before dependent rows
- **AND** the import SHALL abort before committing if a dependent row references a missing required parent.

### Requirement: Import validates before writing
The Flutter app SHALL validate the `.zenlift` file structure and migration metadata before importing any data.

#### Scenario: Invalid file aborts with no writes
- **WHEN** a `.zenlift` file is missing required keys, contains invalid types, or cannot be parsed as JSON
- **THEN** validation SHALL fail
- **AND** no SQLite or settings writes SHALL occur.

#### Scenario: Unsupported export version aborts with no writes
- **WHEN** a `.zenlift` file has an unsupported schema or export version
- **THEN** import SHALL show an actionable error
- **AND** no SQLite or settings writes SHALL occur.

### Requirement: Import rolls back or aborts safely
The Flutter app SHALL leave the database and settings in a consistent state when import or cutover fails.

#### Scenario: Database error during import
- **WHEN** a Drift write fails during import
- **THEN** the import transaction SHALL roll back inserted rows from that import attempt
- **AND** existing Flutter rows SHALL remain unchanged
- **AND** Expo SQLite/MMKV source data SHALL remain untouched.

#### Scenario: Settings error during import
- **WHEN** an MMKV or settings-store write fails during import
- **THEN** cutover SHALL abort
- **AND** the system SHALL retain the original Expo settings data for retry
- **AND** the Flutter app SHALL NOT write the migration cutover marker.

### Requirement: First-launch migration preserves existing Expo data
The Flutter app SHALL detect and preserve existing Expo SQLite/MMKV data during first-launch migration.

#### Scenario: First launch with Expo data present
- **WHEN** the Flutter app starts and detects existing Expo SQLite or MMKV data without a Flutter cutover marker
- **THEN** the app SHALL offer or run the migration bridge
- **AND** the app SHALL copy data into Flutter storage using validated import semantics
- **AND** the app SHALL NOT delete or mutate the Expo SQLite/MMKV files.

#### Scenario: First-launch migration verification passes
- **WHEN** migration import completes and verification confirms expected table row counts, settings keys, and required UUIDs
- **THEN** the Flutter app SHALL write a cutover marker
- **AND** future launches SHALL use the Flutter database as the active store.

#### Scenario: First-launch migration verification fails
- **WHEN** migration import completes but verification fails
- **THEN** the Flutter app SHALL abort cutover
- **AND** the Flutter app SHALL preserve enough failure detail for retry or support
- **AND** the Expo SQLite/MMKV data SHALL remain available and unchanged.
