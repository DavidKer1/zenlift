# Active Workout Modal

## Purpose

Persistent bottom modal for the active workout session that slides up from above the tab bar using a single `translateY` animation. The modal provides full workout controls when expanded and a compact miniplayer row when minimized. It persists across all tabs so the user never loses visibility of their running workout.

## ADDED Requirements

### Requirement: Modal renders when a workout session is active

The system SHALL render a bottom modal overlay when `useActiveWorkoutStore.session` is non-null.

#### Scenario: Modal appears when workout starts

- **WHEN** a workout session becomes active in the store
- **THEN** the active workout modal SHALL appear in its expanded state showing the full workout interface

#### Scenario: Modal is absent when no session exists

- **WHEN** no workout session is active in the store
- **THEN** the active workout modal SHALL NOT render

### Requirement: Modal uses a single animated container with translateY

The modal SHALL be implemented as a single `Animated.View` positioned absolutely over the full screen, animated via `transform: [{ translateY }]` driven by a shared value (0 = minimized, 1 = expanded).

#### Scenario: Expanded position

- **WHEN** the modal is expanded
- **THEN** `translateY` SHALL be 0, making the full modal visible

#### Scenario: Minimized position

- **WHEN** the modal is minimized
- **THEN** `translateY` SHALL be `screenHeight - tabBarHeight - 56`, leaving only the header row (56px) visible above the tab bar

### Requirement: Header row is horizontal and always visible

The modal SHALL display a horizontal header row containing the workout name, elapsed timer, and a chevron toggle button. This row SHALL be visible in both expanded and minimized states.

#### Scenario: Header row layout

- **WHEN** the modal renders
- **THEN** the header row SHALL display items in a horizontal `flexDirection: 'row'` layout: workout name (left, truncated), timer with orange dot (center), chevron button (right)

#### Scenario: Chevron toggles state

- **WHEN** the user taps the chevron button
- **THEN** the modal SHALL toggle between expanded and minimized states

### Requirement: Body content fades when minimizing

The workout body content (Cancel button, RestTimer, exercise list, BottomBar) SHALL fade out using `opacity` interpolation driven by the same shared value, synchronised with the `translateY` animation.

#### Scenario: Body fades during minimize

- **WHEN** the modal transitions from expanded to minimized
- **THEN** the body content SHALL fade from opacity 1 to 0

#### Scenario: Body fades during expand

- **WHEN** the modal transitions from minimized to expanded
- **THEN** the body content SHALL fade from opacity 0 to 1

### Requirement: Transition uses withTiming

The expand and minimize animations SHALL use `withTiming` with a duration of 350ms, producing a smooth non-bouncy transition.

#### Scenario: Expand animation

- **WHEN** the modal transitions from minimized to expanded
- **THEN** the transition SHALL complete in approximately 350ms using `withTiming`

#### Scenario: Minimize animation

- **WHEN** the modal transitions from expanded to minimized
- **THEN** the transition SHALL complete in approximately 350ms using `withTiming`

### Requirement: Timer runs continuously in both states

The elapsed workout timer SHALL continue updating every second via `setInterval` based on `session.started_at`, regardless of whether the modal is expanded or minimized.

#### Scenario: Timer updates while minimized

- **WHEN** the modal is minimized during an active workout
- **THEN** the elapsed timer in the header row SHALL update every second

#### Scenario: Timer is accurate after re-expand

- **WHEN** the modal is expanded after being minimized for N seconds
- **THEN** the timer SHALL reflect the correct elapsed time accounting for the time spent minimized

### Requirement: Modal overlays tabs and persists across tab switches

The modal SHALL render above all tab content and SHALL remain visible when the user switches between Home, Routines, History, and Settings tabs. It SHALL be mounted in `src/app/_layout.tsx` after `AppTabs`.

#### Scenario: Modal stays visible on tab switch

- **WHEN** an active workout modal is rendered and the user switches to a different tab
- **THEN** the modal (or its header row when minimized) SHALL remain visible and functional

### Requirement: Modal uses pointerEvents box-none

The overlay container SHALL use `pointerEvents="box-none"` so it does not block interaction with the tab bar behind it when the modal is minimized.

#### Scenario: Tab bar is tappable when minimized

- **WHEN** the modal is minimized
- **THEN** the tab bar SHALL be fully tappable without interference from the modal overlay

### Requirement: Swipe-down gesture minimizes the modal

The expanded modal SHALL support minimization through a swipe-down gesture detected by `react-native-gesture-handler` `Gesture.Pan()`.

#### Scenario: User swipes down on body area

- **WHEN** the user performs a downward swipe gesture on the modal body area with translationY > 40
- **THEN** the modal SHALL minimize to the header row state

### Requirement: GestureHandlerRootView is present at root

The app root layout SHALL wrap content in `GestureHandlerRootView` to enable gesture recognition in the modal.

#### Scenario: Gestures are recognized

- **WHEN** the modal renders with a `GestureDetector`
- **THEN** swipe gestures SHALL be recognized without errors
