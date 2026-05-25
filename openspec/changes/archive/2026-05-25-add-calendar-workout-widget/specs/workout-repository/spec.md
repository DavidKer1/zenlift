# Workout Repository

Delta spec for repository reads that power the Home Screen calendar workout widget.

## ADDED Requirements

### Requirement: Home calendar summary read model
The `WorkoutRepo` SHALL provide a repository read method for the Home calendar widget summary, backed by parametrized SQLite queries.

#### Scenario: Get summary with completed workout history
- **WHEN** the Home Screen requests the calendar widget summary
- **THEN** `WorkoutRepo` SHALL return completed workout activity dates for the requested recent month window ordered by `started_at`
- **AND** it SHALL return the latest completed workout metadata needed for display

#### Scenario: Latest routine day frequency is counted
- **WHEN** the latest completed workout has a `routine_day_id`
- **THEN** the summary frequency count SHALL equal the number of completed sessions with that same `routine_day_id`

#### Scenario: Latest routine frequency is counted
- **WHEN** the latest completed workout has a `routine_id` but no `routine_day_id`
- **THEN** the summary frequency count SHALL equal the number of completed sessions with that same `routine_id`

#### Scenario: Latest freestyle session frequency is counted by name
- **WHEN** the latest completed workout has no routine context but has a non-empty `name`
- **THEN** the summary frequency count SHALL equal the number of completed sessions with the same `name`

#### Scenario: Latest workout has no repeatable identity
- **WHEN** the latest completed workout has no routine context and no non-empty `name`
- **THEN** the summary SHALL mark the workout as not repeatable
- **AND** it SHALL provide a displayable fallback label for the widget

#### Scenario: Active and cancelled sessions are excluded
- **WHEN** the repository builds calendar activity and frequency data
- **THEN** sessions whose `status` is `active` or `cancelled` SHALL NOT contribute to activity dots, latest workout metadata, or frequency counts

#### Scenario: No completed workouts exist
- **WHEN** no completed sessions exist in `workout_sessions`
- **THEN** the repository method SHALL return an empty activity list and `latestWorkout` as `null`

#### Scenario: Queries are parametrized and errors are wrapped
- **WHEN** the repository queries the widget summary with date bounds, limit values, or identity filters
- **THEN** all user- or caller-provided values SHALL be passed as SQL parameters
- **AND** database errors SHALL be caught and re-thrown with a message identifying the calendar summary operation