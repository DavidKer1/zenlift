## Why

The Routines empty state currently can be clipped by the bottom tab/FAB area, so users cannot reliably inspect or reach lower content on small mobile viewports. The “Crear primera rutina” CTA also appears actionable but does not reliably open the routine creation form, blocking the first step of the core loop.

## What Changes

- Make the Routines empty state vertically scrollable so bottom content remains reachable above the tab bar and floating controls.
- Derive bottom padding and floating offsets from the actual safe-area-aware bottom tab height instead of hardcoded values.
- Ensure the “Crear primera rutina” empty-state button and routine FAB navigate to the existing `/routine/create` route.
- Add mobile web regression coverage for opening the routine creation screen from the Routines empty state.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `routine-list-screen`: Empty-state content must remain reachable on mobile, and create CTAs must navigate to the existing `/routine/create` screen.

## Impact

- Affected code: `src/app/routines.tsx`, `e2e/playwright/core-loop.spec.ts`.
- Existing shared helpers/components: `getBottomTabBarHeight`, `FAB`, `EmptyState`, `SuggestedTemplates`.
- No database schema, repository API, storage, or dependency changes.
