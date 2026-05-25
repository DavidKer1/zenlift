## ADDED Requirements

### Requirement: Session CRUD operations
The `WorkoutRepo` SHALL provide methods to create, read, update, and delete workout sessions with parametrized queries.

#### Scenario: Create a new active session
- **WHEN** `createSession({ name: "Push Day", routineId: "r1", routineDayId: "rd1" })` is called
- **THEN** a new `WorkoutSession` is inserted with a UUID id, `status = 'active'`, `started_at` set to the current ISO-8601 timestamp, and the method returns the created `WorkoutSession`

#### Scenario: Create a session without routine
- **WHEN** `createSession({ name: "Freestyle" })` is called with no routineId or routineDayId
- **THEN** a session is created with `routine_id = null` and `routine_day_id = null`

#### Scenario: Get a session by ID
- **WHEN** `getSession("s1")` is called
- **THEN** the matching `WorkoutSession` row is returned, or `null` if no row exists

#### Scenario: Delete a session cascades to exercises and sets
- **WHEN** `deleteSession("s1")` is called
- **THEN** the session, its workout_exercises, and their set_logs are all removed via FK CASCADE

### Requirement: Active session management
The `WorkoutRepo` SHALL return the single active session (status = 'active') and support completing or cancelling it.

#### Scenario: Get active session when one exists
- **WHEN** `getActiveSession()` is called and exactly one session has `status = 'active'`
- **THEN** that `WorkoutSession` is returned

#### Scenario: Get active session when none exists
- **WHEN** `getActiveSession()` is called and no session has `status = 'active'`
- **THEN** `null` is returned

#### Scenario: Complete a session
- **WHEN** `completeSession("s1")` is called
- **THEN** the session's `status` is set to `'completed'`, `ended_at` is set to the current ISO-8601 timestamp, and `duration_seconds` is calculated as the difference between `ended_at` and `started_at` in seconds

#### Scenario: Cancel a session
- **WHEN** `cancelSession("s1")` is called
- **THEN** the session's `status` is set to `'cancelled'` and `ended_at` is set to the current ISO-8601 timestamp

### Requirement: History queries
The `WorkoutRepo` SHALL provide methods to query past workout sessions with optional filters for pagination, date range, and routine.

#### Scenario: Get history with pagination
- **WHEN** `getHistory(10, 0)` is called
- **THEN** up to 10 sessions with `status IN ('completed', 'cancelled')` are returned ordered by `started_at DESC`, excluding active sessions

#### Scenario: Get history by date range
- **WHEN** `getHistoryByDateRange("2026-05-01", "2026-05-31")` is called
- **THEN** only sessions whose `started_at` falls within the range are returned

#### Scenario: Get history by routine
- **WHEN** `getHistoryByRoutine("r1")` is called
- **THEN** only sessions linked to the given routine_id are returned

### Requirement: Full session with nested exercises and sets
The `WorkoutRepo` SHALL return a composed `FullWorkoutSession` read model that includes all exercises, their nested sets, and personal records for the session.

#### Scenario: Get full session with all nested data
- **WHEN** `getFullSession("s1")` is called
- **THEN** the returned object is of type `FullWorkoutSession` containing: the session row, an array of `WorkoutExerciseWithSets` (each with its `Exercise` info and `SetLog[]`), and an array of `PersonalRecord[]` for the session

#### Scenario: Get full session for non-existent session
- **WHEN** `getFullSession("nonexistent")` is called
- **THEN** `null` is returned

### Requirement: Exercise management within sessions
The `WorkoutRepo` SHALL provide methods to add exercises to a session, remove them (with cascade to sets), and query them ordered by sort_order.

#### Scenario: Add exercise to a session
- **WHEN** `addExercise("s1", "ex1")` is called
- **THEN** a new `WorkoutExercise` is inserted with a UUID id, `sort_order = next available`, and the method returns the created `WorkoutExercise`

#### Scenario: Get exercises for a session
- **WHEN** `getExercises("s1")` is called
- **THEN** all `WorkoutExercise` rows for the session are returned ordered by `sort_order ASC`

#### Scenario: Remove exercise from a session
- **WHEN** `removeExercise("we1")` is called
- **THEN** the workout exercise and all its set_logs are deleted via FK CASCADE

### Requirement: Previous performance queries
The `WorkoutRepo` SHALL provide queries to look up a user's prior performance on a given exercise across completed sessions.

#### Scenario: Get previous performance data
- **WHEN** `getPreviousPerformance("ex1", 5)` is called
- **THEN** rows containing `started_at`, `weight`, `reps`, and `set_type` from the last 5 completed sets of the exercise across all prior sessions are returned, ordered by `started_at DESC`

#### Scenario: Get last workout exercise data for auto-fill
- **WHEN** `getLastWorkoutExerciseData("ex1")` is called
- **THEN** a single row with `weight` and `reps` from the most recent completed set for that exercise is returned, or `null` if no prior data exists

### Requirement: Set logging operations
The `WorkoutRepo` SHALL provide methods to add, complete, update, and delete sets within a workout exercise.

#### Scenario: Add a set to an exercise
- **WHEN** `addSet("we1", { weight: 80, reps: 10, set_type: 'normal' })` is called
- **THEN** a new `SetLog` is inserted with a UUID id, `set_number = next available`, `is_completed = 0`, and returns the created `SetLog`

#### Scenario: Complete a set
- **WHEN** `completeSet("sl1")` is called
- **THEN** the set's `is_completed` is set to 1 and `completed_at` is set to the current ISO-8601 timestamp

#### Scenario: Update set data
- **WHEN** `updateSet("sl1", { weight: 85, reps: 8 })` is called
- **THEN** the set's `weight` and `reps` are updated in the database

#### Scenario: Delete a set
- **WHEN** `deleteSet("sl1")` is called
- **THEN** the set_log row is removed from the database

#### Scenario: Get sets for a workout exercise
- **WHEN** `getSets("we1")` is called
- **THEN** all `SetLog` rows for the exercise are returned ordered by `set_number ASC`

### Requirement: Personal record persistence
The `WorkoutRepo` SHALL provide methods to insert and query personal records by exercise, session, or recency.

#### Scenario: Add a personal record
- **WHEN** `addPR({ exerciseId: "ex1", workoutSessionId: "s1", type: "max_weight", value: 100, weight: 100, reps: 1 })` is called
- **THEN** a new `PersonalRecord` is inserted with a UUID id and `achieved_at` set to the current ISO-8601 timestamp, and the method returns the created `PersonalRecord`

#### Scenario: Get PRs by exercise
- **WHEN** `getPRsByExercise("ex1")` is called
- **THEN** all `PersonalRecord` rows for the exercise are returned ordered by `achieved_at DESC`

#### Scenario: Get latest PRs across all exercises
- **WHEN** `getLatestPRs(10)` is called
- **THEN** up to 10 most recent `PersonalRecord` rows across all exercises are returned

#### Scenario: Get PRs achieved in a specific session
- **WHEN** `getPRsBySession("s1")` is called
- **THEN** all `PersonalRecord` rows linked to the session are returned

### Requirement: App settings persistence
The `WorkoutRepo` SHALL provide key-value storage for app settings backed by the `app_settings` table.

#### Scenario: Get a setting
- **WHEN** `getSetting("weight_unit")` is called
- **THEN** the value for the key is returned, or `null` if the key does not exist

#### Scenario: Set a setting
- **WHEN** `setSetting("weight_unit", "kg")` is called
- **THEN** the key-value pair is inserted or updated in the `app_settings` table

#### Scenario: Delete a setting
- **WHEN** `deleteSetting("old_key")` is called
- **THEN** the row for the key is removed from `app_settings`

### Requirement: Parametrized queries and error handling
All SQL queries in `WorkoutRepo` SHALL use parametrized queries. Errors SHALL be caught, wrapped, and re-thrown with context.

#### Scenario: Parametrized query for session creation
- **WHEN** a session is created with user-provided name
- **THEN** the name value is passed as a SQL parameter, never concatenated into the SQL string

#### Scenario: Database error is surfaced
- **WHEN** a SQL operation fails (e.g., FK violation on addExercise with invalid sessionId)
- **THEN** the error is caught and re-thrown with a message identifying the operation and the relevant IDs
