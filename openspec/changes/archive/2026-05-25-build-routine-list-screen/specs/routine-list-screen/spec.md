## ADDED Requirements

### Requirement: Routine list displays active routines
The system SHALL fetch and display a scrollable list of routines where `is_archived = 0`, ordered by `sort_order`, sourced from `RoutineRepo`.

#### Scenario: Active routines are displayed
- **WHEN** the Routines screen mounts and there are active routines in the database
- **THEN** each active routine is rendered as a `RoutineCard` showing the routine name, number of days, and total exercise count across all days

#### Scenario: No active routines exist
- **WHEN** the Routines screen mounts and there are zero active routines in the database
- **THEN** the `EmptyState` component is displayed instead of the routine list

#### Scenario: Data refreshes on focus
- **WHEN** the user navigates away to create a routine and returns to the Routines screen
- **THEN** the routine list re-fetches and reflects any newly created or modified routines

### Requirement: RoutineCard shows summary information
The system SHALL render each routine card with the routine name, the number of days (`day_count`), and the total number of exercises across all days.

#### Scenario: Routine with multiple days and exercises
- **WHEN** a routine has 3 days and 15 exercises total
- **THEN** the card displays "3 días" and "15 ejercicios"

#### Scenario: Routine with a single day
- **WHEN** a routine has 1 day and 5 exercises
- **THEN** the card displays "1 día" and "5 ejercicios"

### Requirement: Swipe to archive a routine
The system SHALL allow the user to swipe a routine card left to reveal an "Archive" action, which calls `RoutineRepo.archive(id)` and removes the card from the active list with an undo option.

#### Scenario: Swipe and archive
- **WHEN** the user swipes a routine card left and taps the archive action
- **THEN** `RoutineRepo.archive(id)` is called with the routine's ID
- **AND** the routine card is removed from the active list
- **AND** a brief undo message appears allowing the user to revert within a few seconds

#### Scenario: Undo archive
- **WHEN** the user taps undo after archiving a routine
- **THEN** `RoutineRepo.unarchive(id)` is called
- **AND** the routine card reappears in the active list

### Requirement: Suggested templates when few routines
The system SHALL display suggested template cards (PPL, Upper/Lower, Full Body) when the user has fewer than 2 active routines.

#### Scenario: Fewer than 2 active routines
- **WHEN** the Routines screen mounts and there are 0 or 1 active routines
- **THEN** the `SuggestedTemplates` section is rendered above or below the active routine list with three template cards (PPL, Upper/Lower, Full Body)

#### Scenario: 2 or more active routines
- **WHEN** the Routines screen mounts and there are 2 or more active routines
- **THEN** the `SuggestedTemplates` section is NOT rendered

#### Scenario: Template tap navigates to creation
- **WHEN** the user taps a template card (e.g., PPL)
- **THEN** the app navigates to the routine creation screen with the template structure pre-filled

### Requirement: FAB navigates to create routine
The system SHALL display a floating action button (FAB) in the bottom-right corner of the Routines screen that navigates to the routine creation route.

#### Scenario: FAB tap
- **WHEN** the user taps the FAB on the Routines screen
- **THEN** the app navigates to the routine creation screen (`/routines/new`)

#### Scenario: FAB is always visible
- **WHEN** the Routines screen is rendered (regardless of empty state or list content)
- **THEN** the FAB is visible and tappable

### Requirement: Empty state design
The system SHALL display a designed empty state when there are zero active routines, including an illustration or icon, descriptive text encouraging the user to create their first routine, and a CTA button that navigates to create routine.

#### Scenario: Empty state with CTA
- **WHEN** the user has no active routines
- **THEN** the empty state displays an icon or illustration, the text "No tienes rutinas aún" with a supporting message, and a "Crear primera rutina" button
- **AND** tapping the button navigates to the routine creation screen

### Requirement: Screen delegates to repository
The screen component SHALL delegate all data access to `RoutineRepo` and SHALL NOT contain raw SQL queries or business logic.

#### Scenario: Data access through repository
- **WHEN** the screen needs routine data
- **THEN** it calls `RoutineRepo.getAll()` or equivalent repository methods
- **AND** no SQL strings or database instances are accessed directly from the screen file
