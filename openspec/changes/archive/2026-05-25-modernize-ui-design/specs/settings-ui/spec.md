# Settings UI (Delta)

## ADDED Requirements

### Requirement: Settings screen uses tonal surfaces
The system SHALL render the Settings screen with `#0C0B10` background, section cards in `#18191D` with 12px radius, and interactive controls using monochromatic styling.

#### Scenario: Section cards render
- **WHEN** the Settings screen renders
- **THEN** each section (General, Data, Information) SHALL be a `#18191D` card with 12px radius, 20px padding, and no shadow

#### Scenario: Toggle controls use white accent
- **WHEN** a toggle/segmented control renders
- **THEN** the selected option SHALL use white (`#FFFFFF`) background with black text
- **AND** unselected options SHALL use `#28272F` with white 50% text

#### Scenario: Slider uses white track
- **WHEN** a slider control renders
- **THEN** the active track SHALL be white and the thumb SHALL be white
- **AND** the inactive track SHALL be `#49454F`

#### Scenario: Destructive actions use ghost style
- **WHEN** a destructive action button (e.g., "Delete all data") renders
- **THEN** it SHALL use transparent background with white 50% text and a danger indicator icon

### Requirement: Modal dialogs use elevated surface
The system SHALL render modal dialogs with `#242329` background and 12px radius.

#### Scenario: Confirmation modal renders
- **WHEN** a confirmation modal appears
- **THEN** its background SHALL be `#242329` with 12px radius and no shadow
