## MODIFIED Requirements

### Requirement: Quick-start flows show the active workout
The Flutter app SHALL show the Active Workout route after a quick-start action creates or recovers an active workout session.

#### Scenario: Quick-start creates a new active session
- **WHEN** the user starts a quick workout and no active session exists
- **THEN** the system SHALL create a `WorkoutSession` with status `active`
- **AND** the system SHALL persist the active session id for recovery through the Drift repository
- **AND** the system SHALL hydrate `ActiveWorkoutController` with the created session
- **AND** the system SHALL navigate to `/workout/active`.

#### Scenario: Quick-start continues an existing active session
- **WHEN** the user starts a quick workout and chooses to continue an existing active session
- **THEN** the system SHALL recover the active session from Drift
- **AND** the system SHALL hydrate `ActiveWorkoutController` with the recovered session and exercises
- **AND** the system SHALL navigate to `/workout/active`.

#### Scenario: Quick-start starts a new session over an existing active session
- **WHEN** the user starts a quick workout and chooses to start a new session while another active session exists
- **THEN** the system SHALL require explicit user confirmation before replacing the existing active session
- **AND** the system SHALL cancel the previous active session by setting its status to `cancelled`
- **AND** the system SHALL preserve the previous session's completed `SetLog` rows and completed timestamps
- **AND** the system SHALL hydrate `ActiveWorkoutController` with the new active session
- **AND** the system SHALL navigate to `/workout/active`.

#### Scenario: Quick-start replacement is not confirmed
- **WHEN** the user starts a quick workout while another active session exists
- **AND** the user does not confirm starting a new session
- **THEN** the system SHALL preserve the existing active session with status `active`
- **AND** the system SHALL NOT delete completed sets or create a replacement session.

### Requirement: Active Workout route recovers persisted sessions
The Flutter Active Workout route SHALL recover a locally persisted active session before deciding that no workout is available.

#### Scenario: Active Workout opens after app restart
- **WHEN** the user opens `/workout/active` and SQLite contains an active session
- **THEN** `ActiveWorkoutController` SHALL call active-session recovery
- **AND** the route SHALL render the recovered session instead of returning to Home.

#### Scenario: No active session exists after recovery
- **WHEN** the user opens `/workout/active` and recovery finds no active session
- **THEN** the route SHALL navigate back to Home
- **AND** the system SHALL NOT create a new session implicitly.

### Requirement: Quick-start navigation preserves workout data
The Flutter app SHALL NOT lose or orphan active workout data when quick-start navigation fails or is repeated.

#### Scenario: Navigation is repeated after a hidden active session
- **WHEN** a previous quick-start attempt persisted an active session but did not show Active Workout
- **THEN** the next quick-start attempt SHALL offer recovery or continuation for that session
- **AND** choosing continuation SHALL show the Active Workout route with the persisted session data.

#### Scenario: Session creation fails
- **WHEN** quick-start session creation fails
- **THEN** the system SHALL show an error state or alert
- **AND** the system SHALL NOT navigate to Active Workout with an empty controller state.

### Requirement: Completed sets autosave
The Flutter Active Workout flow SHALL autosave completed sets through the Drift workout repository.

#### Scenario: User completes a set
- **WHEN** the user marks a set complete in Active Workout
- **THEN** the Drift workout repository persists weight, reps, set type, completion state, and completed timestamp
- **AND** `ActiveWorkoutController` updates from the persisted result.

#### Scenario: Completed set write retries and remains pending after failure
- **WHEN** the user marks a set complete and the initial Drift write fails
- **THEN** the system SHALL retry the completed-set write up to the configured retry limit
- **AND** if retries fail, the system SHALL persist a pending completed-set write containing the set UUID, workout exercise UUID, weight, reps, set type, completion state, and completed timestamp
- **AND** Active Workout SHALL surface a recoverable pending-save state without marking the set as safely persisted
- **AND** app resume or active-session recovery SHALL retry the pending completed-set write.

#### Scenario: App restarts after set completion
- **WHEN** the app restarts after a set completion was saved
- **THEN** active-session recovery SHALL restore the completed set from SQLite.
