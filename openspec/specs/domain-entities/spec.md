# Domain Entities

## Purpose

Define the core Dart domain models, enums, and composed read models for the Zenlift data layer.

## Requirements

### Requirement: Core persisted entities
The domain layer SHALL define Dart models for every documented core persisted entity.

#### Scenario: Entity interfaces exist
- **WHEN** the feature domain and storage model files are inspected
- **THEN** they provide models for muscle groups, exercises, exercise muscles, routines, routine days, routine exercises, workout sessions, workout exercises, set logs, personal records, app settings, and migrations

#### Scenario: Routine exercise excludes break fields
- **WHEN** the `RoutineExercise` model is inspected
- **THEN** it SHALL include target sets and target reps fields
- **AND** it SHALL NOT include break or rest fields

### Requirement: Domain unions
The domain layer SHALL define enums or value objects for constrained domain values.

#### Scenario: Constrained values are typed
- **WHEN** entity fields use equipment, exercise category, muscle role, set type, workout status, or personal record type
- **THEN** those fields reference typed Dart values rather than unvalidated strings

### Requirement: UUID text IDs
Persisted domain entities SHALL represent IDs as text strings.

#### Scenario: Entity ID fields are strings
- **WHEN** a persisted entity has an `id` field
- **THEN** the Dart type for that field is `String`

### Requirement: SQL row field naming
Persisted storage rows SHALL use snake_case field names matching SQLite column names, while domain models may use idiomatic Dart property names.

#### Scenario: SQLite fields align
- **WHEN** a repository later maps a SQLite row into a persisted entity
- **THEN** matching snake_case fields are available on the storage row or mapper

### Requirement: Composed read models
The domain layer SHALL provide composed types for routine, workout, and summary read models used by features.

#### Scenario: Composed models exist
- **WHEN** feature code imports domain entity types
- **THEN** it can import full routine, workout exercise with sets, full session, and workout summary types
