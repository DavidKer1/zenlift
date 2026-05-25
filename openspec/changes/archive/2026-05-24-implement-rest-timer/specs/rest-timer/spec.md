# rest-timer

## Purpose

Defines the behavior of the RestTimer component: an absolute-timestamp-based circular countdown timer for rest periods between exercise sets in the active workout flow. The component MUST survive screen navigation and app restarts by deriving remaining time from a persisted `targetEnd` timestamp.

## ADDED Requirements

### Requirement: Timer displays remaining seconds from absolute timestamp

The system SHALL calculate remaining rest seconds as `targetEnd - Date.now()` on every `requestAnimationFrame` tick and SHALL display the result as a large centered integer countdown.

#### Scenario: Timer shows correct remaining time

- **WHEN** `targetEnd` is set to `Date.now() + 90000` (90 seconds in the future)
- **THEN** the displayed countdown starts at `90` and decreases to `0` over 90 real seconds

#### Scenario: Timer recovers after app restart

- **WHEN** the app is reopened and `targetEnd` was set to `Date.now() + 90000` at the time the app was backgrounded
- **THEN** the displayed countdown reflects the real elapsed time (e.g., if 30 seconds passed, display shows `60`)

#### Scenario: Timer is hidden when targetEnd is null

- **WHEN** the `targetEnd` prop is `null`
- **THEN** the RestTimer component SHALL render nothing (return `null`)

### Requirement: SVG circular progress indicator

The system SHALL render a circular progress indicator using `react-native-svg` that visually represents the ratio of remaining time to total rest duration.

#### Scenario: Full circle at start

- **WHEN** the timer has just started with a 90-second rest and no time has elapsed
- **THEN** the SVG circle shows a full ring (100% circumference visible)

#### Scenario: Partial circle mid-timer

- **WHEN** 45 seconds remain of a 90-second rest
- **THEN** the SVG circle shows 50% of its circumference (50% progress)

#### Scenario: Empty circle on completion

- **WHEN** remaining seconds reach 0
- **THEN** the SVG circle shows an empty ring (0% circumference visible)

### Requirement: Haptic feedback on completion

The system SHALL trigger `Haptics.notificationAsync(NotificationFeedbackType.Success)` exactly once when the remaining seconds reach 0. The system SHALL NOT trigger haptic feedback on subsequent render frames after completion.

#### Scenario: Vibration fires at zero

- **WHEN** remaining seconds transition from 1 to 0
- **THEN** the device vibrates with a success notification haptic pattern

#### Scenario: No duplicate vibrations

- **WHEN** the component re-renders with remaining seconds already at 0 (targetEnd unchanged)
- **THEN** no additional haptic feedback is triggered

### Requirement: OnComplete callback invoked exactly once

The system SHALL call the `onComplete` prop function once when remaining seconds first reach or fall below 0, and SHALL NOT call it again on subsequent renders for the same `targetEnd`.

#### Scenario: onComplete called at zero

- **WHEN** remaining seconds reach 0 for the first time
- **THEN** `onComplete()` is invoked exactly once

#### Scenario: onComplete not re-triggered

- **WHEN** the component re-renders after `onComplete` has already been called for the current `targetEnd`
- **THEN** `onComplete()` is not called again

### Requirement: Pause freezes UI display without changing targetEnd

The system SHALL support a pause toggle that stops the UI countdown display while leaving the absolute `targetEnd` timestamp unchanged. When resumed, the display SHALL jump to the real remaining seconds calculated from `targetEnd - Date.now()`.

#### Scenario: Pause stops display updates

- **WHEN** the user taps the pause button with 45 seconds remaining
- **THEN** the displayed countdown freezes at 45 while real time continues to pass

#### Scenario: Resume jumps to real remaining time

- **WHEN** the user taps resume after pausing for 10 seconds (real time)
- **THEN** the displayed countdown jumps to 35 (the real remaining time)

### Requirement: Skip timer via callback

The system SHALL render a skip button or support a swipe-right gesture that invokes the `onSkip` callback, allowing the user to end the rest period immediately.

#### Scenario: Skip button calls onSkip

- **WHEN** the user taps the "Skip" button or swipes right on the timer
- **THEN** `onSkip()` is invoked once

### Requirement: Add 30 seconds via callback

The system SHALL render an "Add 30s" button that invokes `onAddTime(30)`, delegating the actual timestamp extension to the parent store.

#### Scenario: Add 30s button calls onAddTime

- **WHEN** the user taps the "+30s" button
- **THEN** `onAddTime(30)` is invoked once

### Requirement: Timer label displays rest context

The system SHALL render the text "Descanso" and the current exercise or muscle group name below the countdown to provide context during the rest period.

#### Scenario: Rest label visible

- **WHEN** the timer is active (targetEnd is not null)
- **THEN** the text "Descanso" is displayed below the countdown number

#### Scenario: Exercise name visible

- **WHEN** the timer is active and the host screen provides an exercise name via a prop or context
- **THEN** the exercise name is displayed below "Descanso"

### Requirement: RequestAnimationFrame-based updates

The system SHALL use `requestAnimationFrame` (not `setInterval`) to update the displayed remaining seconds. The animation loop SHALL be canceled on component unmount.

#### Scenario: rAF updates the display

- **WHEN** the component is mounted with a valid `targetEnd`
- **THEN** the displayed countdown updates smoothly with the screen refresh rate

#### Scenario: rAF stops on unmount

- **WHEN** the component is unmounted (e.g., user navigates away)
- **THEN** the `requestAnimationFrame` callback is canceled and no state updates are attempted
