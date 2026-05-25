## Why

Quick Workout can create an active workout session without showing the Active Workout screen, leaving the user on Home and causing a second tap to report that a session is already active. This breaks the core workout loop at the exact moment the user expects to start logging sets.

## What Changes

- Make the Home Quick Workout action consistently start or recover an active session and show the Active Workout screen.
- Ensure an active session created from any quick-start path is reflected in the active workout store before navigation completes.
- Align exercise-detail quick workout behavior with the same active-session flow instead of creating sessions outside the shared workout start logic.
- Add regression coverage for the start/recover/navigation behavior so a persisted active session cannot become invisible.

## Capabilities

### New Capabilities
- `active-workout-flow`: Covers starting, recovering, and displaying active workout sessions from quick-start entry points.

### Modified Capabilities
- `home-screen`: Defines the Home Quick Workout button behavior, including session creation/recovery and navigation to Active Workout.
- `exercise-detail-screen`: Clarifies that exercise-level Quick Workout must open Active Workout after creating or updating the active session.

## Impact

- Affected screens and flows: Home Quick Workout, Exercise Detail Quick Workout, Active Workout route recovery.
- Affected state/storage: `useActiveWorkoutStore`, `WorkoutRepo` active-session reads/writes, MMKV active session id persistence.
- Affected navigation: Expo Router transitions to `/workout/active` after start or recovery.
- Tests should cover the shared quick-start flow and active-session recovery without adding backend or network dependencies.