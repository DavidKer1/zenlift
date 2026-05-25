## Context

Zenlift currently defaults to light theme. The `ThemeProvider` (`src/providers/ThemeProvider.tsx`) uses MMKV key `zenlift.theme.mode` (legacy) and falls back to `'light'` when no stored value exists. Separately, `useSettings` (`src/features/settings/useSettings.ts`) uses key `zenlift.settings.theme_mode` and defaults to `'light'` via `DEFAULT_SETTINGS` in `constants.ts`. When the user changes theme via settings UI, `setThemeMode` writes to both keys to keep them in sync.

The app is a workout tracker used in gyms where dark mode is preferred. Changing the default requires touching two fallback values and updating documentation/specs.

## Goals / Non-Goals

**Goals:**
- Change the default theme mode from `'light'` to `'dark'` for new users and users who have never explicitly set a preference
- Update specs to reflect the new default
- Update all project documentation to reference dark as the default

**Non-Goals:**
- Changing the theme token definitions (colors, spacing, shadows remain the same)
- Changing the settings UI (theme picker still shows light/dark/system options)
- Migrating existing users who already have an explicit theme preference stored
- Adding a dark-mode-only design or removing light mode

## Decisions

**Decision 1: Change both fallback values simultaneously**
- The `DEFAULT_SETTINGS.themeMode` in `constants.ts` and the `getStoredThemeMode` fallback in `ThemeProvider.tsx` both change from `'light'` to `'dark'`
- **Rationale**: Both codepaths need consistency. `useSettings` is the canonical settings source; `ThemeProvider` is the legacy/standalone theme resolver. If only one changes, a race or mismatch could produce inconsistent behavior.
- **Alternative considered**: Change only the `DEFAULT_SETTINGS` and have `ThemeProvider` read from `useSettings`. Rejected because it introduces a dependency from the provider to the settings feature, increasing complexity for a simple default change.

**Decision 2: Keep the existing MMKV key structure**
- No key renames or migrations needed. Both `zenlift.theme.mode` (legacy) and `zenlift.settings.theme_mode` continue to work.
- **Rationale**: The change only affects the *absence* of a stored value. Existing stored values are honored regardless.

**Decision 3: Treat this as a spec-level change for both `app-theme` and `settings-storage`**
- Both specs have requirements that explicitly state "default to `light`". These requirement statements change.
- **Rationale**: Specs are the source of truth for behavior. If the default changes, the spec must change.

## Risks / Trade-offs

- **[Risk] Existing users without an explicit preference will switch to dark on next launch** → **Mitigation**: This is intentional. Users who want light can switch back via Settings > Theme. The settings screen is easily accessible.
- **[Risk] Docs may have stale references to light as default after this change** → **Mitigation**: The tasks include a docs sweep. All `.md` files in `docs/` and root are updated in this same change.
