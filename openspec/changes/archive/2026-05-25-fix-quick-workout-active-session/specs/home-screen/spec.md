## ADDED Requirements

### Requirement: Quick Workout button starts active workout
The system SHALL provide a Home Quick Workout button that starts or recovers an active workout session and opens the Active Workout screen.

#### Scenario: User taps Quick Workout with no active session
- **WHEN** the user taps the Home Screen "Quick Workout" button and no active session exists
- **THEN** the system SHALL create a new active workout session through the shared workout start flow
- **AND** the system SHALL navigate to `/workout/active`
- **AND** the Active Workout screen SHALL render the new session

#### Scenario: User taps Quick Workout with an active session
- **WHEN** the user taps the Home Screen "Quick Workout" button and an active session already exists
- **THEN** the system SHALL present the active-session options from the shared workout start flow
- **AND** choosing to continue SHALL recover the active session and navigate to `/workout/active`

#### Scenario: Quick Workout start fails
- **WHEN** the user taps the Home Screen "Quick Workout" button and the workout start flow fails
- **THEN** the system SHALL show a recoverable error message
- **AND** the system SHALL remain on the current screen without creating an invisible active workout UI state