# active-workout-flow Specification

## Purpose
Specification for the active workout flows including quick-start, session creation, recovery, and navigation to the Active Workout screen.

## Requirements

### Requirement: Quick-start flows show the active workout
The system SHALL show the Active Workout screen after a quick-start action creates or recovers an active workout session.

#### Scenario: Quick-start creates a new active session
- **WHEN** the user starts a quick workout and no active session exists
- **THEN** the system SHALL create a `WorkoutSession` with status `active`
- **AND** the system SHALL persist the active session id for recovery
- **AND** the system SHALL hydrate the active workout store with the created session
- **AND** the system SHALL navigate to `/workout/active`

#### Scenario: Quick-start continues an existing active session
- **WHEN** the user starts a quick workout and chooses to continue an existing active session
- **THEN** the system SHALL recover the active session from local storage
- **AND** the system SHALL hydrate the active workout store with the recovered session and exercises
- **AND** the system SHALL navigate to `/workout/active`

#### Scenario: Quick-start starts a new session over an existing active session
- **WHEN** the user starts a quick workout and chooses to start a new session while another active session exists
- **THEN** the system SHALL cancel the previous active session before creating the new one
- **AND** the system SHALL hydrate the active workout store with the new active session
- **AND** the system SHALL navigate to `/workout/active`

### Requirement: Active Workout route recovers persisted sessions
The Active Workout route SHALL recover a locally persisted active session before deciding that no workout is available.

#### Scenario: Active Workout opens after app restart
- **WHEN** the user opens `/workout/active` and SQLite contains an active session
- **THEN** the system SHALL call active-session recovery
- **AND** the system SHALL render the recovered session instead of returning to Home

#### Scenario: No active session exists after recovery
- **WHEN** the user opens `/workout/active` and recovery finds no active session
- **THEN** the system SHALL navigate back to Home
- **AND** the system SHALL NOT create a new session implicitly

### Requirement: Quick-start navigation preserves workout data
The system SHALL NOT lose or orphan active workout data when quick-start navigation fails or is repeated.

#### Scenario: Navigation is repeated after a hidden active session
- **WHEN** a previous quick-start attempt persisted an active session but did not show Active Workout
- **THEN** the next quick-start attempt SHALL offer recovery or continuation for that session
- **AND** choosing continuation SHALL show the Active Workout screen with the persisted session data

#### Scenario: Session creation fails
- **WHEN** quick-start session creation fails
- **THEN** the system SHALL show an error state or alert
- **AND** the system SHALL NOT navigate to Active Workout with an empty store
