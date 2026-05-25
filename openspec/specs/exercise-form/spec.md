# Exercise Form Modal Specification

## Purpose

Specification for the Exercise Form Modal, which allows creating and editing custom exercises.

## Requirements

### Requirement: ExerciseFormModal renders form fields
The ExerciseFormModal component SHALL render a form with the following fields: name (TextInput), primary muscle (single-select), secondary muscles (multi-select chips), equipment (single-select), category (single-select), and notes (TextArea, optional).

#### Scenario: Form renders in create mode
- **WHEN** ExerciseFormModal is rendered without an `exercise` prop
- **THEN** all fields are empty
- **THEN** the submit button displays "Crear ejercicio"

#### Scenario: Form renders in edit mode
- **WHEN** ExerciseFormModal is rendered with an `exercise` prop containing existing exercise data
- **THEN** name, equipment, and category fields are pre-filled with the exercise's current values
- **THEN** the primary muscle select shows the exercise's primary muscle
- **THEN** the secondary muscle chips show the exercise's secondary muscles as selected
- **THEN** the notes field is pre-filled if the exercise has notes
- **THEN** the submit button displays "Guardar cambios"

### Requirement: Name validation with Zod schema
The form SHALL use a Zod schema that validates the name field with a minimum length of 2 characters and SHALL NOT be empty.

#### Scenario: Empty name validation
- **WHEN** the user submits the form with an empty name
- **THEN** the form displays a validation error "El nombre es obligatorio"

#### Scenario: Name too short validation
- **WHEN** the user submits the form with a name shorter than 2 characters
- **THEN** the form displays a validation error "Mínimo 2 caracteres"

#### Scenario: Name with leading or trailing whitespace
- **WHEN** the user submits the form with a name containing only whitespace or leading/trailing whitespace
- **THEN** the name is trimmed before validation
- **THEN** if the trimmed name is empty or shorter than 2 characters, the validation error is shown

### Requirement: Primary muscle is required
The Zod schema SHALL require the primary muscle field to be selected.

#### Scenario: Primary muscle not selected
- **WHEN** the user submits the form without selecting a primary muscle
- **THEN** the form displays a validation error "Selecciona un músculo principal"

### Requirement: Equipment is required
The Zod schema SHALL require the equipment field to be selected.

#### Scenario: Equipment not selected
- **WHEN** the user submits the form without selecting an equipment type
- **THEN** the form displays a validation error "Selecciona el equipamiento"

### Requirement: Duplicate name detection
Before creating a new exercise, the form SHALL check for duplicate names by calling `ExerciseRepo.search()` with the submitted name. If an exercise with a case-insensitive matching name already exists, the form SHALL display a warning and prevent creation.

#### Scenario: Duplicate name detected on create
- **WHEN** the user submits the form in create mode with a name that already exists in the database (case-insensitive match)
- **THEN** the form displays a warning "Ya existe un ejercicio con este nombre"
- **THEN** the exercise is NOT created

#### Scenario: No duplicate on unique name
- **WHEN** the user submits the form in create mode with a name that does NOT exist in the database
- **THEN** the exercise IS created successfully

#### Scenario: Duplicate check on edit excludes current exercise
- **WHEN** the user submits the form in edit mode and the name matches the current exercise's original name
- **THEN** the duplicate check excludes the current exercise ID
- **THEN** the exercise IS updated successfully

### Requirement: Create exercise persists to SQLite
On successful form submission in create mode, the form SHALL call `ExerciseRepo.create()` with the exercise data and muscle associations within a single transaction.

#### Scenario: Successful exercise creation
- **WHEN** the user submits a valid form in create mode
- **THEN** `ExerciseRepo.create()` is called with `is_custom=1`, the form values, and muscle entries
- **THEN** the exercise is inserted into the `exercises` table
- **THEN** the primary muscle is inserted into `exercise_muscles` with role `primary`
- **THEN** each secondary muscle is inserted into `exercise_muscles` with role `secondary`
- **THEN** the `onSave` callback is invoked with the created exercise
- **THEN** the modal closes

### Requirement: Update exercise persists changes to SQLite
On successful form submission in edit mode, the form SHALL call `ExerciseRepo.update()` with the changed fields and sync muscle associations.

#### Scenario: Successful exercise update
- **WHEN** the user submits a valid form in edit mode with modified fields
- **THEN** `ExerciseRepo.update()` is called with the changed exercise fields
- **THEN** primary muscle associations are synced: if the primary muscle changed, old primary is removed and new primary is added
- **THEN** secondary muscle associations are synced: removed muscles call `removeMuscle()`, added muscles call `addMuscle()`
- **THEN** the `onSave` callback is invoked with the updated exercise
- **THEN** the modal closes

### Requirement: Secondary muscles support multi-select chips
The secondary muscles field SHALL render as a horizontal scrollable list of chips, one per muscle group. Each chip SHALL toggle between selected and unselected state on press.

#### Scenario: Select secondary muscle
- **WHEN** the user taps an unselected muscle chip
- **THEN** the chip changes to selected state with the muscle's color as background
- **THEN** the muscle is added to the form's secondary muscles array

#### Scenario: Deselect secondary muscle
- **WHEN** the user taps a currently selected muscle chip
- **THEN** the chip changes to unselected state
- **THEN** the muscle is removed from the form's secondary muscles array

#### Scenario: Primary muscle excluded from secondary options
- **WHEN** the user selects a primary muscle
- **THEN** that muscle group is NOT available as a secondary muscle option
- **THEN** if the primary muscle was previously selected as secondary, it is automatically deselected

### Requirement: Cancel button closes modal without saving
The form SHALL include a cancel button that closes the modal without persisting any changes.

#### Scenario: Cancel in create mode
- **WHEN** the user taps the cancel button in create mode
- **THEN** the modal closes via the `onClose` callback
- **THEN** no exercise is created in the database

#### Scenario: Cancel in edit mode
- **WHEN** the user taps the cancel button in edit mode with unsaved changes
- **THEN** the modal closes via the `onClose` callback
- **THEN** the exercise in the database remains unchanged

### Requirement: Form state resets on open
When the modal opens, the form state SHALL be reset to match the current `exercise` prop (or empty state for create mode).

#### Scenario: Modal opens for create after previous edit
- **WHEN** the modal is opened in create mode after previously being used in edit mode
- **THEN** all form fields are reset to empty
- **THEN** no stale data from the previous session remains

### Requirement: Submit button is disabled during submission
The submit button SHALL be disabled while the form is submitting to prevent duplicate submissions.

#### Scenario: Submit button disabled state
- **WHEN** the user taps the submit button and the form is processing
- **THEN** the submit button is disabled
- **THEN** the submit button text changes to a loading indicator or "Guardando..."
- **THEN** additional taps on the button are ignored

### Requirement: Primary muscle select displays 13 muscle group options
The primary muscle select SHALL display all 13 muscle groups from the `muscle_groups` table, fetched via `MuscleGroupRepo.getAll()`.

#### Scenario: Primary muscle options loaded
- **WHEN** the ExerciseFormModal mounts
- **THEN** `MuscleGroupRepo.getAll()` is called
- **THEN** all 13 muscle groups are available as options in the primary muscle select
- **THEN** each option displays the muscle group's display name in Spanish and its color dot

### Requirement: Category select offers 4 exercise categories
The category select SHALL offer the 4 exercise categories: strength, cardio, mobility, and core.

#### Scenario: Category options
- **WHEN** the user opens the category select
- **THEN** the options are: Fuerza, Cardio, Movilidad, Core
- **THEN** the selected value is stored using the corresponding English enum value (strength, cardio, mobility, core)

### Requirement: Equipment select offers 9 equipment options
The equipment select SHALL offer the 9 equipment types defined in the `Equipment` type.

#### Scenario: Equipment options
- **WHEN** the user opens the equipment select
- **THEN** the options are: Barra, Mancuernas, Máquina, Cable, Peso corporal, Kettlebell, Smith, Barra Z, Cardio
- **THEN** the selected value is stored using the corresponding English enum value (barbell, dumbbell, machine, cable, bodyweight, kettlebell, smith_machine, ez_bar, cardio_machine)
