## ADDED Requirements

### Requirement: Active Workout Screen renders workout in progress
The system SHALL render the active workout screen with a fixed header (routine/day name, elapsed timer MM:SS, cancel button), a scrollable list of exercise cards with set rows, and a fixed bottom bar (add exercise, finish workout).

#### Scenario: Screen mounts with active session
- **WHEN** user navigates to `/workout/active` with an active workout session
- **THEN** the screen SHALL call `activeWorkoutStore.recoverSession()`
- **THEN** the header SHALL display the routine/day name and elapsed time
- **THEN** the exercise list SHALL render each exercise as a collapsible `WorkoutExerciseCard`
- **THEN** the bottom bar SHALL show "Add Exercise" and "Finish Workout" buttons

#### Scenario: Screen mounts with no active session
- **WHEN** user navigates to `/workout/active` with no active session
- **THEN** the screen SHALL redirect to the home screen (`/`)

### Requirement: Workout header shows timer and cancel
The system SHALL display a fixed header with the session name, an elapsed duration timer in MM:SS format, and a cancel button with confirmation dialog.

#### Scenario: Timer updates every second
- **WHEN** the workout session is active
- **THEN** the header SHALL display elapsed time in MM:SS format
- **THEN** the timer SHALL update every second using the store's `elapsedSeconds` value

#### Scenario: Cancel with confirmation
- **WHEN** user taps the cancel button
- **THEN** the system SHALL show an `Alert.alert` with "Cancelar entrenamiento?"
- **THEN** two options SHALL be presented: "Seguir entrenando" and "Cancelar"
- **WHEN** user selects "Cancelar"
- **THEN** the system SHALL call `activeWorkoutStore.cancelWorkout()` and navigate to `/`

### Requirement: SetRow allows fast set logging
The system SHALL provide a SetRow component that allows users to log a set in under 3 seconds with weight input, reps input, stepper buttons, and a check button with haptic feedback.

#### Scenario: SetRow pre-fills with previous values
- **WHEN** a SetRow renders for an exercise with previous session data
- **THEN** the weight input SHALL be pre-filled with the last used weight
- **THEN** the reps input SHALL be pre-filled with the last used reps

#### Scenario: Stepper buttons adjust weight
- **WHEN** user taps `-` weight button
- **THEN** the weight value SHALL decrease by 2.5 (kg) or 5 (lb) based on settings
- **WHEN** user taps `+` weight button
- **THEN** the weight value SHALL increase by 2.5 (kg) or 5 (lb) based on settings

#### Scenario: Complete set with check button
- **WHEN** user enters weight and reps and taps the check button
- **THEN** the system SHALL call `activeWorkoutStore.completeSet(exerciseId, setId)`
- **THEN** the system SHALL trigger haptic feedback via `expo-haptics`
- **THEN** the check button SHALL render in success color (green) to indicate completion
- **THEN** the set data SHALL be persisted to SQLite within 100ms
- **THEN** the total operation SHALL complete in under 3 seconds

#### Scenario: SetRow minimum touch targets
- **WHEN** SetRow is rendered
- **THEN** each interactive element SHALL have a minimum height of 48px
- **THEN** the row height SHALL be at least 56px
- **THEN** weight and reps inputs SHALL use `keyboardType="numeric"`
- **THEN** reps input SHALL use `returnKeyType="done"` to dismiss keyboard

### Requirement: Exercise card shows exercise context
The system SHALL render each exercise as a collapsible card displaying the exercise name with muscle group indicator, target sets/reps from the routine, previous performance data, and a list of SetRows.

#### Scenario: Card displays exercise details
- **WHEN** a WorkoutExerciseCard renders
- **THEN** the card SHALL display the exercise name and muscle group dot(s)
- **THEN** the card SHALL display target sets/reps from the routine if applicable
- **THEN** the card SHALL display previous session performance (e.g., "60kg x 10")

#### Scenario: Card expands on tap
- **WHEN** user taps a collapsed exercise card
- **THEN** the card SHALL expand to show its SetRow list
- **THEN** any previously expanded card SHALL collapse
- **THEN** only one exercise SHALL be expanded at a time

#### Scenario: Add set to exercise
- **WHEN** user taps "Add Set" at the bottom of an expanded card
- **THEN** the system SHALL call `activeWorkoutStore.addSet(exerciseId, {weight, reps})`
- **THEN** a new SetRow SHALL appear in the expanded card

### Requirement: Performance meets targets
The system SHALL maintain 60fps scrolling, sub-100ms SQLite persistence, and sub-3s set logging on mid-range Android devices.

#### Scenario: FlashList renders efficiently
- **WHEN** the exercise list contains multiple exercises with sets
- **THEN** the screen SHALL use FlashList with `estimatedItemSize`
- **THEN** scrolling SHALL maintain 60fps
- **THEN** SetRow components SHALL use React.memo
- **THEN** exercise card components SHALL use React.memo
- **THEN** set handlers SHALL use useCallback

#### Scenario: Auto-scroll to current exercise
- **WHEN** user completes a set on the current exercise
- **THEN** the list SHALL auto-scroll to the next exercise if available
- **THEN** the next exercise card SHALL expand automatically

### Requirement: Add exercise from library
The system SHALL allow users to add exercises to the active workout session from the exercise library using the existing ExercisePicker component.

#### Scenario: Add exercise flow
- **WHEN** user taps "Add Exercise" in the bottom bar
- **THEN** the ExercisePicker modal SHALL open
- **WHEN** user selects an exercise from the library
- **THEN** the system SHALL call `activeWorkoutStore.addExercise(exerciseId)`
- **THEN** the exercise SHALL appear in the workout list

### Requirement: Finish workout triggers summary flow
The system SHALL provide a "Finish Workout" button in the bottom bar that navigates to the finish workout confirmation and summary flow.

#### Scenario: Finish button navigates
- **WHEN** user taps "Finish Workout"
- **THEN** the system SHALL navigate to the finish workout flow defined in `build-finish-workout-summary`
