## Why

New users need a fast, skippable onboarding to set their weight unit and weekly goal before reaching the first workout. Without it, the app lacks default preferences, and the user lands on a home screen with no context. This flow must be minimal — 3 screens — and never block returning users.

## What Changes

- Create `src/app/onboarding.tsx` as the Expo Router route for the onboarding flow
- Create `src/features/onboarding/OnboardingScreen.tsx` as the thin screen component with 3 swipeable steps
- Step 1 (Bienvenida): logo, welcome copy, CTA to continue
- Step 2 (Unidad): kg/lb toggle selection
- Step 3 (Objetivo): stepper for 1–7 workouts/week
- Horizontal pagination with progress dots indicating current step
- Skip button on every step that jumps directly to completion
- On completion, persist `weight_unit` and `weekly_goal` to MMKV, set `onboarding_completed` flag in MMKV
- Guard in `src/app/_layout.tsx`: if `onboarding_completed` is `true`, redirect to Home; otherwise show onboarding
- No button to go back to onboarding once completed

## Capabilities

### New Capabilities

- `onboarding-flow`: 3-screen skippable onboarding with welcome screen, kg/lb unit toggle, weekly goal stepper (1–7), progress dots, skip button, MMKV-backed preference persistence, and layout guard to skip onboarding when already completed

### Modified Capabilities

<!-- None -->

## Impact

- **New file**: `src/app/onboarding.tsx` (Expo Router route)
- **New file**: `src/features/onboarding/OnboardingScreen.tsx` (thin screen component)
- **Affected file**: `src/app/_layout.tsx` (add MMKV guard to redirect on completed flag)
- **Storage**: MMKV keys `weight_unit`, `weekly_goal`, `onboarding_completed`
- **Dependencies**: `react-native-mmkv` (already installed), no new dependencies
- **Data model**: No SQLite changes; preferences use MMKV only
