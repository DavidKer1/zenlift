## 1. Dependencies And Setup

- [x] 1.1 Install expo-file-system, expo-sharing, and expo-document-picker packages
- [x] 1.2 Create `src/features/settings/constants.ts` with MMKV key constants and default values (weight_unit=`kg`, theme_mode=`light`, weekly_goal=`3`, default_rest=`90`)
- [x] 1.3 Verify MMKV instance ID `zenlift-settings` is consistent with ThemeProvider

## 2. Settings Storage Hook

- [x] 2.1 Create `src/features/settings/useSettings.ts` hook that creates shared MMKV instance and exposes `weightUnit`/`themeMode`/`weeklyGoal`/`defaultRest` state with setters
- [x] 2.2 Implement value clamping for weekly goal (1-7) and default rest (30-300) in setters
- [x] 2.3 Add MMKV `addOnValueChangedListener` to keep state reactive across components
- [x] 2.4 Add fallback to defaults when stored values are invalid or missing

## 3. Settings Screen - General Section

- [x] 3.1 Replace `src/app/settings.tsx` placeholder with ScrollView-based layout using ThemedText, ThemedView, and SafeAreaView
- [x] 3.2 Add kg/lb segmented toggle using `useSettings` hook, with primary orange accent
- [x] 3.3 Add theme selector (light/dark/system) that calls `useZenliftTheme().setMode` and syncs with settings hook
- [x] 3.4 Add weekly goal stepper with +/- buttons, min 1, max 7, displaying current value
- [x] 3.5 Add default rest timer slider (30-300 seconds) with formatted time label (m:ss)

## 4. Settings Screen - Data Section

- [x] 4.1 Add "Export data" button that reads all SQLite tables via repositories, serializes to JSON with .zenlift extension, and shares via expo-sharing
- [x] 4.2 Add Zod schema for .zenlift file validation (export format)
- [x] 4.3 Add "Import data" button that uses expo-document-picker to select .zenlift file, validates with Zod, and merges by UUID into SQLite
- [x] 4.4 Add "Delete all data" button with danger styling (red) and two-step confirmation flow: warning Alert then prompt to type "BORRAR"
- [x] 4.5 Implement delete all SQLite rows (all tables, preserving structure) and clear MMKV

## 5. Information Section And Polish

- [x] 5.1 Add Information section displaying app name "Zenlift", version from expo-constants, and build number
- [x] 5.2 Ensure all interactive elements use athletic orange (#F97316) as primary; delete uses danger red
- [x] 5.3 Verify Settings screen scrolls properly on small devices (all sections reachable)
- [x] 5.4 Add accessibility labels to toggle, stepper, slider, and buttons

## 6. Verification

- [ ] 6.1 Verify kg/lb toggle persists after app restart
- [ ] 6.2 Verify theme changes immediately and persists
- [ ] 6.3 Verify weekly goal and rest timer persist after app restart
- [ ] 6.4 Run typecheck (`npx tsc --noEmit`) and verify no TypeScript errors
- [ ] 6.5 Run existing Jest tests to ensure no regressions
