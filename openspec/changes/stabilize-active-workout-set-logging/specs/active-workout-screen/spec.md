## ADDED Requirements

### Requirement: Active set completion renders immediately
The Active Workout screen SHALL update visible set completion state immediately after a set is completed and persisted.

#### Scenario: Complete set without changing set count
- **WHEN** the user taps the check button on an incomplete set row in an expanded active workout exercise card
- **THEN** the set row SHALL render completed state without requiring another input edit, add-set action, navigation event, or screen refresh
- **AND** the exercise card completed count SHALL update in the same visible state transition

### Requirement: Active set edits render immediately
The Active Workout screen SHALL update visible set values immediately after weight or reps edits are accepted by the active workout store.

#### Scenario: Edit set values without changing set count
- **WHEN** the user changes weight or reps for an existing set row
- **THEN** the visible set row SHALL render the changed value without requiring another unrelated state change
- **AND** the exercise card SHALL remain expanded or collapsed according to the user's current selection

### Requirement: Previous set labels stay current
The Active Workout screen SHALL keep previous-value labels aligned with the latest visible set state.

#### Scenario: Complete first set updates next row previous label
- **WHEN** the first set row in an expanded exercise is completed
- **THEN** the next set row SHALL be eligible to re-render with the completed first set as its previous value source
- **AND** stale previous session values SHALL NOT remain solely because the next row's own weight and reps did not change

### Requirement: Set rows use simplified input controls
The Active Workout set row SHALL prioritize direct numeric entry and a completion check button.

#### Scenario: Render simplified set row
- **WHEN** a set row renders
- **THEN** it SHALL show set number, previous value, weight input, reps input, and completion check button
- **AND** it SHALL NOT render weight or reps `+` / `-` stepper buttons
- **AND** weight input, reps input, and check button SHALL each have a minimum 48px touch target
- **AND** weight and reps inputs SHALL use numeric keyboards

### Requirement: Newly added exercise becomes actionable
The Active Workout screen SHALL make a newly added exercise immediately actionable.

#### Scenario: Add exercise to an existing active workout
- **WHEN** the user selects an exercise from the add-exercise picker while an active workout already has at least one exercise
- **THEN** the picker SHALL close
- **AND** the new workout exercise SHALL appear in the active workout list
- **AND** the new workout exercise card SHALL expand
- **AND** the list SHALL attempt to scroll the new workout exercise into view

### Requirement: Active workout logging remains local-first
The Active Workout screen SHALL preserve existing local-first persistence behavior while fixing render state.

#### Scenario: Complete set persists through existing store and repository path
- **WHEN** the user completes a set
- **THEN** the active workout store SHALL continue to call the existing set completion persistence path
- **AND** the fix SHALL NOT require a database schema migration
- **AND** the fix SHALL NOT require network access

### Requirement: Completed sets can be unchecked
The Active Workout screen SHALL allow users to mark a completed set as incomplete from the same set completion control.

#### Scenario: Uncheck a completed set
- **WHEN** the user taps the completion control on a completed set row
- **THEN** the set SHALL be persisted as incomplete
- **AND** the set row SHALL render incomplete state without requiring another input edit, add-set action, navigation event, or screen refresh
- **AND** the set's completion timestamp SHALL be cleared
