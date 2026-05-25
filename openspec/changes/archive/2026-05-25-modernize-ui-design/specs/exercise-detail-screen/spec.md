# Exercise Detail Screen (Delta)

## ADDED Requirements

### Requirement: Exercise detail uses tonal surfaces
The system SHALL render the exercise detail screen with `#0C0B10` background, exercise info in `#18191D` cards with 12px radius, and data values in JetBrains Mono at appropriate opacity levels.

#### Scenario: Exercise detail renders
- **WHEN** an exercise detail screen renders
- **THEN** info cards SHALL use `#18191D` background with 12px radius and 20px padding
- **AND** numerical data SHALL use JetBrains Mono font
- **AND** labels SHALL use Inter at 50% white opacity

### Requirement: Chart and history use monochromatic styling
The system SHALL render progress charts and history lists using white strokes/accents on `#18191D` card backgrounds without colored data series.

#### Scenario: Progress chart renders
- **WHEN** a progress chart renders
- **THEN** chart lines and dots SHALL use white at varying opacities (80% for primary series, 50% for secondary)
- **AND** the chart background SHALL be `#18191D`
