## ADDED Requirements

### Requirement: Workout session startup

The store SHALL create a new active workout session in SQLite, persist the session ID to MMKV, and load the full session state including exercises and previous performance data.

#### Scenario: Start workout with routine

- **WHEN** `startWorkout({ routineId: "r1", routineDayId: "rd1", name: "Push Day" })` is called
- **THEN** a new `WorkoutSession` is created in SQLite via `WorkoutRepo.createSession` with `status = 'active'` and the session ID is persisted to MMKV under `zenlift.workout.session_id`

#### Scenario: Start freestyle workout without routine

- **WHEN** `startWorkout({ name: "Freestyle" })` is called with no routineId or routineDayId
- **THEN** a session is created with `routine_id = null` and `routine_day_id = null`

#### Scenario: Start workout when active session already exists

- **WHEN** `startWorkout(...)` is called and an active session already exists (detected via `getActiveSession` or MMKV)
- **THEN** the existing session is returned and a new session is NOT created

#### Scenario: Start workout loads previous performance

- **WHEN** a workout is started and exercises are added
- **THEN** `WorkoutRepo.getPreviousPerformance` is called for each exercise to load historical set data

### Requirement: Set logging operations with SQLite persistence

The store SHALL add, complete, update, and delete sets with immediate SQLite persistence and local state synchronization.

#### Scenario: Add a new set

- **WHEN** `addSet("we1", { weight: 80, reps: 10, setType: "normal" })` is called
- **THEN** the set is inserted in SQLite via `WorkoutRepo.addSet` with `is_completed = 0`, and the store's `exercises` state is updated to include the new set

#### Scenario: Complete a set

- **WHEN** `completeSet("we1", "sl1")` is called
- **THEN** `WorkoutRepo.completeSet` marks the set as completed, the store updates `is_completed = 1` on the set in local state, haptic feedback is triggered via expo-haptics, and the rest timer is started if a default rest duration is configured

#### Scenario: Update an existing set

- **WHEN** `updateSet("sl1", { weight: 85, reps: 8 })` is called
- **THEN** the set is updated in SQLite via `WorkoutRepo.updateSet` and the store's local state reflects the new weight and reps

#### Scenario: Delete a set

- **WHEN** `deleteSet("sl1")` is called
- **THEN** the set is removed from SQLite via `WorkoutRepo.deleteSet` and removed from the store's local state

#### Scenario: Set operations fail on invalid data

- **WHEN** any set operation is called with invalid data (e.g., negative weight)
- **THEN** the SQLite operation fails, the error is thrown from the action, and local state remains unchanged

### Requirement: Exercise management within active session

The store SHALL support adding, removing, and reordering exercises within the active workout session.

#### Scenario: Add exercise to session

- **WHEN** `addExercise("ex1")` is called and an active session exists
- **THEN** the exercise is added to the session in SQLite via `WorkoutRepo.addExercise` and the store's `exercises` state includes the new `WorkoutExerciseWithSets`

#### Scenario: Remove exercise from session

- **WHEN** `removeExercise("we1")` is called
- **THEN** the exercise and all its sets are removed from SQLite via `WorkoutRepo.removeExercise` (FK CASCADE) and removed from the store's `exercises` state

#### Scenario: Reorder exercises

- **WHEN** `reorderExercises(["we3", "we1", "we2"])` is called
- **THEN** the exercises in the store's `exercises` state are reordered to match the provided ID order, and the new order is persisted to SQLite

### Requirement: Workout completion with validation and PR detection

The store SHALL validate that at least one set is completed, calculate duration, run PR detection, complete the session in SQLite, and clear MMKV state.

#### Scenario: Complete workout successfully

- **WHEN** `finishWorkout()` is called and at least one set across all exercises has `is_completed = true`
- **THEN** the session duration is calculated, `detectPRs` is called with the full session data, detected PRs are inserted via `WorkoutRepo.addPR`, the session is marked completed in SQLite via `WorkoutRepo.completeSession`, the MMKV session ID and timer are cleared, and a `WorkoutSummary` is returned

#### Scenario: Finish workout with no completed sets

- **WHEN** `finishWorkout()` is called and no sets are completed
- **THEN** an error is thrown indicating that at least one completed set is required, and the session remains active

#### Scenario: Finish workout with no active session

- **WHEN** `finishWorkout()` is called and no active session exists
- **THEN** an error is thrown

### Requirement: Workout cancellation

The store SHALL cancel the active session in SQLite, clear all state, and remove the MMKV session ID.

#### Scenario: Cancel active workout

- **WHEN** `cancelWorkout()` is called and an active session exists
- **THEN** the session is cancelled in SQLite via `WorkoutRepo.cancelSession`, the store state is reset to null/empty, and the MMKV session ID is removed

#### Scenario: Cancel with no active session

- **WHEN** `cancelWorkout()` is called and no active session exists
- **THEN** no operation is performed and no error is thrown

### Requirement: Session recovery from MMKV

The store SHALL recover the active session state on app startup by reading the session ID from MMKV and reconstructing the full state from SQLite.

#### Scenario: Recover existing active session

- **WHEN** `recoverSession()` is called and a session ID exists in MMKV under `zenlift.workout.session_id`
- **THEN** the full session is loaded from SQLite via `WorkoutRepo.getFullSession`, the store's `session` and `exercises` state are populated, and previous performance data is loaded

#### Scenario: No session to recover

- **WHEN** `recoverSession()` is called and no session ID exists in MMKV
- **THEN** the store state remains null/empty and no error is thrown

#### Scenario: Session ID exists but session is no longer in SQLite

- **WHEN** `recoverSession()` is called and the session ID in MMKV does not match any session in SQLite
- **THEN** the MMKV session ID is cleared and the store state remains null/empty

### Requirement: Rest timer management with MMKV persistence

The store SHALL manage a rest timer that persists its target end time to MMKV so the timer survives app backgrounding.

#### Scenario: Start rest timer

- **WHEN** `startTimer(90)` is called
- **THEN** `timerTargetEnd` is set to `Date.now() + 90000` in store state, the value is persisted to MMKV under `zenlift.workout.timer_target`, and `isResting` is set to `true`

#### Scenario: Get remaining time

- **WHEN** `getTimerRemaining()` is called and the timer is active
- **THEN** the remaining seconds until `timerTargetEnd` are returned (minimum 0)

#### Scenario: Skip rest timer

- **WHEN** `skipTimer()` is called
- **THEN** `timerTargetEnd` is set to `null`, the MMKV key is removed, and `isResting` is set to `false`

#### Scenario: Timer expires naturally

- **WHEN** `Date.now()` exceeds `timerTargetEnd`
- **THEN** `getTimerRemaining()` returns `0` and the store sets `isResting` to `false`
