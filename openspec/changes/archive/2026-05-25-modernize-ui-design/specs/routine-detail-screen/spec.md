# Routine Detail Screen (Delta)

## ADDED Requirements

### Requirement: Routine detail uses tonal surfaces
The system SHALL render the routine detail screen with the routine name as a headline, day sections as `#18191D` tonal cards with 12px radius, and exercise items listed without divider lines.

#### Scenario: Routine detail renders
- **WHEN** a routine detail screen renders
- **THEN** the background SHALL be `#0C0B10`, day sections SHALL use `#18191D` cards with 12px radius and 20px padding, and exercise items SHALL be separated by 16px vertical spacing without divider lines

### Requirement: Action buttons use monochromatic variants
The system SHALL render action buttons (Start Workout, Edit, Delete) using the monochromatic button variants.

#### Scenario: Primary action uses white button
- **WHEN** a "Start Workout" primary action renders
- **THEN** the button SHALL have white background with black text

#### Scenario: Secondary actions use dark surface button
- **WHEN** an "Edit" secondary action renders
- **THEN** the button SHALL have `#28272F` background with white 85% text
