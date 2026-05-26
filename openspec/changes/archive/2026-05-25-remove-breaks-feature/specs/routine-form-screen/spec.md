## MODIFIED Requirements

### Requirement: Exercise management within a day
The system SHALL allow users to add, remove, and reorder exercises within each day.

#### Scenario: Add exercise from library
- **WHEN** user taps "Agregar ejercicio" on a day card
- **THEN** an exercise picker (search/filter from exercise library) is displayed
- **AND** when user selects an exercise, an exercise configurator modal opens for that exercise

#### Scenario: Configure exercise targets
- **WHEN** the exercise configurator modal opens for a selected exercise
- **THEN** the user can set target sets (numeric, >=1), target reps min (numeric, >=1), and target reps max (numeric, >=1)
- **AND** the exercise name is displayed at the top of the modal
- **AND** the modal SHALL NOT include rest, break, or descanso inputs

#### Scenario: Remove an exercise
- **WHEN** user taps the remove button on an exercise within a day
- **THEN** that exercise is removed from the day's exercise list

#### Scenario: Reorder exercises within a day
- **WHEN** user taps up/down reorder buttons on an exercise
- **THEN** the exercise moves one position up or down within its day's list
- **AND** the first exercise's "move up" button is disabled
- **AND** the last exercise's "move down" button is disabled

### Requirement: Transactional save for new routines
The system SHALL save a new routine with all its days and exercises atomically within a single database transaction.

#### Scenario: Create routine saves all nested data
- **WHEN** user submits a valid create form with name, 2 days, and 3 exercises across those days
- **THEN** a new routine row is inserted with a generated UUID
- **AND** each day row is inserted with a generated UUID referencing the routine
- **AND** each exercise row is inserted with a generated UUID referencing its day
- **AND** all inserts complete within a single transaction (atomic)

#### Scenario: Create routine with only required fields
- **WHEN** user submits a valid form with only name and 1 day with 1 exercise (no optional fields)
- **THEN** the routine is created with `description=null`, `goal=null`, and exercises with `targetRepsMin=null` and `targetRepsMax=null`
