# Exercise Library (Delta)

## ADDED Requirements

### Requirement: Search bar uses tonal input style
The system SHALL render the exercise search bar with `#28272F` background, 12px border radius, white 85% text, and 30% opacity placeholder text.

#### Scenario: Search bar renders
- **WHEN** the Exercise Library screen renders
- **THEN** the search bar background SHALL be `#28272F` with 12px radius and no border

#### Scenario: Search bar focus
- **WHEN** the search bar receives focus
- **THEN** its background SHALL shift to `#242329`

### Requirement: Filter chips use monochromatic chip style
The system SHALL render muscle group and equipment filter chips with `#28272F` background, fully rounded shape, and JetBrains Mono text at 50% white opacity. Selected chips SHALL use white background with black text.

#### Scenario: Unselected chip renders
- **WHEN** a filter chip is not selected
- **THEN** its background SHALL be `#28272F` and text SHALL be white at 50% opacity in JetBrains Mono

#### Scenario: Selected chip renders
- **WHEN** a filter chip is selected
- **THEN** its background SHALL be white (`#FFFFFF`) and text SHALL be black (`#0C0B10`)

### Requirement: Exercise cards use tonal surface
The system SHALL render exercise cards with `#18191D` background, 12px border radius, and no divider lines between cards.

#### Scenario: Exercise card renders
- **WHEN** an ExerciseCard renders
- **THEN** its background SHALL be `#18191D` with 12px radius and 20px padding
