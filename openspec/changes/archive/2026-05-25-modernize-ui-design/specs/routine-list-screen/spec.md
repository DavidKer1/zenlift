# Routine List Screen (Delta)

## ADDED Requirements

### Requirement: RoutineCard shows summary information on tonal surface
The system SHALL render each routine card with the routine name, the number of days (`day_count`), and the total number of exercises across all days on a `#18191D` tonal surface card with 12px border radius and no shadow.

#### Scenario: Routine with multiple days and exercises
- **WHEN** a routine has 3 days and 15 exercises total
- **THEN** the card displays "3 días" and "15 ejercicios"
- **AND** the card background is `#18191D` with 12px radius

#### Scenario: Routine card press feedback
- **WHEN** a RoutineCard is pressed
- **THEN** it SHALL scale to 0.98 with a 100ms transition

### Requirement: FAB uses white background
The system SHALL render the Floating Action Button for creating routines with a white (`#FFFFFF`) background, black (`#0C0B10`) icon, and pill shape without shadow.

#### Scenario: FAB renders
- **WHEN** the Routines screen renders
- **THEN** the FAB background SHALL be `#FFFFFF`, the icon tint SHALL be `#0C0B10`, and the button SHALL have no shadow

#### Scenario: FAB pressed state
- **WHEN** the FAB is pressed
- **THEN** it SHALL scale to 0.95 with opacity 0.9

### Requirement: Suggested templates use tonal cards
The system SHALL display suggested template cards (PPL, Upper/Lower, Full Body) on `#18191D` tonal surface cards when the user has fewer than 2 active routines.

#### Scenario: Template cards render
- **WHEN** fewer than 2 active routines exist
- **THEN** suggested template cards render with `#18191D` background and 12px radius

### Requirement: Empty state uses tonal surface
The system SHALL display the empty state on a `#18191D` surface card when no routines exist.

#### Scenario: Empty state renders
- **WHEN** no routines exist
- **THEN** the empty state renders with `#18191D` background, white 85% body text, and white 50% secondary text
