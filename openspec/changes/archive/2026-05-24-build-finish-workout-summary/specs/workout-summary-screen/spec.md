## ADDED Requirements

### Requirement: Display celebration header with duration
The system SHALL display a celebration header at the top of the summary screen showing the workout duration in a human-readable format.

#### Scenario: Duration displayed correctly
- **WHEN** the summary screen renders with a `WorkoutSummary` containing `duration_seconds: 3720`
- **THEN** the header displays "1h 2min" and a checkmark icon in athletic orange

#### Scenario: Duration under one minute
- **WHEN** the summary screen renders with `duration_seconds: 45`
- **THEN** the header displays "45s"

### Requirement: Display total volume
The system SHALL display the total session volume calculated as the sum of all completed non-warmup set volumes.

#### Scenario: Total volume displayed
- **WHEN** the summary screen renders with `total_volume: 5200`
- **THEN** the screen displays "5,200 kg" in the stats section

### Requirement: Display exercise and set counts
The system SHALL display the number of exercises completed and the number of sets completed.

#### Scenario: Counts displayed
- **WHEN** the summary screen renders with `exercise_count: 5` and `completed_set_count: 15`
- **THEN** the screen displays "5 ejercicios" and "15 sets" in the stats section

### Requirement: Display new PRs section
The system SHALL display a section for new Personal Records achieved during the session, with highlighted cards for each PR type.

#### Scenario: No PRs achieved
- **WHEN** the summary screen renders with `personal_record_count: 0`
- **THEN** the PRs section is not rendered or shows "Sin nuevos récords personales"

#### Scenario: Multiple PRs achieved
- **WHEN** the summary screen renders with PRs including max_weight and max_volume
- **THEN** the system displays each PR in a card showing: exercise name, PR type label, new value, previous best, and improvement percentage

#### Scenario: Session volume PR
- **WHEN** a session-volume PR is detected
- **THEN** the PR card shows "Sesión" as the exercise label with the total volume value

#### Scenario: First-ever PR (no previous best)
- **WHEN** a PR has `previousBest: null`
- **THEN** the card displays "Primer récord!" instead of improvement percentage

### Requirement: Display comparison vs previous session
The system SHALL query and display a comparison between the current session and the most recent previous completed session.

#### Scenario: Previous session exists for same routine
- **WHEN** the summary screen loads and a previous session for the same routine exists
- **THEN** the screen displays deltas for total volume, exercise count, and set count (e.g., "+12% volumen", "+2 ejercicios")

#### Scenario: No previous session
- **WHEN** the summary screen loads and no previous session exists
- **THEN** the comparison section is not rendered

#### Scenario: Previous session had lower volume
- **WHEN** the previous session had lower volume than the current session
- **THEN** the delta displays in athletic orange with a plus sign (e.g., "+15%")

### Requirement: Notes input
The system SHALL provide an optional TextInput for the user to add session notes, and save them to the database.

#### Scenario: User enters notes
- **WHEN** the user types notes in the TextInput and taps away
- **THEN** the notes are saved to `workout_session.notes` via `WorkoutRepo`

#### Scenario: Notes input placeholder
- **WHEN** the notes TextInput is empty
- **THEN** the placeholder text reads "¿Cómo te sentiste? Notas opcionales..."

### Requirement: Navigation from summary
The system SHALL provide buttons to navigate to Home and History from the summary screen.

#### Scenario: Home button
- **WHEN** the user taps the "Inicio" button
- **THEN** the system navigates to `/` and clears the workout navigation stack

#### Scenario: History button
- **WHEN** the user taps the "Historial" button
- **THEN** the system navigates to `/history`

### Requirement: Read summary from route params
The system SHALL read the `WorkoutSummary` data from route parameters passed by the finish workflow.

#### Scenario: Summary data available
- **WHEN** the summary screen mounts with valid `WorkoutSummary` route params
- **THEN** all sections render with the correct data

#### Scenario: Missing summary data
- **WHEN** the summary screen mounts without `WorkoutSummary` route params
- **THEN** the system displays an error state and a button to return Home
