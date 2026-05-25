# data-export

## Purpose

Defines the behavior for exporting all local SQLite data as a `.zenlift` JSON file and sharing it via the native share sheet, including metadata and error handling.

## Requirements

### Requirement: Export generates a .zenlift JSON file

The system SHALL export all local SQLite data (routines, exercises, workout sessions, set logs, personal records) as a single JSON file with the `.zenlift` extension, written to the app's cache directory and shared via the native share sheet using `expo-sharing`.

#### Scenario: Successful export

- **WHEN** the user taps "Export data"
- **THEN** a `.zenlift` file is written to the cache directory and the native share sheet opens

#### Scenario: Export file contains all data tables

- **WHEN** export completes
- **THEN** the JSON file contains keys for `routines`, `routine_days`, `routine_exercises`, `exercises`, `exercise_muscles`, `workout_sessions`, `workout_exercises`, `set_logs`, and `personal_records`

#### Scenario: Export file includes metadata

- **WHEN** export completes
- **THEN** the JSON file includes top-level `version`, `exportedAt` (ISO 8601), and `appVersion` fields

#### Scenario: Export when no sharing is available

- **WHEN** `expo-sharing.isAvailableAsync()` returns false
- **THEN** an error message is displayed to the user

#### Scenario: Export with empty database

- **WHEN** the database has no workout data
- **THEN** the JSON file contains empty arrays for all table keys

### Requirement: Export error handling

The system SHALL display an error message if the export fails for any reason (file system error, missing database, permission denied).

#### Scenario: File write fails

- **WHEN** writing the export file to the cache directory fails
- **THEN** an error message is shown to the user
