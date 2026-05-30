## MODIFIED Requirements

### Requirement: FAB navigates to create routine
The system SHALL display a floating action button (FAB) in the bottom-right corner of the Routines screen that navigates to the existing routine creation route and remains positioned above the bottom tab bar safe area.

#### Scenario: FAB tap
- **WHEN** the user taps the FAB on the Routines screen
- **THEN** the app navigates to the routine creation screen (`/routine/create`)

#### Scenario: FAB is always visible
- **WHEN** the Routines screen is rendered (regardless of empty state or list content)
- **THEN** the FAB is visible and tappable
- **AND** the FAB is not obscured by the bottom tab bar safe area

### Requirement: Empty state design
The system SHALL display a designed empty state when there are zero active routines, including an illustration or icon, descriptive text encouraging the user to create their first routine, and a CTA button that navigates to create routine. The empty-state content SHALL be vertically scrollable when needed so bottom content remains reachable above the bottom tab bar and floating controls.

#### Scenario: Empty state with CTA
- **WHEN** the user has no active routines
- **THEN** the empty state displays an icon or illustration, the text "No tienes rutinas aún" with a supporting message, and a "Crear primera rutina" button
- **AND** tapping the button navigates to the routine creation screen (`/routine/create`)

#### Scenario: Empty state bottom content remains reachable
- **WHEN** the user has no active routines on a small mobile viewport
- **THEN** the user can scroll the Routines screen to reach lower empty-state content such as suggested templates
- **AND** the bottom tab bar, FAB, undo bar, or inline error message does not permanently obscure that content
