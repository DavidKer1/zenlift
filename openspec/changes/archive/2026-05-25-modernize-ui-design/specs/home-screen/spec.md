# Home Screen (Delta)

## ADDED Requirements

### Requirement: Start Workout button uses white background
The system SHALL display a primary CTA button labeled "Start Workout" that navigates the user to the routines section.

#### Scenario: User taps Start Workout
- **WHEN** the user taps the "Start Workout" button on the Home Screen
- **THEN** the app SHALL navigate to the routines screen using Expo Router

#### Scenario: Start Workout button uses white background
- **WHEN** the Start Workout button renders
- **THEN** the button background SHALL be white (`#FFFFFF`) and the text SHALL be black (`#0C0B10`)

#### Scenario: Secondary Start Workout button
- **WHEN** the "Quick Workout" secondary variant renders
- **THEN** the button background SHALL be `#28272F` and the text SHALL be white at 85% opacity

### Requirement: Last Workout Card with tonal surface
The system SHALL display the user's most recent completed workout session or a designed empty state when no workouts exist. The card SHALL use the tonal surface design.

#### Scenario: Recent workout exists
- **WHEN** the Home Screen renders and at least one completed workout session exists in the database
- **THEN** the LastWorkoutCard SHALL display: the session name, the routine name (if linked), the date, duration, and total exercise count
- **AND** the card background SHALL be `#18191D` with 12px border radius and no shadow

#### Scenario: No workouts exist (empty state)
- **WHEN** the Home Screen renders and no completed workout sessions exist
- **THEN** the LastWorkoutCard SHALL display an empty state with an icon, "No workouts yet" text, and a secondary CTA button
- **AND** the card SHALL use `#18191D` background with 12px radius

### Requirement: Weekly Activity Card uses tonal surface
The system SHALL display a weekly activity visualization with day-of-week indicators using opacity-based active/inactive states on a `#18191D` card background.

#### Scenario: Activity dots render
- **WHEN** the WeeklyActivityCard renders with activity data
- **THEN** active days SHALL show white dots at 80% opacity and inactive days at 10% opacity on a `#18191D` background

### Requirement: Current Routine Card uses tonal surface
The system SHALL display the user's current routine with a progress indicator on a `#18191D` card.

#### Scenario: Routine card renders
- **WHEN** the CurrentRoutineCard renders with routine data
- **THEN** the card background SHALL be `#18191D` with 12px radius and the progress ring SHALL use white strokes

### Requirement: Recent PRs Card uses tonal surface
The system SHALL display recent personal records on a `#18191D` card.

#### Scenario: PR card renders
- **WHEN** the RecentPRsCard renders with PR data
- **THEN** the card background SHALL be `#18191D` with 12px radius and exercise names SHALL use white 85% text
