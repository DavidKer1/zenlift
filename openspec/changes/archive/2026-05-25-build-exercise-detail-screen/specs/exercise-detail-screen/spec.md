# exercise-detail-screen Specification

## Purpose
Specification for the Exercise Detail screen that displays exercise information, performance metrics, history, progress chart, and personal records.

## ADDED Requirements

### Requirement: Exercise Detail loads exercise data by ID
The system SHALL load an exercise and its associated muscle groups from SQLite when navigating to the exercise detail screen with a valid exercise ID parameter.

#### Scenario: Exercise found
- **WHEN** the screen mounts with a valid exercise ID in the route params
- **THEN** the system fetches the exercise via `ExerciseRepo.getById(id)` and its muscles via `ExerciseRepo.getMuscles(id)`
- **THEN** the exercise name, equipment, category, and muscle badges are displayed in the header

#### Scenario: Exercise not found
- **WHEN** the screen mounts with an exercise ID that does not exist in the database
- **THEN** the system displays an error state with a message indicating the exercise was not found
- **THEN** a back navigation option is available

### Requirement: Muscle badges display with correct colors
The system SHALL display muscle group badges in the exercise header with colors defined in `src/theme/muscleColors.ts`.

#### Scenario: Exercise with multiple muscles
- **WHEN** an exercise has primary and secondary muscle groups
- **THEN** each muscle is rendered as a colored pill/badge using the color from `muscleColors`
- **THEN** the primary muscle badge is visually distinguished from secondary muscles

#### Scenario: Exercise with only primary muscle
- **WHEN** an exercise has only one primary muscle group and no secondary muscles
- **THEN** a single muscle badge is displayed with the correct color from `muscleColors`

### Requirement: Best Performance Card shows real aggregated data
The system SHALL display a Best Performance card with three metrics: maximum weight lifted, best estimated 1RM (Epley formula), and maximum session volume for the exercise.

#### Scenario: Exercise with prior completed sets
- **WHEN** the exercise has completed sets in the workout history
- **THEN** the Best Performance card displays the maximum weight ever lifted for this exercise
- **THEN** the card displays the best estimated 1RM calculated using the Epley formula across all completed non-warmup sets
- **THEN** the card displays the maximum session volume (sum of set volumes in a single session)
- **THEN** each metric shows its numeric value and unit (kg/lb)

#### Scenario: Exercise with no prior data
- **WHEN** the exercise has no completed sets in the workout history
- **THEN** the Best Performance card displays placeholder values (0 or "--") for all three metrics

### Requirement: Recent History shows last 5 uses
The system SHALL display a list of the last 5 workout sessions where this exercise was used.

#### Scenario: Exercise used in 5 or more sessions
- **WHEN** the exercise has been used in 5 or more completed sessions
- **THEN** the Recent History section shows the 5 most recent sessions
- **THEN** each item displays the session date/name, number of sets completed for this exercise, and total volume

#### Scenario: Exercise used in fewer than 5 sessions
- **WHEN** the exercise has been used in fewer than 5 sessions
- **THEN** the Recent History section shows all available sessions

#### Scenario: Exercise never used
- **WHEN** the exercise has never been used in any session
- **THEN** the Recent History section displays an empty state message "Sin historial de uso"

### Requirement: Progress Chart renders data from last 10 sessions
The system SHALL render a VictoryLine chart showing the exercise's volume progression over the last 10 completed sessions.

#### Scenario: Exercise has 10 or more sessions of data
- **WHEN** the exercise has data from 10 or more completed sessions
- **THEN** the Progress Chart renders a VictoryLine with data points for the 10 most recent sessions
- **THEN** the chart X-axis shows session dates and Y-axis shows volume or estimated 1RM values

#### Scenario: Exercise has fewer than 10 sessions
- **WHEN** the exercise has data from fewer than 10 sessions
- **THEN** the Progress Chart renders with all available data points

#### Scenario: Exercise has no session data
- **WHEN** the exercise has never been used in any session
- **THEN** the Progress Chart section displays an empty state message "Sin datos para mostrar"

### Requirement: All PRs list is displayed
The system SHALL display all personal records for the exercise retrieved from the `personal_records` table.

#### Scenario: Exercise has PRs
- **WHEN** the exercise has one or more personal records in the database
- **THEN** the PRs section lists all PRs ordered by achievement date descending
- **THEN** each PR shows its type (max_weight, max_volume, max_reps, estimated_1rm, max_session_volume), value, and achievement date

#### Scenario: Exercise has no PRs
- **WHEN** the exercise has no personal records
- **THEN** the PRs section displays an empty state message "Sin records personales"

### Requirement: Edit and Delete actions visible only for custom exercises
The system SHALL show Edit and Delete action buttons only when the exercise's `is_custom` field equals 1.

#### Scenario: Custom exercise
- **WHEN** the loaded exercise has `is_custom === 1`
- **THEN** Edit and Delete buttons are visible in the screen header or action area
- **THEN** Edit navigates to the exercise edit form
- **THEN** Delete prompts for confirmation before calling `ExerciseRepo.delete(id)` and navigating back

#### Scenario: Seed exercise
- **WHEN** the loaded exercise has `is_custom === 0`
- **THEN** Edit and Delete buttons are NOT rendered

### Requirement: Start Quick Workout creates a session with this exercise
The system SHALL provide a "Quick Workout" action that creates a new active workout session with this exercise and navigates to the active workout screen.

#### Scenario: No active session exists
- **WHEN** the user taps "Iniciar entrenamiento rápido" and no active session exists
- **THEN** the system creates a new `WorkoutSession` with status "active" via `WorkoutRepo.createSession()`
- **THEN** the system adds this exercise to the session via `WorkoutRepo.addExercise()`
- **THEN** the system navigates to the active workout screen

#### Scenario: Active session already exists
- **WHEN** the user taps "Iniciar entrenamiento rápido" and an active session already exists
- **THEN** the system displays a confirmation dialog asking whether to add the exercise to the existing session or start a new one
