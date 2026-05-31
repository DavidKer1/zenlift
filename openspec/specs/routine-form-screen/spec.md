# routine-form-screen Specification

## Purpose
Defines the behavior of the Routine Create/Edit form screen, which allows users to define workout templates with days, exercises, and target configuration.

## Requirements

### Requirement: Create route renders empty form
The system SHALL render a routine creation form through `lib/app/routine_editor_route.dart` and `lib/features/routines/presentation/routine_editor_screen.dart` with all fields empty and default values.

#### Scenario: Create screen loads with empty defaults
- **WHEN** user navigates to `/routine/create`
- **THEN** a form is displayed with empty name, empty description, no goal selected, and zero days configured
- **AND** the submit button label reads "Crear rutina"

### Requirement: Edit route loads existing routine data
The system SHALL render a routine edit form through `lib/app/routine_editor_route.dart` and `lib/features/routines/presentation/routine_editor_screen.dart` pre-populated with the existing routine's data.

#### Scenario: Edit screen loads with routine data
- **WHEN** user navigates to `/routine/edit/<valid-id>`
- **THEN** the form is displayed with the routine's name, description, goal, days, and exercises pre-populated
- **AND** the submit button label reads "Guardar cambios"
- **AND** all existing UUIDs are preserved in the form state

#### Scenario: Edit screen with non-existent ID
- **WHEN** user navigates to `/routine/edit/<non-existent-id>`
- **THEN** an error state is displayed indicating the routine was not found
- **AND** a button to go back to routines list is shown

### Requirement: Form validation
The system SHALL validate the form before submission.

#### Scenario: Name is required
- **WHEN** user submits the form with an empty name
- **THEN** a validation error "El nombre es obligatorio" is displayed

#### Scenario: At least one day required
- **WHEN** user submits the form with zero days
- **THEN** a validation error "La rutina necesita al menos 1 día" is displayed

#### Scenario: At least one exercise per day
- **WHEN** user submits the form with a day that has zero exercises
- **THEN** a validation error "Cada día necesita al menos 1 ejercicio" is displayed

#### Scenario: Target sets must be at least 1
- **WHEN** user submits the form with an exercise where targetSets is 0 or less
- **THEN** a validation error "Mínimo 1 serie" is displayed

#### Scenario: Valid form passes validation
- **WHEN** user submits the form with name "Push Day", 1 day with name "Día 1", 1 exercise with targetSets=3
- **THEN** validation passes and the save operation begins

### Requirement: Dynamic day management
The system SHALL allow users to add, remove, and reorder days within the routine form.

#### Scenario: Add a new day
- **WHEN** user taps "Agregar día"
- **THEN** a new day card is appended to the days list with a default name "Día N" (where N is the count)
- **AND** the new day contains zero exercises

#### Scenario: Remove a day
- **WHEN** user taps the remove button on a day card
- **THEN** that day and all its exercises are removed from the form
- **AND** if only one day remains, the remove button is disabled

#### Scenario: Reorder days up
- **WHEN** user taps the "move up" button on a day that is not the first
- **THEN** the day swaps position with the day above it (decrements its index by 1)

#### Scenario: Reorder days down
- **WHEN** user taps the "move down" button on a day that is not the last
- **THEN** the day swaps position with the day below it (increments its index by 1)

### Requirement: Exercise management within a day
The system SHALL allow users to add, remove, and reorder exercises within each day.

#### Scenario: Add exercise from library
- **WHEN** user taps "Agregar ejercicio" on a day card
- **THEN** an exercise picker (search/filter from exercise library) is displayed
- **AND** when user selects an exercise, an exercise configurator modal opens for that exercise

#### Scenario: Configure exercise targets
- **WHEN** the exercise configurator modal opens for a selected exercise
- **THEN** the user can set target sets (numeric, ≥1), target reps min (numeric, ≥1), and target reps max (numeric, ≥1)
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

### Requirement: Exercise picker filters and searches
The system SHALL provide search and filter capabilities when selecting exercises from the library.

#### Scenario: Search exercises by name
- **WHEN** user types a query in the exercise picker search field
- **THEN** exercises whose names match the query (case-insensitive) are displayed

#### Scenario: Filter exercises by muscle group
- **WHEN** user selects a muscle group filter chip
- **THEN** only exercises targeting that muscle group are displayed

#### Scenario: Filter exercises by equipment
- **WHEN** user selects an equipment filter chip
- **THEN** only exercises using that equipment are displayed

#### Scenario: No results found
- **WHEN** search/filter yields zero exercises
- **THEN** a "No se encontraron ejercicios" empty state is displayed

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

### Requirement: Transactional update for existing routines
The system SHALL update an existing routine preserving UUIDs for existing items and generating new UUIDs only for newly added days/exercises.

#### Scenario: Edit routine preserves existing UUIDs
- **WHEN** user edits an existing routine, changes the name, and submits
- **THEN** the routine row is updated in place (same UUID)
- **AND** existing days and exercises retain their original UUIDs
- **AND** the `updatedAt` timestamp is updated

#### Scenario: Edit routine adds new day
- **WHEN** user edits an existing routine and adds a new day with exercises
- **THEN** the new day and its exercises receive generated UUIDs
- **AND** existing days and exercises are unchanged (same UUIDs)

#### Scenario: Edit routine removes a day
- **WHEN** user edits an existing routine, removes a day, and submits
- **THEN** the removed day and all its exercises are deleted from the database

### Requirement: Edit does not mutate past workout sessions
The system SHALL NOT modify any `WorkoutSession`, `WorkoutExercise`, or `SetLog` rows when editing a routine template.

#### Scenario: Editing routine after it was used in a workout
- **WHEN** a routine has been used in a completed workout session
- **AND** user edits the routine (changes name, adds exercises, etc.)
- **THEN** the past workout session's data remains unchanged
- **AND** only the routine template rows are modified

### Requirement: Navigation after save
The system SHALL navigate the user after a successful save.

#### Scenario: After creating a routine
- **WHEN** the create save completes successfully
- **THEN** the app navigates to the routine detail screen at `/routine/<new-id>`
- **AND** if the detail route does not exist, navigates to `/routines` as fallback

#### Scenario: After editing a routine
- **WHEN** the edit save completes successfully
- **THEN** the app navigates back to the routine detail screen at `/routine/<id>`

### Requirement: Unsaved changes warning
The system SHALL warn the user before discarding unsaved changes.

#### Scenario: Back navigation with unsaved changes
- **WHEN** user has modified the form and attempts to navigate back
- **THEN** a confirmation dialog is shown: "¿Descartar cambios? Los cambios no guardados se perderán."
- **AND** user can confirm discard or cancel to stay on the form

#### Scenario: Back navigation without changes
- **WHEN** user has not modified the form and navigates back
- **THEN** no confirmation dialog is shown and navigation proceeds

### Requirement: Loading states
The system SHALL display appropriate loading indicators during async operations.

#### Scenario: Loading existing routine for edit
- **WHEN** the edit screen is mounted and begins fetching routine data
- **THEN** a loading indicator is displayed until the data is available

#### Scenario: Saving in progress
- **WHEN** the form is being submitted and the save transaction is in progress
- **THEN** the submit button shows a loading spinner and is disabled to prevent double submission

### Requirement: Accessibility
The system SHALL meet minimum accessibility requirements for the form screen.

#### Scenario: Touch targets meet minimum size
- **WHEN** any interactive element is rendered (buttons, inputs, pickers)
- **THEN** its touch target is at least 48px in height and width

#### Scenario: Form inputs have accessibility labels
- **WHEN** the form is rendered
- **THEN** all text inputs have `accessibilityLabel` set
- **AND** all buttons have `accessibilityLabel` set describing their action

#### Scenario: Error states are not color-only
- **WHEN** validation errors are displayed
- **THEN** errors include text descriptions and an error icon, not relying solely on red color
