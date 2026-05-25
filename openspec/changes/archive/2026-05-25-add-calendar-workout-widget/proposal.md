## Why

The Home Screen currently separates weekly activity and last workout into separate modules, which makes the primary workout context feel fragmented. A compact calendar-style widget can show recent training consistency, the last completed routine, and a fast repeat action in one focused module placed directly after the Start Workout CTAs.

## What Changes

- Replace the existing Last Workout card on Home with a minimalist calendar workout widget styled from `DESIGN.md` and inspired by the provided dot-calendar reference.
- Place the widget immediately after the existing Start Workout and Quick Workout buttons.
- Show a month-grouped activity dot calendar backed by completed workout sessions from SQLite.
- Show a bottom label with the most recent completed routine or session and the frequency with which that routine/session has been completed.
- Add an action button on the widget to start the most recent routine again when a linked routine/routine day exists.
- Preserve loading and empty states for users with no completed workouts.
- Keep Home data access routed through existing database and repository layers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `home-screen`: Replace the Last Workout card requirement with a calendar workout widget that renders after the Start Workout buttons and exposes last-routine, frequency, and repeat-start behavior.
- `workout-repository`: Add or extend read queries needed to supply calendar activity, latest completed workout summary, and routine/session frequency through repository methods.

## Impact

- Affected UI: `src/app/index.tsx`, `src/components/home/LastWorkoutCard.tsx` removal/replacement, and a new home widget component under `src/components/home/`.
- Affected data layer: `src/storage/repositories/workoutRepo.ts` and its tests for calendar/frequency query coverage.
- Affected flow: Home repeat action should reuse `startWorkoutFlow` rather than duplicating active-workout creation logic.
- Affected design: the widget must use the existing dark tonal surface hierarchy, Inter/JetBrains Mono typography, 12px card radius, 20px card padding, and white opacity tiers from `DESIGN.md`.