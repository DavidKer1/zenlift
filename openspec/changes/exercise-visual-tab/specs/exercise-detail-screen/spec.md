## ADDED Requirements

### Requirement: Exercise Detail shows visual description content
The system SHALL render exercise detail as a visual read-only description page when reached from the exercise library.

#### Scenario: Visual detail renders for seeded exercise
- **WHEN** the user opens a seeded exercise detail
- **THEN** the screen SHALL show the exercise name
- **AND** the screen SHALL show a local exercise photo
- **AND** the screen SHALL show a Spanish exercise description
- **AND** the screen SHALL show equipment metadata
- **AND** the screen SHALL show associated muscle badges

#### Scenario: Visual detail renders for custom exercise
- **WHEN** the user opens a custom exercise detail
- **THEN** the screen SHALL show the exercise name
- **AND** the screen SHALL show the custom exercise notes as description when notes exist
- **AND** the screen SHALL show a fallback local exercise photo
- **AND** the screen SHALL identify the exercise as custom with a read-only visual marker

## MODIFIED Requirements

### Requirement: Exercise Detail loads exercise data by ID
The system SHALL load an exercise and its associated muscle groups from SQLite when navigating to the exercise detail screen with a valid exercise ID parameter.

#### Scenario: Exercise found
- **WHEN** the screen mounts with a valid exercise ID in the route params
- **THEN** the system fetches the exercise via `ExerciseRepo.getById(id)` and its muscles via `ExerciseRepo.getMuscles(id)`
- **THEN** the exercise name, equipment, category, description, local photo, and muscle badges are displayed

#### Scenario: Exercise not found
- **WHEN** the screen mounts with an exercise ID that does not exist in the database
- **THEN** the system displays an error state with a message indicating the exercise was not found
- **THEN** a back navigation option is available

### Requirement: Exercise detail uses tonal surfaces
The system SHALL render the exercise detail screen with the dark Zenlift background, visual photo content, and description surfaces using the app theme tokens.

#### Scenario: Exercise detail renders
- **WHEN** an exercise detail screen renders
- **THEN** the hero photo SHALL render with stable dimensions and rounded corners
- **AND** descriptive content SHALL render inside a tonal surface
- **AND** labels SHALL use Inter at reduced opacity

## REMOVED Requirements

### Requirement: Best Performance Card shows real aggregated data
**Reason**: The exercise detail reached from the visual Ejercicios tab is now a read-only description page, not a progress analytics screen.
**Migration**: Remove best-performance metrics from this screen. Performance analytics can remain in future Progress or History surfaces.

### Requirement: Recent History shows last 5 uses
**Reason**: The visual exercise detail should focus on learning what the movement is and how to identify it.
**Migration**: Remove recent-history content from this screen. Workout history remains available in history/progress-oriented surfaces.

### Requirement: Progress Chart renders data from last 10 sessions
**Reason**: Charts make this tab operational/analytics-focused instead of visual discovery-focused.
**Migration**: Remove progress charts from this screen. Exercise progress can be reintroduced in a dedicated progress view.

### Requirement: All PRs list is displayed
**Reason**: Personal records are progress data, not required for the visual exercise browsing flow.
**Migration**: Remove PR lists from this screen. Existing PR storage remains unchanged.

### Requirement: Edit and Delete actions visible only for custom exercises
**Reason**: Edit/delete are write and destructive actions; this tab must remain visual and read-only.
**Migration**: Remove edit/delete controls from the exercise detail visual path. Existing repository support can remain for future management flows.

### Requirement: Start Quick Workout creates a session with this exercise
**Reason**: Starting workouts from this tab competes with Zenlift's routine-driven core loop and the requested visual-only tab behavior.
**Migration**: Remove the quick workout action from exercise detail. Starting workouts should remain in routine or active-workout flows.

### Requirement: Chart and history use monochromatic styling
**Reason**: This screen no longer renders charts or history lists after becoming a visual description page.
**Migration**: Remove chart/history sections from exercise detail; retain monochromatic styling conventions for any future analytics surfaces.
