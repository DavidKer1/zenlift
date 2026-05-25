## Context

Zenlift's primary product loop depends on the user reaching Active Workout immediately after starting a session. The current code has multiple quick-start paths: Home uses `startWorkoutFlow`, while Exercise Detail creates sessions and adds exercises directly through `WorkoutRepo`. The reported symptom indicates a session can be persisted as `active` without the Active Workout route becoming visible, and the next Quick Workout tap detects that hidden active session.

The app is local-first, so the fix must keep SQLite as the source of truth for active sessions, keep MMKV session id recovery intact, and avoid backend assumptions. Screens should stay thin; session creation, recovery, and active-session navigation should live in the workout flow/store layer.

## Goals / Non-Goals

**Goals:**

- Ensure Home Quick Workout always ends on `/workout/active` after creating or recovering an active session.
- Ensure quick-start paths hydrate `useActiveWorkoutStore` before or as part of showing Active Workout.
- Reuse a shared start/recover flow for Home and Exercise Detail instead of duplicating repository writes in route files.
- Preserve recovery behavior for active sessions left in SQLite or MMKV after app restart.
- Add focused regression tests around active session creation, recovery, and navigation.

**Non-Goals:**

- Redesign the Active Workout UI.
- Add backend sync, authentication, analytics, or remote recovery.
- Change workout session schema or migration history.
- Change the routine-based Start Workout contract beyond keeping it compatible with the shared flow.

## Decisions

1. Use `startWorkoutFlow` as the shared entry point for quick-start navigation.

   Rationale: Home already calls this flow, and it centralizes active-session handling, alerts, store actions, and router navigation. Exercise Detail should call the same flow with an optional exercise id/add-exercise intent rather than writing to `WorkoutRepo` directly and navigating back to Home.

   Alternative considered: add route-specific fixes in Home and Exercise Detail. This would solve the immediate screens but keep divergent session semantics and make future quick-start bugs more likely.

2. Hydrate the active workout store as the navigation contract.

   Rationale: The Active Workout screen renders from `useActiveWorkoutStore`, then calls `recoverSession` as a fallback. The start flow should leave the store in a usable state before navigating, and the screen should continue to recover from SQLite if opened cold or after reload.

   Alternative considered: make Active Workout query SQLite directly on every render. That would move business/state logic into the route and make set logging harder to keep fast.

3. Treat an existing active session as recoverable, not as a dead-end.

   Rationale: The second tap currently proves an active session exists. The user must be able to continue that session and see Active Workout, not be stranded on Home. Dialog options can remain, but the continue path must recover state and navigate to `/workout/active`.

   Alternative considered: automatically cancel hidden active sessions. That risks losing workout data, which violates the product rule that active workout data must be protected.

4. Keep the change local-first and schema-neutral.

   Rationale: The existing repository already supports active session lookup, full session hydration, session creation, and adding exercises. The bug is in orchestration/navigation, not data modeling.

## Risks / Trade-offs

- Active session dialog behavior could differ across entry points -> Use the shared flow so Home and Exercise Detail have the same recover/new-session semantics.
- Store and SQLite could disagree after direct repository writes -> Remove route-level direct session creation from quick-start paths or immediately call store recovery after any repository mutation.
- Navigation could fire before store hydration completes -> Await store start/recovery actions before calling `router.push` or `router.replace`.
- Test environment may not cover native navigation perfectly -> Mock Expo Router and repository/store effects in unit tests, then smoke test on native/dev build where Expo SQLite is available.

## Migration Plan

No database migration is required. Implement the flow changes behind the existing screens, run focused unit tests and lint, then validate manually by tapping Home Quick Workout, returning Home, tapping again, and confirming the active-session dialog can continue to `/workout/active`.

Rollback is limited to reverting the flow/store/screen changes; persisted active sessions remain compatible with existing repository recovery.

## Open Questions

- Should tapping Home Quick Workout with an existing active session show the current dialog or immediately continue the existing session? The initial implementation can preserve the dialog to avoid surprising users.
- Should Exercise Detail add the selected exercise to an existing active session before navigating immediately, or ask first as it does today? The spec keeps the confirmation behavior while requiring navigation to Active Workout after the selected action succeeds.