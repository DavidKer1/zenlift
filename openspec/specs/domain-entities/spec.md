# Domain Entities

## Purpose

Define the core TypeScript domain entity interfaces, union types, and composed read models for the Zenlift data layer.

## Requirements

### Requirement: Core persisted entities
The domain layer SHALL define TypeScript interfaces for every documented core persisted entity.

#### Scenario: Entity interfaces exist
- **WHEN** `src/domain/entities/index.ts` is inspected
- **THEN** it exports interfaces for muscle groups, exercises, exercise muscles, routines, routine days, routine exercises, workout sessions, workout exercises, set logs, personal records, app settings, and migrations

#### Scenario: Routine exercise excludes break fields
- **WHEN** the `RoutineExercise` interface is inspected
- **THEN** it SHALL include target sets and target reps fields
- **AND** it SHALL NOT include break or rest fields

### Requirement: Domain unions
The domain layer SHALL define string union types for constrained domain values.

#### Scenario: Constrained values are typed
- **WHEN** entity fields use equipment, exercise category, muscle role, set type, workout status, or personal record type
- **THEN** those fields reference exported string union types

### Requirement: UUID text IDs
Persisted domain entities SHALL represent IDs as text strings.

#### Scenario: Entity ID fields are strings
- **WHEN** a persisted entity has an `id` field
- **THEN** the TypeScript type for that field is `string`

### Requirement: SQL row field naming
Persisted domain entity interfaces SHALL use snake_case field names matching SQLite column names.

#### Scenario: SQLite fields align
- **WHEN** a repository later maps a SQLite row into a persisted entity
- **THEN** matching snake_case fields are available on the entity interface

### Requirement: Composed read models
The domain layer SHALL export composed types for routine, workout, and summary read models used by features.

#### Scenario: Composed models exist
- **WHEN** feature code imports domain entity types
- **THEN** it can import full routine, workout exercise with sets, full session, and workout summary types
