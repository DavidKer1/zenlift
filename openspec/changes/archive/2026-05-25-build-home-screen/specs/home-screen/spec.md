## ADDED Requirements

### Requirement: Home Screen greeting changes by time of day

The system SHALL display a greeting on the Home Screen that changes dynamically based on the local device time.

#### Scenario: Morning greeting (6:00 - 11:59)

- **WHEN** the Home Screen renders and the local hour is between 6 and 11 inclusive
- **THEN** the greeting text SHALL be "Buenos días"

#### Scenario: Afternoon greeting (12:00 - 18:59)

- **WHEN** the Home Screen renders and the local hour is between 12 and 18 inclusive
- **THEN** the greeting text SHALL be "Buenas tardes"

#### Scenario: Night greeting (19:00 - 5:59)

- **WHEN** the Home Screen renders and the local hour is between 19 and 23, or between 0 and 5 inclusive
- **THEN** the greeting text SHALL be "Buenas noches"

### Requirement: Start Workout button navigates to routines

The system SHALL display a primary CTA button labeled "Start Workout" that navigates the user to the routines section.

#### Scenario: User taps Start Workout

- **WHEN** the user taps the "Start Workout" button on the Home Screen
- **THEN** the app SHALL navigate to the routines screen using Expo Router

#### Scenario: Start Workout button uses primary color

- **WHEN** the Start Workout button renders
- **THEN** the button background SHALL use the primary color `#F97316` and the text SHALL be white

### Requirement: Last Workout Card with real data and empty state

The system SHALL display the user's most recent completed workout session or a designed empty state when no workouts exist.

#### Scenario: Recent workout exists

- **WHEN** the Home Screen renders and at least one completed workout session exists in the database
- **THEN** the LastWorkoutCard SHALL display: the session name, the routine name (if linked), the date (formatted relative or absolute), duration, and total exercise count

#### Scenario: No workouts exist (empty state)

- **WHEN** the Home Screen renders and no completed workout sessions exist
- **THEN** the LastWorkoutCard SHALL display an empty state with an icon (e.g., dumbbell), the text "No workouts yet", a subtitle "Start your first workout", and a secondary CTA button "Start Workout"

#### Scenario: Data loads asynchronously

- **WHEN** the Home Screen mounts and workout data is being fetched from SQLite
- **THEN** the LastWorkoutCard SHALL show a loading indicator until data resolves

### Requirement: Weekly Activity Card shows real progress

The system SHALL display a weekly activity card showing which days of the current week (Monday to Sunday) had at least one completed workout.

#### Scenario: Some days have workouts

- **WHEN** the Home Screen renders and the current week has workouts on Monday, Wednesday, and Friday
- **THEN** the WeeklyActivityCard SHALL show a 7-segment day bar where Monday, Wednesday, and Friday segments are highlighted with the primary color and the rest are rendered as inactive (muted)

#### Scenario: No workouts this week (empty state)

- **WHEN** the Home Screen renders and no workouts exist in the current week
- **THEN** the WeeklyActivityCard SHALL show all 7 day segments as inactive and display the text "No activity this week" with a subtitle "Start a workout to see your progress"

#### Scenario: Week starts on Monday

- **WHEN** calculating weekly activity
- **THEN** the week SHALL be defined as Monday 00:00 to Sunday 23:59 of the current local week

### Requirement: Current Routine Card with active routine data

The system SHALL display the user's first non-archived routine or a designed empty state when no routines exist.

#### Scenario: At least one active routine exists

- **WHEN** the Home Screen renders and at least one non-archived routine exists
- **THEN** the CurrentRoutineCard SHALL display: the routine name, the number of days, and a "Start" button that navigates to that routine's detail screen

#### Scenario: No routines exist (empty state)

- **WHEN** the Home Screen renders and no routines exist (or all are archived)
- **THEN** the CurrentRoutineCard SHALL display an empty state with an icon, the text "No routine set", a subtitle "Create a routine to track your progress", and a CTA button "Create Routine" that navigates to routine creation

### Requirement: Recent PRs Card shows personal records

The system SHALL display up to 3 of the user's most recent personal records from the database.

#### Scenario: PRs exist

- **WHEN** the Home Screen renders and personal records exist in the database
- **THEN** the RecentPRsCard SHALL display up to 3 PRs, each showing: the exercise name, the PR type (e.g., max weight, max volume, max reps), the achieved value with unit, and the date achieved

#### Scenario: No PRs exist (empty state)

- **WHEN** the Home Screen renders and no personal records exist
- **THEN** the RecentPRsCard SHALL display an empty state with an icon (e.g., trophy), the text "No personal records yet", and a subtitle "Complete workouts to set new records"

#### Scenario: PR type is displayed in user-friendly format

- **WHEN** displaying a PR of type `max_weight`
- **THEN** the label SHALL be "Max Weight" (or localized equivalent)

### Requirement: Home Screen layout is scrollable and responsive

The system SHALL render the Home Screen as a vertically scrollable view containing all sections in order.

#### Scenario: Screen renders all sections

- **WHEN** the Home Screen mounts
- **THEN** the following sections SHALL render in order from top to bottom: Greeting, StartWorkoutButton, LastWorkoutCard, WeeklyActivityCard, CurrentRoutineCard, RecentPRsCard

#### Scenario: Safe area insets are respected

- **WHEN** the Home Screen renders
- **THEN** the content SHALL respect safe area insets (notch, status bar, home indicator) using `SafeAreaView` or equivalent

#### Scenario: Scrollable when content exceeds viewport

- **WHEN** all sections render with content (including empty states)
- **THEN** the screen SHALL be scrollable via `ScrollView` or `FlashList`

### Requirement: Home Screen data fetching uses useCallback and useEffect

The system SHALL fetch data from repositories using React's `useCallback` and `useEffect` hooks, keeping the screen component thin.

#### Scenario: Data fetched on mount

- **WHEN** the Home Screen component mounts
- **THEN** a `useEffect` with empty dependency array SHALL trigger data fetching for all sections

#### Scenario: Callbacks are memoized

- **WHEN** data fetching functions are defined
- **THEN** each function SHALL be wrapped in `useCallback` to prevent unnecessary re-renders

#### Scenario: Errors are handled gracefully

- **WHEN** a repository query fails (e.g., database error)
- **THEN** the specific section SHALL render its empty state (not crash) and the error SHALL be logged
