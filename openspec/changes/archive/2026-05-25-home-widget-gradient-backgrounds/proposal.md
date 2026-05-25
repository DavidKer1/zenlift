## Why

All home screen widget cards currently use a flat `surfaceElevated` background. Adding a subtle bottom-to-top linear gradient (slightly darker at the bottom, matching `surfaceElevated` at the top) introduces modern visual depth without breaking the monochromatic design system. This is a low-risk, purely aesthetic enhancement that elevates the perceived UI quality.

## What Changes

- Add new gradient color tokens (`surfaceElevatedDark`, one per mode) to the theme, representing the darker endpoint for card gradients (~3-5% darker than `surfaceElevated`)
- Create a reusable `GradientCard` wrapper component that applies the subtle linear gradient via `experimental_backgroundImage` (CSS gradients, New Architecture / Fabric)
- Apply the gradient background to all five home screen widget cards: `StartWorkoutButton` (secondary variant), `WorkoutCalendarWidget`, `WeeklyActivityCard`, `CurrentRoutineCard`, and `RecentPRsCard`
- Preserve the current solid `surfaceElevated` background as a fallback for environments without New Architecture support

## Capabilities

### New Capabilities

- `gradient-card-component`: A reusable gradient card wrapper component with a subtle bottom-to-top linear gradient, accepting children and standard card props

### Modified Capabilities

- `design-token-system`: Add `surfaceElevatedDark` tokens (one per mode) to define the gradient endpoint color for card backgrounds

## Impact

- **Components**: `StartWorkoutButton`, `WorkoutCalendarWidget`, `WeeklyActivityCard`, `CurrentRoutineCard`, `RecentPRsCard` — replace `backgroundColor: colors.surfaceElevated` with `GradientCard` wrapper
- **Theme**: `src/theme/index.ts` — add `surfaceElevatedDark` to both light and dark palettes
- **New file**: `src/components/ui/GradientCard.tsx` — reusable gradient wrapper
- **Dependencies**: `expo-linear-gradient` already installed; but prefer CSS gradients via `experimental_backgroundImage` (New Architecture required)
