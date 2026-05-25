## 1. Diagnose Current Flow

- [x] 1.1 Reproduce the Home Quick Workout issue and confirm whether the session is created in SQLite before navigation fails.
- [x] 1.2 Trace all quick-start entry points, including Home, Exercise Detail, routine repeat, and direct `/workout/active` recovery.
- [x] 1.3 Identify any direct `WorkoutRepo.createSession` quick-start calls that bypass `useActiveWorkoutStore` or shared navigation.

## 2. Shared Start Flow

- [x] 2.1 Update `StartWorkoutParams` and `startWorkoutFlow` to support optional quick-start exercise additions while preserving routine start behavior.
- [x] 2.2 Ensure the no-active-session path awaits store hydration before navigating to `/workout/active`.
- [x] 2.3 Ensure the existing-active-session continue path awaits `recoverSession` before navigating to `/workout/active`.
- [x] 2.4 Ensure the existing-active-session new-session path cancels the previous session, creates the new session, hydrates the store, and navigates to `/workout/active`.

## 3. Screen Integration

- [x] 3.1 Keep the Home Quick Workout button wired to the shared start flow and verify it does not create hidden sessions.
- [x] 3.2 Refactor Exercise Detail Quick Workout to use the shared start/recover flow instead of creating sessions directly in the route.
- [x] 3.3 Ensure adding an exercise to an existing active session updates or recovers the active workout store before showing Active Workout.
- [x] 3.4 Confirm `/workout/active` recovery still redirects Home only after recovery finds no active session.

## 4. Regression Tests

- [x] 4.1 Add or update active workout store tests for creating, recovering, and replacing active sessions.
- [x] 4.2 Add tests for `startWorkoutFlow` that mock Expo Router and verify navigation after create, continue, and new-session choices.
- [x] 4.3 Add coverage for exercise quick-start adding the selected exercise and opening Active Workout.

## 5. Verification

- [x] 5.1 Run the focused Jest tests for workout store/repository/start flow.
- [x] 5.2 Run `pnpm lint` and resolve issues caused by this change.
- [x] 5.3 Smoke test on a native/dev build: tap Home Quick Workout, confirm Active Workout opens, return Home, tap again, choose continue, and confirm the same active session opens.