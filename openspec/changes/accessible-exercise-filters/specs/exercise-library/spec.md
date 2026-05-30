## ADDED Requirements

### Requirement: Exercise library filter options show image and name
The system SHALL render exercise library filter options in bottom modal lists with a left local image and readable option name.

#### Scenario: Exercise library filter option row renders
- **WHEN** an exercise library filter modal is visible
- **THEN** each option row SHALL show a local image on the left
- **AND** each option row SHALL show the filter option name
- **AND** the image SHALL be loaded from bundled app assets

### Requirement: Exercise library filters are accessible
The system SHALL expose accessible names, roles, selected states, and touch targets for exercise library filter controls and rows.

#### Scenario: Exercise library filter control is announced
- **WHEN** assistive technology focuses an exercise library filter control
- **THEN** the control SHALL expose an accessible name that includes the filter group and current selection
- **AND** the control SHALL expose button semantics
- **AND** the control SHALL expose selected state when a non-`Todos` value is active

#### Scenario: Exercise library filter option is announced
- **WHEN** assistive technology focuses an exercise library filter option row
- **THEN** the row SHALL expose button semantics
- **AND** the row SHALL expose selected state when it matches the active filter value
- **AND** the decorative row image SHALL NOT create duplicate spoken content

#### Scenario: Exercise library filter targets are usable
- **WHEN** exercise library filter controls and option rows render
- **THEN** each interactive target SHALL be at least 48px tall
- **AND** selection state SHALL NOT rely on color alone

## MODIFIED Requirements

### Requirement: Filter exercises by muscle group
The system SHALL allow users to filter exercises by one selected muscle group from a `Muscle` filter control. Muscle filtering SHALL use JOIN with exercise_muscles via ExerciseRepo `getByMuscle()`.

#### Scenario: Muscle modal opens
- **WHEN** user activates the `Muscle` filter control
- **THEN** a bottom modal SHALL open from the bottom of the screen
- **AND** the modal SHALL be partially expanded rather than fullscreen
- **AND** the modal SHALL list `Todos` and available muscle groups

#### Scenario: Single muscle filter
- **WHEN** user selects "Chest" from the `Muscle` filter modal
- **THEN** the modal SHALL close
- **AND** the list SHALL display only exercises where Chest is primary or secondary muscle
- **AND** the `Muscle` filter control SHALL show the selected muscle label

#### Scenario: Clear muscle filter
- **WHEN** user selects `Todos` from the `Muscle` filter modal
- **THEN** the modal SHALL close
- **AND** the muscle filter SHALL be cleared
- **AND** all muscle groups SHALL be displayed subject to active search and equipment filter

### Requirement: Filter exercises by equipment
The system SHALL allow users to filter exercises by one selected equipment type from an `Equipment` filter control. Equipment filtering SHALL use ExerciseRepo `getByEquipment()`.

#### Scenario: Equipment modal opens
- **WHEN** user activates the `Equipment` filter control
- **THEN** a bottom modal SHALL open from the bottom of the screen
- **AND** the modal SHALL be partially expanded rather than fullscreen
- **AND** the modal SHALL list `Todos` and available equipment types

#### Scenario: Equipment filter active
- **WHEN** user selects "barbell" from the `Equipment` filter modal
- **THEN** the modal SHALL close
- **AND** the list SHALL display only barbell exercises
- **AND** the `Equipment` filter control SHALL show the selected equipment label

#### Scenario: Clear equipment filter
- **WHEN** user selects `Todos` from the `Equipment` filter modal
- **THEN** the modal SHALL close
- **AND** the equipment filter SHALL be cleared
- **AND** all equipment types SHALL be displayed subject to active search and muscle filter

## REMOVED Requirements

### Requirement: FilterChip selected and unselected states
**Reason**: The exercise library no longer uses horizontal filter chips for muscle and equipment filtering.
**Migration**: Replace chip rows with the `Equipment` and `Muscle` filter controls and bottom modal option lists.
