## ADDED Requirements

### Requirement: Active workout exercise cards remain expanded

Active workout exercise cards SHALL render their set rows and add-set control without requiring an exercise-level expand/collapse action.

#### Scenario: User opens an active workout with exercises

- **WHEN** the Active Workout screen or modal renders exercises
- **THEN** each exercise card SHALL show its set rows immediately
- **AND** the user SHALL be able to edit weight/reps and complete/uncomplete sets without expanding the exercise

#### Scenario: User adds an exercise during an active workout

- **WHEN** the user adds an exercise from the picker
- **THEN** the new exercise SHALL appear with its set rows visible
- **AND** the app SHALL preserve scroll-to-new-exercise behavior
- **AND** no expand state SHALL be required to make the exercise actionable

### Requirement: Completed exercises are de-emphasized without disabling actions

When all sets in an exercise are completed, the active workout UI SHALL visually de-emphasize the exercise with a static opacity treatment while keeping all controls interactive.

#### Scenario: All sets in an exercise are completed

- **WHEN** every set for an exercise has `is_completed = 1`
- **THEN** the exercise card SHALL show a completed visual treatment
- **AND** the visual treatment SHALL use static component opacity rather than blur, filters, timers, or animations
- **AND** opacity SHALL NOT be the only completion cue
- **AND** the exercise card SHALL show textual completion state, such as a `Completado` badge
- **AND** the user SHALL still be able to uncheck sets, edit values, and add a set

#### Scenario: A completed exercise is unchecked

- **WHEN** the user unchecks one completed set in a completed exercise
- **THEN** the completed visual treatment SHALL be removed
- **AND** the exercise SHALL remain fully visible and editable
