# Home Screen

Delta spec for Home Screen: add Quick Workout option alongside existing routine-based flow.

## MODIFIED Requirements

### Requirement: Start Workout button navigates to routines

The system SHALL display a primary CTA button labeled "Start Workout" that navigates the user to the routines section, and a secondary "Quick Workout" button that immediately starts an empty workout session via `StartWorkoutFlow`.

#### Scenario: User taps Start Workout
- **WHEN** the user taps the "Start Workout" button on the Home Screen
- **THEN** the app SHALL navigate to the routines screen using Expo Router

#### Scenario: Start Workout button uses primary color
- **WHEN** the Start Workout button renders
- **THEN** the button background SHALL use the primary color `#F97316` and the text SHALL be white

#### Scenario: User taps Quick Workout
- **WHEN** the user taps the "Quick Workout" button on the Home Screen
- **THEN** the app SHALL call `StartWorkoutFlow.start()` with no arguments and navigate to `/workout/active` on success

#### Scenario: Quick Workout button uses secondary style
- **WHEN** the Quick Workout button renders
- **THEN** it SHALL use a secondary/outlined variant distinct from the primary Start Workout button
