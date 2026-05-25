## ADDED Requirements

### Requirement: Validate minimum sets before finish
The system SHALL validate that at least one completed set exists across all exercises before allowing the user to finish a workout.

#### Scenario: No completed sets
- **WHEN** the user taps the Finish button and zero completed sets exist
- **THEN** the system displays an alert: "Registra al menos un set antes de finalizar"

#### Scenario: At least one completed set
- **WHEN** the user taps the Finish button and at least one completed (non-warmup) set exists
- **THEN** the system proceeds to show the confirmation dialog

### Requirement: Show confirmation dialog
The system SHALL display a confirmation dialog with a session preview before finalizing the workout.

#### Scenario: Confirmation shown
- **WHEN** validation passes and the user taps Finish
- **THEN** the system displays an Alert with title "¿Finalizar entrenamiento?", a preview message showing exercise count and total duration, and two buttons: "Cancelar" and "Finalizar"

#### Scenario: User cancels confirmation
- **WHEN** the user taps "Cancelar" on the confirmation dialog
- **THEN** the system dismisses the dialog and returns the user to the active workout screen with no state changes

### Requirement: Execute finish sequence
The system SHALL execute the finish sequence on user confirmation: calculate duration, detect PRs, persist PRs to SQLite, mark session as completed, clear recovery state, and return a `WorkoutSummary`.

#### Scenario: Successful finish
- **WHEN** the user confirms "Finalizar" on the confirmation dialog
- **THEN** the system calls `activeWorkoutStore.finishWorkout()` which: (a) calculates `ended_at` and `duration_seconds`, (b) calls `detectPRs(session, previousPRs, allHistory)`, (c) saves detected PRs to `personal_records` table, (d) calls `completeSession(sessionId)` to mark the session as completed, (e) clears the MMKV session recovery key, (f) returns a `WorkoutSummary` object

### Requirement: Navigate to summary screen
The system SHALL navigate to the workout summary screen after a successful finish, passing the `WorkoutSummary` data as a route parameter.

#### Scenario: Navigation to summary
- **WHEN** `activeWorkoutStore.finishWorkout()` returns successfully with a `WorkoutSummary`
- **THEN** the system navigates to `/workout/summary` with the summary data serialized as a route parameter and resets the active workout screen from the navigation stack

### Requirement: Handle finish errors gracefully
The system SHALL handle errors during the finish sequence and prevent data loss.

#### Scenario: PR detection or save fails
- **WHEN** an error occurs during PR detection or PR persistence within `finishWorkout()`
- **THEN** the session remains active (not completed), an error alert is shown to the user, and no navigation occurs

#### Scenario: Session completion fails
- **WHEN** `completeSession` fails after PRs have been saved
- **THEN** the system displays an error alert and the session remains in a recoverable state
