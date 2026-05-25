# Monochromatic UI Components

## Purpose

Base UI primitives (cards, buttons, chips, inputs) styled with the tonal monochromatic system. These components enforce the DESIGN.md visual language across all screens.

## ADDED Requirements

### Requirement: Card component uses tonal surface
The system SHALL render cards with `#18191D` background, 12px border radius, 20px internal padding, and no borders or shadows.

#### Scenario: Card renders with correct surface
- **WHEN** a Card component renders
- **THEN** its background SHALL be `#18191D`, border radius SHALL be 12px, and it SHALL have no border or shadow

#### Scenario: Card press feedback is scale-based
- **WHEN** a Card is pressed
- **THEN** it SHALL scale to 0.98 with a 100ms ease-out transition, without changing background color

### Requirement: Primary button is white with black text
The system SHALL render primary action buttons with solid white (`#FFFFFF`) background and black (`#0C0B10`) text.

#### Scenario: Primary button renders
- **WHEN** a PrimaryButton renders
- **THEN** its background SHALL be `#FFFFFF`, text SHALL be `#0C0B10`, border radius SHALL be 12px, and it SHALL have no shadow

#### Scenario: Primary button pressed state
- **WHEN** a PrimaryButton is pressed
- **THEN** it SHALL scale to 0.97 with opacity reduced to 0.9

### Requirement: Secondary button uses dark surface
The system SHALL render secondary buttons with `#28272F` background and white text at 85% opacity.

#### Scenario: Secondary button renders
- **WHEN** a SecondaryButton renders
- **THEN** its background SHALL be `#28272F` and text SHALL be white at 85% opacity

### Requirement: Ghost button has no background
The system SHALL render ghost buttons with transparent background and white text at 50% opacity, transitioning to 100% on press.

#### Scenario: Ghost button renders
- **WHEN** a GhostButton renders
- **THEN** its background SHALL be transparent and text SHALL be white at 50% opacity

#### Scenario: Ghost button hover/press
- **WHEN** a GhostButton is pressed or hovered
- **THEN** text opacity SHALL transition to 100%

### Requirement: Chip component uses dark surface with monospace text
The system SHALL render chips with `#28272F` background, fully rounded shape, and JetBrains Mono text at 50% opacity.

#### Scenario: Chip renders
- **WHEN** a Chip component renders
- **THEN** its background SHALL be `#28272F`, border radius SHALL be pill (999), and text SHALL use JetBrains Mono at 50% white opacity

### Requirement: Input field uses dark surface with tonal focus
The system SHALL render text inputs with `#28272F` background, 12px border radius, white 85% text, and 30% opacity placeholder. Focus SHALL be indicated by a subtle background shift to `#242329`.

#### Scenario: Input field renders
- **WHEN** an Input component renders
- **THEN** it SHALL have `#28272F` background, 12px radius, no border, and placeholder text at 30% white opacity

#### Scenario: Input field focus
- **WHEN** an Input receives focus
- **THEN** its background SHALL shift to `#242329`

### Requirement: Divider is not used; spacing separates items
The system SHALL separate list items using vertical spacing (16px) rather than divider lines.

#### Scenario: List items are spaced without dividers
- **WHEN** multiple cards or list items render in sequence
- **THEN** they SHALL be separated by 16px vertical gaps and SHALL NOT have horizontal divider lines
