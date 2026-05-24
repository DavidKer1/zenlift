## Why

Zenlift needs a product-specific theme before screens are built so the app consistently uses the athletic orange identity, light-first defaults, and accessible state colors. The current template theme is generic and does not persist user preference or expose the tokens needed by workout, history, and progress UI.

## What Changes

- Introduce Zenlift theme tokens for color, typography, spacing, border radius, and shadows.
- Add muscle group colors for the 13 seeded muscle groups.
- Create a `ThemeProvider` that supports light, dark, and system modes.
- Persist theme preference in MMKV and resolve system color scheme when set to automatic.
- Wrap the root Expo Router layout with the Zenlift provider while keeping React Navigation theme integration.

## Capabilities

### New Capabilities
- `app-theme`: Theme tokens, muscle colors, persisted theme mode, and provider behavior for Zenlift UI.

### Modified Capabilities

## Impact

- Affects `src/theme/`, `src/providers/ThemeProvider.tsx`, existing themed components/hooks, and `src/app/_layout.tsx`.
- Introduces MMKV-backed preference storage for theme mode.
- Establishes primary `#F97316` usage and reserves green for success/completed states.
