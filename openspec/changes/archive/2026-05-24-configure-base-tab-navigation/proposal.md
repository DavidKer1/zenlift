## Why

The current app still exposes default starter screens, but Zenlift needs navigation that maps directly to the workout tracker MVP. A working tab shell lets later features land in the right product areas without rebuilding navigation each time.

## What Changes

- Configure Expo Router tabs for the main Zenlift areas: Home, Routines, History, and Settings.
- Replace starter routes and sample content with simple product placeholders.
- Use the Zenlift theme once available, including orange active tab color and accessible inactive states.
- Keep tab navigation stable across route changes and compatible with TypeScript typed routes.

## Capabilities

### New Capabilities
- `base-tab-navigation`: Root tab navigation and placeholder route behavior for Zenlift's MVP app shell.

### Modified Capabilities

## Impact

- Affects `src/app/_layout.tsx` and tab route files under `src/app/`.
- Removes or retires starter `explore` content from the active navigation surface.
- Depends on the theme provider change for final color integration.
