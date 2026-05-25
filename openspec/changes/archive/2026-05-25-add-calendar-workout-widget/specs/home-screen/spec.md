# Home Screen

Delta spec for replacing the Home Screen Last Workout card with a calendar workout widget.

## ADDED Requirements

### Requirement: Calendar Workout Widget shows recent activity and last routine
The system SHALL display a calendar-style workout widget on the Home Screen using completed workout data from the local database.

#### Scenario: Completed workouts exist
- **WHEN** the Home Screen renders and completed workout sessions exist within the widget date window
- **THEN** the Calendar Workout Widget SHALL render recent activity as dot grids grouped by month, with active workout days visually distinct from inactive days

#### Scenario: Latest completed workout has routine context
- **WHEN** the latest completed workout has a linked `routine_day_id` or `routine_id`
- **THEN** the widget SHALL display the latest routine day, routine, or session label in the bottom label area
- **AND** the widget SHALL display a frequency label for how many completed sessions match that repeatable routine context

#### Scenario: Latest completed workout can be repeated
- **WHEN** the latest completed workout has a linked `routine_day_id` or `routine_id`
- **THEN** the widget SHALL render a repeat-start button with a minimum 48px touch target
- **AND** tapping the button SHALL call the existing start workout flow with the latest workout's routine context

#### Scenario: Latest completed workout cannot be repeated
- **WHEN** the latest completed workout has no linked routine context
- **THEN** the widget SHALL still display the latest session label and frequency
- **AND** the repeat-start action SHALL be hidden or disabled with an accessible state

#### Scenario: No completed workouts exist
- **WHEN** the Home Screen renders and no completed workout sessions exist
- **THEN** the widget SHALL render an empty calendar state with inactive dots and copy indicating that no workouts have been completed yet
- **AND** the widget SHALL NOT show an enabled repeat-start action

#### Scenario: Calendar data loads asynchronously
- **WHEN** the Home Screen mounts and widget data is being fetched from SQLite
- **THEN** the widget SHALL show a loading state within the widget footprint until data resolves

#### Scenario: Widget follows the design system
- **WHEN** the widget renders
- **THEN** it SHALL use the dark tonal surface hierarchy, 12px card radius, 20px card padding, Inter labels/body text, JetBrains Mono numeric data, and white opacity tiers defined in `DESIGN.md`
- **AND** it SHALL NOT use shadows, gradients, or green except for success/completed states

## MODIFIED Requirements

### Requirement: Home Screen layout is scrollable and responsive
The system SHALL render the Home Screen as a vertically scrollable view containing all sections in order.

#### Scenario: Screen renders all sections
- **WHEN** the Home Screen mounts
- **THEN** the following sections SHALL render in order from top to bottom: Greeting, StartWorkoutButton, Quick Workout button, Calendar Workout Widget, WeeklyActivityCard, CurrentRoutineCard, RecentPRsCard

#### Scenario: Calendar widget follows Start Workout actions
- **WHEN** the Home Screen renders
- **THEN** the Calendar Workout Widget SHALL be placed immediately after the Start Workout and Quick Workout buttons

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
- **THEN** a `useEffect` with empty dependency array SHALL trigger data fetching for the calendar widget and all remaining Home sections

#### Scenario: Calendar widget data comes from repository layer
- **WHEN** the Home Screen fetches Calendar Workout Widget data
- **THEN** it SHALL call a `WorkoutRepo` read method for the widget summary instead of querying SQLite directly in the screen or component

#### Scenario: Callbacks are memoized
- **WHEN** data fetching functions are defined
- **THEN** each function SHALL be wrapped in `useCallback` to prevent unnecessary re-renders

#### Scenario: Errors are handled gracefully
- **WHEN** a repository query fails (e.g., database error)
- **THEN** the specific section SHALL render its empty state (not crash) and the error SHALL be logged

## REMOVED Requirements

### Requirement: Last Workout Card with real data and empty state
**Reason**: The Last Workout card is replaced by the Calendar Workout Widget, which carries the latest workout label plus activity and frequency context in a single module.

**Migration**: Remove Home usage of `LastWorkoutCard` and render the new Calendar Workout Widget in its position after the Start Workout buttons.

#### Scenario: LastWorkoutCard is not rendered on Home
- **WHEN** the Home Screen renders after this change
- **THEN** `LastWorkoutCard` SHALL NOT be rendered as a Home section