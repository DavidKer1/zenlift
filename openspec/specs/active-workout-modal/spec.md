# Active Workout Modal

## Purpose

Persistent overlay for the active workout session. The modal provides the full workout controls when expanded and a compact header-only miniplayer when minimized. It persists across all tabs so the user never loses visibility of their running workout while keeping bottom navigation usable.

## Requirements

### Requirement: Modal renders when a workout session is active

The system SHALL render an active workout overlay when `useActiveWorkoutStore.session` is non-null.

#### Scenario: Modal appears when workout starts

- **WHEN** a workout session becomes active in the store
- **THEN** the active workout modal SHALL appear in its expanded state showing the full workout interface

#### Scenario: Modal is absent when no session exists

- **WHEN** no workout session is active in the store
- **THEN** the active workout modal SHALL NOT render

### Requirement: Minimized state renders only the active workout header

The active workout modal SHALL render only a compact header row when minimized. The minimized state SHALL NOT expose any workout body content, sheet background, list content, cancel row, or bottom bar above or behind the header.

#### Scenario: Minimized header is the only visible workout UI

- **WHEN** the active workout modal is minimized
- **THEN** the user SHALL see only the active workout header above the bottom tab navigation
- **AND** the workout body content SHALL NOT be visible

#### Scenario: Minimized header sits above bottom navigation

- **WHEN** the active workout modal is minimized on a device with a bottom safe area
- **THEN** the header SHALL be positioned immediately above the bottom tab navigation surface
- **AND** the bottom tab navigation SHALL remain visually fixed at the bottom of the screen

### Requirement: Expanded and minimized surfaces are separate components

The active workout modal SHALL separate the minimized header surface from the expanded workout surface. The controller may share state and callbacks, but the minimized state SHALL NOT be implemented as a partially collapsed expanded surface.

#### Scenario: Minimized surface does not depend on expanded body height

- **WHEN** the active workout modal transitions to minimized
- **THEN** the minimized header SHALL render independently of the expanded workout surface height
- **AND** changing the expanded workout content height SHALL NOT change the minimized header height

#### Scenario: Expanded surface contains full workout controls

- **WHEN** the active workout modal is expanded
- **THEN** the expanded surface SHALL render the active workout controls, including cancel, exercise list, add exercise, finish, and exercise picker entry points

### Requirement: Modal excludes break and rest timer UI

The active workout modal SHALL NOT render break, rest timer, countdown, skip rest, or add-rest-time controls in minimized or expanded states.

#### Scenario: Expanded modal has no rest controls

- **WHEN** the modal is expanded during an active workout
- **THEN** the modal SHALL render active workout controls without any break or rest timer UI

#### Scenario: Completing sets does not reveal rest UI

- **WHEN** the user completes a set while the modal is visible
- **THEN** the modal SHALL NOT show a rest countdown, skip rest button, or add-rest-time button

### Requirement: Header row is horizontal and always visible

The modal SHALL display a horizontal header row containing the workout name, elapsed timer, and a chevron toggle button. The header content SHALL be visible in both expanded and minimized states, but the minimized state SHALL render only the header surface while the expanded state MAY render the same header content inside the expanded workout surface.

#### Scenario: Header row layout

- **WHEN** the modal renders a header in either state
- **THEN** the header row SHALL display items in a horizontal `flexDirection: 'row'` layout: workout name (left, truncated), timer with orange dot (center), chevron button (right)

#### Scenario: Chevron toggles state

- **WHEN** the user taps the chevron button
- **THEN** the modal SHALL toggle between expanded and minimized states

#### Scenario: Header tap expands minimized workout

- **WHEN** the user taps the minimized active workout header outside destructive controls
- **THEN** the modal SHALL expand to the full workout surface

### Requirement: Header transition uses Reanimated shared motion on native

The transition between minimized and expanded states SHALL use Reanimated 4 shared motion for the header identity on native platforms. The implementation SHALL use stable shared transition tags or an equivalent Reanimated 4 shared transition approach for the header container and key header content.

#### Scenario: Header identity is preserved while expanding

- **WHEN** the user expands the minimized active workout header on a native platform
- **THEN** the header SHALL animate into the expanded workout header as the same perceived UI element
- **AND** the transition SHALL NOT flash, duplicate permanently, or jump between unrelated positions

#### Scenario: Header identity is preserved while minimizing

- **WHEN** the user minimizes the expanded workout surface on a native platform
- **THEN** the expanded header SHALL animate into the minimized header position above the tab navigation
- **AND** the final minimized state SHALL contain only one interactive header

### Requirement: Web fallback preserves minimized behavior

The active workout modal SHALL remain functional on platforms where Reanimated shared element transitions are unavailable. The fallback SHALL preserve the same minimized and expanded states even if the transition uses shared values, timing, opacity, or layout animation instead of shared element transitions.

#### Scenario: Shared elements are unavailable

- **WHEN** the app runs on a platform that does not support Reanimated shared element transitions
- **THEN** the active workout modal SHALL still expand and minimize without runtime errors
- **AND** the minimized state SHALL still show only the header above the bottom tab navigation

### Requirement: Timer runs continuously in both states

The elapsed workout timer SHALL continue updating every second via `setInterval` based on `session.started_at`, regardless of whether the modal is expanded or minimized.

#### Scenario: Timer updates while minimized

- **WHEN** the modal is minimized during an active workout
- **THEN** the elapsed timer in the header row SHALL update every second

#### Scenario: Timer is accurate after re-expand

- **WHEN** the modal is expanded after being minimized for N seconds
- **THEN** the timer SHALL reflect the correct elapsed time accounting for the time spent minimized

### Requirement: Modal overlays tabs and persists across tab switches

The modal SHALL render above all tab content and SHALL remain visible when the user switches between Home, Routines, History, and Settings tabs. It SHALL be mounted in `src/app/_layout.tsx` after `AppTabs`. When minimized, only its header SHALL appear above the bottom tab navigation and the tab navigation SHALL remain visible and usable.

#### Scenario: Modal stays visible on tab switch

- **WHEN** an active workout modal is rendered and the user switches to a different tab
- **THEN** the modal (or its header row when minimized) SHALL remain visible and functional

#### Scenario: Minimized header does not move the tab bar

- **WHEN** the active workout modal is minimized
- **THEN** the bottom tab navigation SHALL remain anchored to the bottom of the screen
- **AND** the minimized header SHALL sit above it without replacing or partially covering tab targets

### Requirement: Modal uses pointerEvents box-none

The overlay container SHALL use `pointerEvents="box-none"` so it does not block interaction with the tab bar behind it when the modal is minimized. The minimized header SHALL only capture touches within its visible bounds, and the expanded surface SHALL capture touches while expanded.

#### Scenario: Tab bar is tappable when minimized

- **WHEN** the modal is minimized
- **THEN** the tab bar SHALL be fully tappable without interference from the modal overlay

#### Scenario: Header captures only visible header interactions

- **WHEN** the modal is minimized and the user taps inside the header bounds
- **THEN** the header SHALL handle the interaction
- **AND** taps outside the header and tab bar SHALL pass through to the underlying screen where appropriate

### Requirement: Swipe-down gesture minimizes the modal

The expanded modal SHALL support minimization through a swipe-down gesture.

#### Scenario: User swipes down on expanded surface

- **WHEN** the user performs a downward swipe gesture on the expanded workout surface
- **THEN** the modal SHALL minimize to the header-only state

### Requirement: GestureHandlerRootView is present at root

The app root layout SHALL wrap content in `GestureHandlerRootView` to enable gesture recognition in the modal.

#### Scenario: Gestures are recognized

- **WHEN** the modal renders with gesture handling enabled
- **THEN** swipe gestures SHALL be recognized without errors
