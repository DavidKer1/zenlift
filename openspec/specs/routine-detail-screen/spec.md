# Routine Detail Screen

## Purpose

Specification for the Routine Detail screen, showing routine days, exercises, and providing duplicate, archive, delete, reorder, and start workout actions.

## Requirements

### Requirement: Routine detail screen loads full routine by ID

The system SHALL load a complete routine tree (routine, days, exercises with exercise data) when navigating to `/routine/[id]` by calling `RoutineRepo.getFullRoutine(id)`.

#### Scenario: Routine exists with days and exercises
- **WHEN** the user navigates to `/routine/[id]` with a valid routine ID that has days and exercises
- **THEN** the screen displays the routine name, description, all days in `sort_order` order, and all exercises per day in `sort_order` order with exercise name, target sets, and target reps range

#### Scenario: Routine does not exist
- **WHEN** the user navigates to `/routine/[id]` with a non-existent ID
- **THEN** the screen displays an error state and allows navigation back to the routines list

#### Scenario: Data loading in progress
- **WHEN** the routine data is being fetched from the database
- **THEN** the screen displays a loading indicator

### Requirement: Routine header shows name and action buttons

The system SHALL display the routine name, optional description, and action buttons (edit name, duplicate, archive, delete) at the top of the detail screen.

#### Scenario: Header with complete action set
- **WHEN** a routine is loaded successfully
- **THEN** the header displays the routine name, description (if present), and all four action buttons

#### Scenario: Routine has no description
- **WHEN** the routine has a null or empty description
- **THEN** the description area is not rendered

### Requirement: Inline edit routine name

The system SHALL allow editing the routine name by tapping the name in the header, entering a new value, and saving via `RoutineRepo.update()`.

#### Scenario: Edit routine name
- **WHEN** the user taps the routine name, types a new name, and submits
- **THEN** `RoutineRepo.update(id, { name })` is called and the displayed name updates optimistically

#### Scenario: Cancel name edit
- **WHEN** the user taps the routine name to enter edit mode, then dismisses without saving
- **THEN** the original name is preserved and no repository call is made

### Requirement: Duplicate routine creates deep copy with new UUIDs

The system SHALL duplicate a routine including all its days and exercises with new UUIDs for every row via `RoutineRepo.duplicate()`.

#### Scenario: Duplicate routine
- **WHEN** the user taps the duplicate button
- **THEN** `RoutineRepo.duplicate(id, "Copy of <original_name>")` is called, the screen shows a success confirmation, and the user stays on the original routine's detail view

#### Scenario: Duplicate preserves exercise configuration
- **WHEN** a routine is duplicated and the original has exercises with `target_sets`, `target_reps_min`, `target_reps_max`, and `sort_order`
- **THEN** the duplicated routine has identical configuration values with all new UUIDs

### Requirement: Archive routine returns to list

The system SHALL archive a routine via `RoutineRepo.archive()` and navigate back to the routines list.

#### Scenario: Archive active routine
- **WHEN** the user taps the archive button
- **THEN** `RoutineRepo.archive(id)` is called and the screen navigates back to `/routines`

### Requirement: Delete routine with confirmation

The system SHALL prompt for confirmation before deleting a routine and cascade-delete all child data.

#### Scenario: Confirm delete
- **WHEN** the user taps delete and confirms in the alert dialog
- **THEN** `RoutineRepo.delete(id)` is called and the screen navigates back to `/routines`

#### Scenario: Cancel delete
- **WHEN** the user taps delete but cancels the confirmation dialog
- **THEN** no repository call is made and the user remains on the detail screen

### Requirement: Day sections display exercises with targets

The system SHALL render each routine day as a section containing its name and a list of exercise rows showing name, target sets, and target reps.

#### Scenario: Day with exercises
- **WHEN** a routine has a day named "Day 1" with two exercises
- **THEN** the screen renders a "Day 1" section header with two exercise rows below it

#### Scenario: Day with no exercises
- **WHEN** a routine day has no exercises
- **THEN** the day section renders a message indicating no exercises have been added and shows an add-exercise button

### Requirement: Exercise row displays exercise details and primary muscle

The system SHALL render each exercise as a row showing the exercise name, a colored dot for the primary muscle group, and target sets x reps range.

#### Scenario: Exercise with all targets set
- **WHEN** a routine exercise has `target_sets = 4`, `target_reps_min = 8`, and `target_reps_max = 12`
- **THEN** the exercise row displays "4 sets", "8-12 reps", and a colored dot matching the exercise's primary muscle group color from `muscleColors`

#### Scenario: Exercise with partial targets
- **WHEN** a routine exercise only has `target_sets = 3` and no rep range configured
- **THEN** the exercise row displays "3 sets" with no rep range shown

### Requirement: Remove exercise from a day

The system SHALL allow removing an exercise from a routine day via `RoutineRepo.deleteExercise()`.

#### Scenario: Remove exercise
- **WHEN** the user taps the remove button on an exercise row
- **THEN** `RoutineRepo.deleteExercise(exerciseId)` is called and the exercise is removed from the displayed list

### Requirement: Reorder exercises within a day

The system SHALL allow reordering exercises by moving them up or down within a day, committing the new order via `RoutineRepo.reorderExercises()`.

#### Scenario: Move exercise up
- **WHEN** the user taps the move-up button on the second exercise in a day
- **THEN** the exercise swaps positions with the first exercise and `RoutineRepo.reorderExercises(dayId, reordered_ids)` persists the new order

#### Scenario: Move exercise down
- **WHEN** the user taps the move-down button on the first exercise in a day
- **THEN** the exercise swaps positions with the second exercise and the new order is persisted

#### Scenario: First exercise cannot move up
- **WHEN** the first exercise in a day is displayed
- **THEN** the move-up button is disabled or hidden

#### Scenario: Last exercise cannot move down
- **WHEN** the last exercise in a day is displayed
- **THEN** the move-down button is disabled or hidden

### Requirement: Start workout from a specific day

The system SHALL create a new active workout session populated with the exercises from a specific routine day.

#### Scenario: Start workout from day
- **WHEN** the user taps "Start Workout" on a day with 3 exercises
- **THEN** a new `WorkoutSession` is created with `status = 'active'`, `routine_id` and `routine_day_id` set to the current routine and day, and all 3 exercises are added to the session via `WorkoutRepo.addExercise()`. The user is navigated to the active workout screen.

#### Scenario: Start workout from empty day
- **WHEN** the user taps "Start Workout" on a day with no exercises
- **THEN** the session is still created with the routine and day references, and the user is navigated to the active workout screen with an empty exercise list

### Requirement: Screen is thin with no heavy business logic

The system SHALL keep the Flutter route/screen file `lib/app/routine_detail_route.dart` free of business logic; domain calculations and data operations SHALL be delegated to repositories and services.

#### Scenario: Route file composition
- **WHEN** inspecting `lib/app/routine_detail_route.dart`
- **THEN** it contains only UI rendering, navigation, and calls to repository methods; no volume calculations, PR detection, or complex state transformations
