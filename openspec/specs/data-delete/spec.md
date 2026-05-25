# data-delete

## Purpose

Defines the behavior for permanently deleting all user data (SQLite tables and MMKV storage) from the app, including the double-confirmation flow and re-seeding of muscle group data.

## Requirements

### Requirement: Delete all data requires double confirmation

The system SHALL require two confirmation steps to delete all data: first a warning Alert, then a text input where the user must type "BORRAR" exactly, case-sensitive.

#### Scenario: First confirmation shows warning

- **WHEN** the user taps "Delete all data"
- **THEN** an Alert dialog appears warning that all data will be permanently deleted

#### Scenario: User cancels first confirmation

- **WHEN** the user taps "Cancel" on the warning alert
- **THEN** no data is deleted and the settings screen remains unchanged

#### Scenario: Second confirmation requires typing BORRAR

- **WHEN** the user confirms the first warning
- **THEN** a text input prompt appears requiring the user to type "BORRAR"

#### Scenario: Incorrect text does not delete

- **WHEN** the user types anything other than "BORRAR"
- **THEN** the delete action is not executed

#### Scenario: Correct text triggers deletion

- **WHEN** the user types "BORRAR" (exact, case-sensitive)
- **THEN** all data is deleted

### Requirement: Delete removes all SQLite and MMKV data

The system SHALL delete all rows from all SQLite tables (routines, exercises, workout sessions, set logs, personal records, exercise muscles, routine days, routine exercises, workout exercises, muscle groups seed data) and clear all MMKV keys.

#### Scenario: SQLite tables are empty after delete

- **WHEN** delete completes
- **THEN** all SQLite tables contain zero rows

#### Scenario: MMKV is cleared after delete

- **WHEN** delete completes
- **THEN** all MMKV keys are removed

#### Scenario: App re-seeds muscle groups after delete

- **WHEN** delete completes
- **THEN** the muscle group seed data is re-inserted to maintain data integrity

### Requirement: Delete confirmation buttons use danger styling

The system SHALL style the delete button and confirmation prompts using the danger color (red), not primary orange or green.

#### Scenario: Delete button is red

- **WHEN** the settings screen renders
- **THEN** the "Delete all data" button uses the danger color

#### Scenario: Confirmation uses danger accent

- **WHEN** the second confirmation prompt appears
- **THEN** the confirm button uses the danger color
