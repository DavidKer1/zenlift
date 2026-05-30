## MODIFIED Requirements

### Requirement: Export generates a .zenlift JSON file
The Flutter app SHALL export all local Drift data and migration-relevant settings as a single `.zenlift` JSON file that can be validated before import, cutover, or destructive data deletion.

#### Scenario: Export file contains all persisted workout data
- **WHEN** export completes
- **THEN** the JSON file SHALL contain `routines`, `routine_days`, `routine_exercises`, `exercises`, `exercise_muscles`, `workout_sessions`, `workout_exercises`, `set_logs`, and `personal_records`
- **AND** each record SHALL preserve its text UUID.

#### Scenario: Export file includes migration metadata
- **WHEN** export completes
- **THEN** the JSON file SHALL include top-level `version`, `exportedAt`, `appVersion`, `sourcePlatform`, and `schemaVersion` fields
- **AND** `exportedAt` SHALL be an ISO 8601 timestamp.

#### Scenario: Export includes migration-relevant settings
- **WHEN** export completes
- **THEN** the JSON file SHALL include settings needed for Flutter parity, including weight unit, onboarding completion, theme preference, and weekly goal when present.

### Requirement: Export verifies backup before destructive actions
The Flutter app SHALL verify a fresh `.zenlift` export before any destructive migration cleanup or delete-all-data action can proceed.

#### Scenario: Backup verification succeeds
- **WHEN** the user starts destructive migration cleanup or delete-all-data
- **AND** a fresh export is created or selected
- **AND** validation confirms the export can be parsed, has supported metadata, includes every required table key, and has expected row counts
- **THEN** the destructive action MAY continue to its confirmation flow.

#### Scenario: Backup verification fails
- **WHEN** export creation or validation fails before destructive migration cleanup or delete-all-data
- **THEN** the destructive action SHALL be blocked
- **AND** no SQLite or settings data SHALL be deleted
- **AND** the user SHALL receive an actionable backup failure message.

#### Scenario: User skips backup verification
- **WHEN** the user declines or cancels required backup verification before destructive migration cleanup or delete-all-data
- **THEN** the destructive action SHALL be blocked
- **AND** no SQLite or settings data SHALL be deleted.

### Requirement: Export error handling preserves data
The Flutter app SHALL display an error message if export fails and SHALL NOT mutate local SQLite, Drift, MMKV, or settings-store data as part of a failed export.

#### Scenario: File write fails
- **WHEN** writing the export file fails
- **THEN** an error message SHALL be shown to the user
- **AND** no local workout or settings data SHALL be changed.
