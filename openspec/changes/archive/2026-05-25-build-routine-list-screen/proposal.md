## Why

The Routines tab currently renders a static placeholder with no data or interaction. As the P0 entry point for the core loop (Crear rutina -> Iniciar workout), users need a working routine list to browse active routines, start workouts, archive unused routines, and create new ones. This screen unlocks the full routines-to-workout flow.

## What Changes

- Replace the placeholder `src/app/routines.tsx` with a data-driven routine list screen using `RoutineRepo.getAll()`.
- Render a `FlashList` of `RoutineCard` components showing routine name, number of days, and exercise count.
- Support swipe-to-archive on routine cards via `RoutineRepo.archive()`.
- Show suggested template cards (PPL, Upper/Lower, Full Body) when the user has fewer than 2 active routines.
- Display an `EmptyState` component when there are zero active routines.
- Add a FAB (floating action button) that navigates to the routine creation screen.
- Keep the screen component thin: data fetching via repository, UI composition via presentational components.

## Capabilities

### New Capabilities
- `routine-list-screen`: Routine list screen with active/archived separation, swipe-to-archive, suggested templates, empty state, and FAB navigation to create routine.

### Modified Capabilities

## Impact

- Modifies `src/app/routines.tsx` (replaces placeholder).
- Adds new components: `RoutineCard`, `EmptyState`, `SuggestedTemplates`, `FAB` under `src/components/routine/` or `src/components/ui/`.
- Reads from `RoutineRepo` (already implemented and tested).
- Depends on existing base tab navigation and theme provider.
- No new dependencies required.
