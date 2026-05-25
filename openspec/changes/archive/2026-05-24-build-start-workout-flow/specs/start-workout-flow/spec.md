# Start Workout Flow

Purpose: Specification for the centralized StartWorkoutFlow module that orchestrates workout initiation from routine days or as Quick/empty sessions.

## ADDED Requirements

### Requirement: StartWorkoutFlow checks for existing active session

The system SHALL check for an existing active workout session via `WorkoutRepo.getActiveSession()` before starting a new workout.

#### Scenario: No active session exists
- **WHEN** `StartWorkoutFlow.start(routineId?, routineDayId?)` is called and no active session exists
- **THEN** the system calls `activeWorkoutStore.startWorkout(routineId?, routineDayId?)` and navigates to `/workout/active`

#### Scenario: Active session exists
- **WHEN** `StartWorkoutFlow.start(routineId?, routineDayId?)` is called and an active session exists
- **THEN** the system displays an Alert with the options "Continuar" and "Nueva sesión"

#### Scenario: User chooses to continue active session
- **WHEN** the user selects "Continuar" on the active session alert
- **THEN** the system navigates to `/workout/active` without creating a new session

#### Scenario: User chooses new session
- **WHEN** the user selects "Nueva sesión" on the active session alert
- **THEN** the system calls `activeWorkoutStore.cancelWorkout()`, then calls `activeWorkoutStore.startWorkout(routineId?, routineDayId?)`, and navigates to `/workout/active`

### Requirement: StartWorkoutFlow supports routine-based start

The system SHALL start a workout pre-populated with exercises when `routineId` and `routineDayId` are provided.

#### Scenario: Start workout from routine day
- **WHEN** `StartWorkoutFlow.start(routineId, routineDayId)` is called with valid routine and day IDs
- **THEN** the system calls `activeWorkoutStore.startWorkout(routineId, routineDayId)` which loads the day's exercises into the active session

### Requirement: StartWorkoutFlow supports Quick start

The system SHALL start an empty workout when called without `routineId`.

#### Scenario: Quick workout start
- **WHEN** `StartWorkoutFlow.start()` is called with no arguments
- **THEN** the system calls `activeWorkoutStore.startWorkout()` which creates an active session with no pre-loaded exercises

#### Scenario: Quick workout with only routineId
- **WHEN** `StartWorkoutFlow.start(routineId)` is called with a routine ID but no day ID
- **THEN** the system calls `activeWorkoutStore.startWorkout(routineId)` which creates an active session linked to the routine but with no pre-loaded exercises

### Requirement: StartWorkoutFlow handles errors gracefully

The system SHALL catch and report errors during the start flow.

#### Scenario: Repository error during session check
- **WHEN** `WorkoutRepo.getActiveSession()` throws an error
- **THEN** the system logs the error and shows an Alert with a user-friendly error message

#### Scenario: Store error during startWorkout
- **WHEN** `activeWorkoutStore.startWorkout()` throws an error
- **THEN** the system logs the error and shows an Alert with a user-friendly error message without navigating

### Requirement: StartWorkoutFlow navigates to active workout screen on success

The system SHALL navigate to `/workout/active` after successfully starting or recovering a workout session.

#### Scenario: Navigation after workout start
- **WHEN** a workout session is successfully started or the user chooses to continue an existing one
- **THEN** the router navigates to `/workout/active`

#### Scenario: Navigation does not occur on error
- **WHEN** an error occurs during session creation
- **THEN** the router does NOT navigate to `/workout/active`
