## Context

The current theme is a generic Expo starter color map in `src/constants/theme.ts`, with `useColorScheme` but no persisted app-level theme mode. Zenlift requires a light-first theme, primary orange `#F97316`, and green reserved for success/completed states.

## Goals / Non-Goals

**Goals:**
- Centralize Zenlift tokens under `src/theme/`.
- Support `light`, `dark`, and `system` theme modes.
- Persist explicit user preference in MMKV.
- Expose a provider and hook for app screens/components.
- Keep React Navigation theme values derived from Zenlift tokens.

**Non-Goals:**
- Do not polish every screen's visual design.
- Do not implement settings UI for changing theme mode.
- Do not replace all components outside the minimum provider integration.

## Decisions

- Store theme mode as a small MMKV value because it is lightweight, frequently read, and does not belong in SQLite.
- Resolve `system` mode at render time using React Native color scheme so OS changes can apply without restart.
- Keep tokens plain TypeScript objects for low overhead and easy native usage.
- Include muscle colors separately from generic UI colors so exercise badges can use stable semantic colors later.

## Risks / Trade-offs

- MMKV native dependency setup -> Ensure the package is installed in the foundation change before wiring persistence.
- Dark mode contrast gaps -> Define dark tokens now, but leave full screen-by-screen dark polish to the later visual polish task.
- Duplicate theme APIs -> Migrate starter hooks to re-export or consume the new provider rather than maintaining two color systems.
