## MODIFIED Requirements

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

### Requirement: Duplicate routine creates deep copy with new UUIDs

The system SHALL duplicate a routine including all its days and exercises with new UUIDs for every row via `RoutineRepo.duplicate()`.

#### Scenario: Duplicate routine
- **WHEN** the user taps the duplicate button
- **THEN** `RoutineRepo.duplicate(id, "Copy of <original_name>")` is called, the screen shows a success confirmation, and the user stays on the original routine's detail view

#### Scenario: Duplicate preserves exercise configuration
- **WHEN** a routine is duplicated and the original has exercises with `target_sets`, `target_reps_min`, `target_reps_max`, and `sort_order`
- **THEN** the duplicated routine has identical configuration values with all new UUIDs

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
