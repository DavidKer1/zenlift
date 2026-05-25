## Why

Zenlift is a workout tracker used primarily in gym environments where dark mode reduces eye strain under harsh fluorescent lighting and conserves battery on OLED devices. The current default of `light` forces every first-launch user to manually switch to dark mode. Changing the default to `dark` aligns the out-of-the-box experience with gym-context expectations and modern app conventions.

## What Changes

- Change the default theme mode from `light` to `dark` in the ThemeProvider fallback
- Update `settings-storage` spec: default `theme_mode` value changes from `light` to `dark`
- Update `app-theme` spec: default mode scenario changes to reflect `dark` as default
- Update all documentation `.md` files that reference the light theme as default
- **BREAKING**: Existing users who have never explicitly set a theme preference will switch from light to dark on next app launch

## Capabilities

### New Capabilities
- *None*

### Modified Capabilities
- `app-theme`: Default theme mode changes from `light` to `dark`; default-initialization scenario updated
- `settings-storage`: Default `theme_mode` preference changes from `light` to `dark`; fallback scenario updated

## Impact

- `src/providers/ThemeProvider.tsx`: change `'light'` fallback to `'dark'` in `getStoredThemeMode`
- `openspec/specs/app-theme/spec.md`: update default-mode scenarios
- `openspec/specs/settings-storage/spec.md`: update `theme_mode` default value and scenario
- `docs/` markdown files: update any references to light as default theme
- Root `.md` files (`AGENTS.md`, `CLAUDE.md`, `DESIGN.md`): update theme references if present
- No API, dependency, or backend changes
