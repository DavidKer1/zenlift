## Why

Zenlift users need a Settings screen to configure weight units, theme, weekly goal, and rest timer defaults. They also need to export/import workout data for backup and device migration, and delete all data when resetting the app. Without this screen, users cannot change kg/lb after onboarding, persist preferences across restarts, or manage their data.

## What Changes

- Replace the placeholder `src/app/settings.tsx` with complete Settings UI
- Add MMKV-backed preference storage: `weight_unit`, `theme_preference`, `weekly_goal`, `default_rest`
- Add a `useSettings` hook that reads/writes MMKV keys and exposes reactive state
- Add kg/lb toggle that propagates across the app via shared settings
- Add theme selector (light/dark/system) that changes theme immediately
- Add weekly goal stepper (1-7 workouts/week)
- Add default rest timer slider (30-300 seconds)
- Add data export that generates a `.zenlift` JSON file via `expo-file-system` + `expo-sharing`
- Add data import that reads a `.zenlift` file via `expo-document-picker` and merges by UUID
- Add "Delete all data" with double-confirm requiring the user to type "BORRAR"
- Add app version display in an Information section

## Capabilities

### New Capabilities

- `settings-storage`: MMKV-backed key-value storage for user preferences (weight unit, theme mode, weekly goal, default rest timer) with reactive hooks
- `settings-ui`: Settings screen with General (kg/lb toggle, theme selector, weekly goal stepper, rest timer slider), Data (export, import, delete all), and Information (version) sections
- `data-export`: Export all workout data as a `.zenlift` JSON file and share via `expo-sharing`
- `data-import`: Import a `.zenlift` JSON file via `expo-document-picker` and merge data by UUID into SQLite
- `data-delete`: Delete all SQLite data after double-confirm requiring the user to type "BORRAR"

### Modified Capabilities

- `app-theme`: Theme mode read from shared MMKV key `weight_unit` must also serve the Settings storage layer. No requirement change — implementation detail only.

## Impact

- **New file**: `src/app/settings.tsx` (replaces placeholder)
- **New files**: `src/features/settings/useSettings.ts`, `src/features/settings/constants.ts`
- **New dependencies**: `expo-file-system`, `expo-sharing`, `expo-document-picker`
- **Affected files**: `src/providers/ThemeProvider.tsx` may share the MMKV instance ID or be read by the new settings hook
- **Data model**: No SQLite changes; settings use MMKV only (matches `app_settings` table intent: lightweight settings go to MMKV)
