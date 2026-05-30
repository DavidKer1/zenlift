## ADDED Requirements

### Requirement: Exercise library is visual and read-only
The system SHALL present the exercise library tab as a visual read-only discovery surface.

#### Scenario: Exercise visual card renders
- **WHEN** an exercise is displayed in the exercise library
- **THEN** the card SHALL show a local photo
- **AND** the card SHALL show the exercise name
- **AND** the card SHALL show a short Spanish description
- **AND** the card SHALL show the primary muscle when available
- **AND** the card SHALL show the equipment label or icon

#### Scenario: Exercise visual metadata works offline
- **WHEN** the exercise library renders seeded exercises while offline
- **THEN** photos and descriptions SHALL load from bundled local app assets or local source files

## MODIFIED Requirements

### Requirement: ExerciseCard displays exercise info
The system SHALL render each exercise as a visual discovery card showing: exercise photo, exercise name, short Spanish description, primary muscle group, and equipment. The card SHALL be pressable to navigate to exercise detail and SHALL NOT render a favorite toggle button.

#### Scenario: ExerciseCard renders
- **WHEN** an exercise with primary muscle "Chest" and equipment "barbell" is displayed
- **THEN** the card SHALL show the exercise name
- **AND** the card SHALL show a local photo for the exercise
- **AND** the card SHALL show a short Spanish description
- **AND** the card SHALL show a dot colored with the Chest muscle color (#EF4444)
- **AND** the card SHALL show equipment metadata representing barbell
- **AND** the card SHALL NOT show a star or favorite control

#### Scenario: Tap card navigates
- **WHEN** user taps the exercise discovery card
- **THEN** the app SHALL navigate to exercise detail for that exercise

### Requirement: FlashList with estimated item size
The system SHALL use FlashList with `estimatedItemSize` for the exercise list to ensure smooth scrolling with 25+ visual exercise cards.

#### Scenario: Scroll through 25 exercises
- **WHEN** the list contains 25+ exercises
- **THEN** scrolling SHALL remain responsive
- **AND** FlashList SHALL be configured with an estimated item size that matches the visual card height

### Requirement: Empty state when no results
The system SHALL display an empty state message centered on screen when no exercises match the current search and filters.

#### Scenario: No matching exercises
- **WHEN** the search query and/or filters yield zero results
- **THEN** a centered view SHALL display "No se encontraron ejercicios" with an icon
- **AND** no create-exercise FAB SHALL be required for the empty state

## REMOVED Requirements

### Requirement: Toggle exercise favorite
**Reason**: The Ejercicios tab is a visual read-only discovery surface, and favorite state is a write action that distracts from browsing exercises by photo and description.
**Migration**: Remove favorite controls from the exercise tab UI. Existing persisted favorite data and repository methods can remain available for future product surfaces unless separately removed.

### Requirement: FAB to create custom exercise
**Reason**: The Ejercicios tab is intended for visual browsing and description lookup, not exercise management.
**Migration**: Remove the create-exercise FAB from the exercise tab. Future custom exercise management can be exposed through routine-building or a dedicated management flow if needed.
