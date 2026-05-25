## MODIFIED Requirements

### Requirement: Start Quick Workout creates a session with this exercise
The system SHALL provide a "Quick Workout" action that creates or updates an active workout session with this exercise and navigates to the active workout screen through the shared workout start flow.

#### Scenario: No active session exists
- **WHEN** the user taps "Iniciar entrenamiento rápido" and no active session exists
- **THEN** the system creates a new `WorkoutSession` with status "active"
- **THEN** the system adds this exercise to the session
- **THEN** the system hydrates the active workout store with the session and exercise
- **THEN** the system navigates to the active workout screen

#### Scenario: Active session already exists
- **WHEN** the user taps "Iniciar entrenamiento rápido" and an active session already exists
- **THEN** the system displays a confirmation dialog asking whether to add the exercise to the existing session or start a new one

#### Scenario: User adds exercise to current active session
- **WHEN** the user chooses to add the exercise to the existing active session
- **THEN** the system adds the exercise to that active session
- **AND** the system recovers or updates the active workout store
- **AND** the system navigates to the active workout screen

#### Scenario: User starts a new session from exercise detail
- **WHEN** the user chooses to start a new session from the exercise detail active-session dialog
- **THEN** the system cancels the previous active session before creating the new session
- **AND** the system adds this exercise to the new active session
- **AND** the system hydrates the active workout store with the new session and exercise
- **AND** the system navigates to the active workout screen