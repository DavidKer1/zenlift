# Data Sharing

## Purpose

Defines the behavior for saving all local SQLite data as a `.zenlift` JSON file and sharing it via the native share sheet, including metadata and error handling.

## Requirements

### Requirement: Data sharing generates a .zenlift JSON file

The system SHALL save all local SQLite data (routines, exercises, workout sessions, set logs, personal records) as a single JSON file with the `.zenlift` extension, written to the app's cache directory and shared via the native share sheet using Flutter sharing support.

#### Scenario: Successful data share

- **WHEN** the user taps "Share data"
- **THEN** a `.zenlift` file is written to the cache directory and the native share sheet opens

#### Scenario: Shared file contains all data tables

- **WHEN** data sharing completes
- **THEN** the JSON file contains keys for `routines`, `routine_days`, `routine_exercises`, `exercises`, `exercise_muscles`, `workout_sessions`, `workout_exercises`, `set_logs`, and `personal_records`

#### Scenario: Shared file includes metadata

- **WHEN** data sharing completes
- **THEN** the JSON file includes top-level `version`, `exportedAt` (ISO 8601), and `appVersion` fields

#### Scenario: Sharing unavailable

- **WHEN** native sharing is unavailable
- **THEN** an error message is displayed to the user

#### Scenario: Share with empty database

- **WHEN** the database has no workout data
- **THEN** the JSON file contains empty arrays for all table keys

### Requirement: Data sharing error handling

The system SHALL display an error message if data sharing fails for any reason (file system error, missing database, permission denied).

#### Scenario: Shared file write fails

- **WHEN** writing the shared file to the cache directory fails
- **THEN** an error message is shown to the user
