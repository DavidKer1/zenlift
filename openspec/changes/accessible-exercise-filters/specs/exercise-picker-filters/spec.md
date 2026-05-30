## ADDED Requirements

### Requirement: Shared exercise picker exposes two filter controls
The system SHALL expose exactly two visible filter controls in the shared exercise picker: `Equipment` and `Muscle`.

#### Scenario: Picker renders filter controls
- **WHEN** the shared exercise picker is opened from Active Workout or routine editing
- **THEN** the picker SHALL show an `Equipment` filter control
- **AND** the picker SHALL show a `Muscle` filter control
- **AND** the picker SHALL NOT show horizontal filter pills or a visible category filter control

#### Scenario: Picker keeps search available
- **WHEN** the shared exercise picker renders
- **THEN** the search input SHALL remain available above the exercise results
- **AND** text search SHALL combine with active `Equipment` and `Muscle` filters

### Requirement: Shared exercise picker filter controls open partial bottom modals
The system SHALL open a partially expanded bottom modal when the user activates either shared picker filter control.

#### Scenario: Equipment modal opens
- **WHEN** the user activates the `Equipment` filter control
- **THEN** a bottom modal SHALL open from the bottom of the screen
- **AND** the modal SHALL be partially expanded rather than fullscreen
- **AND** the modal SHALL list equipment filter options

#### Scenario: Muscle modal opens
- **WHEN** the user activates the `Muscle` filter control
- **THEN** a bottom modal SHALL open from the bottom of the screen
- **AND** the modal SHALL be partially expanded rather than fullscreen
- **AND** the modal SHALL list muscle filter options

### Requirement: Shared exercise picker filter options show image and name
The system SHALL render each shared picker filter option as a vertical list row with a left image and readable option name.

#### Scenario: Option row renders
- **WHEN** a filter modal is visible
- **THEN** each option row SHALL show a local image on the left
- **AND** each option row SHALL show the filter option name
- **AND** the image SHALL be loaded from bundled app assets

### Requirement: Shared exercise picker selection closes modal and filters results
The system SHALL close the active filter modal immediately after a shared picker filter option is selected and SHALL apply the selected filter to the exercise results.

#### Scenario: Select equipment option
- **WHEN** the user selects an equipment option in the picker filter modal
- **THEN** the modal SHALL close
- **AND** the `Equipment` filter control SHALL display the selected equipment label
- **AND** the exercise results SHALL include only exercises matching the selected equipment and any active search or muscle filter

#### Scenario: Select muscle option
- **WHEN** the user selects a muscle option in the picker filter modal
- **THEN** the modal SHALL close
- **AND** the `Muscle` filter control SHALL display the selected muscle label
- **AND** the exercise results SHALL include only exercises matching the selected muscle and any active search or equipment filter

#### Scenario: Select all option
- **WHEN** the user selects the `Todos` option in a picker filter modal
- **THEN** the modal SHALL close
- **AND** that filter group SHALL be cleared
- **AND** the exercise results SHALL continue to respect the remaining active search or other filter group

### Requirement: Shared exercise picker filters are accessible
The system SHALL expose accessible names, roles, selected states, and touch targets for shared picker filter controls and rows.

#### Scenario: Filter control is announced
- **WHEN** assistive technology focuses a shared picker filter control
- **THEN** the control SHALL expose an accessible name that includes the filter group and current selection
- **AND** the control SHALL expose button semantics
- **AND** the control SHALL expose selected state when a non-`Todos` value is active

#### Scenario: Filter option is announced
- **WHEN** assistive technology focuses a shared picker filter option row
- **THEN** the row SHALL expose button semantics
- **AND** the row SHALL expose selected state when it matches the active filter value
- **AND** the decorative row image SHALL NOT create duplicate spoken content

#### Scenario: Touch targets are usable
- **WHEN** shared picker filter controls and option rows render
- **THEN** each interactive target SHALL be at least 48px tall
- **AND** selection state SHALL NOT rely on color alone
