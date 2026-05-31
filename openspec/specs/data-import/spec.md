# data-import

## Purpose

Defines the behavior for importing a `.zenlift` JSON file, validating its structure, and merging its data into the local SQLite database by UUID without overwriting existing records.

## Requirements

### Requirement: Import reads a .zenlift file

The system SHALL allow the user to pick a `.zenlift` file via the Flutter file picker, validate its structure, and merge its data into the local SQLite database by UUID.

#### Scenario: Successful file pick

- **WHEN** the user taps "Import data" and selects a valid `.zenlift` file
- **THEN** the file is read and its contents are parsed as JSON

#### Scenario: Import merges by UUID

- **WHEN** a record in the import file has a UUID that already exists locally
- **THEN** the existing local record is NOT overwritten

#### Scenario: Import inserts new records

- **WHEN** a record in the import file has a UUID that does not exist locally
- **THEN** the record is inserted into the corresponding table

#### Scenario: Import merges across all tables

- **WHEN** a valid `.zenlift` file is imported
- **THEN** routines, exercises, workout sessions, set logs, and personal records are all merged

### Requirement: Import validates .zenlift file structure

The system SHALL validate the `.zenlift` file structure before importing any data.

#### Scenario: Valid file passes validation

- **WHEN** a `.zenlift` file with all required keys and correct types is parsed
- **THEN** validation passes and import proceeds

#### Scenario: Invalid file fails validation

- **WHEN** a `.zenlift` file is missing required keys or has incorrect types
- **THEN** validation fails and an error message is displayed

#### Scenario: Non-JSON file is rejected

- **WHEN** the picked file cannot be parsed as JSON
- **THEN** an error message is displayed and no data is imported

### Requirement: Import error handling

The system SHALL display appropriate error messages for import failures and SHALL NOT leave the database in a corrupted state on failure.

#### Scenario: File pick cancelled

- **WHEN** the user cancels the document picker
- **THEN** no error message is displayed and no data is changed

#### Scenario: Database error during import

- **WHEN** a SQLite error occurs during merge
- **THEN** an error message is displayed and already-inserted records from this import are not rolled back

#### Scenario: Import file too large

- **WHEN** the selected file exceeds 50 MB
- **THEN** a warning is displayed before proceeding
