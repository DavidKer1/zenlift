## 1. Dependencies And Configuration

- [x] 1.1 Install `expo-localization` with `npx expo install expo-localization`.
- [x] 1.2 Install `i18next` and `react-i18next` with `pnpm add i18next react-i18next`.
- [x] 1.3 Add `"expo-localization"` to the `app.json` Expo plugins array.
- [x] 1.4 Run `pnpm typecheck` and confirm dependency/config changes compile.

## 2. Core Localization Infrastructure

- [x] 2.1 Add `src/i18n/locales.ts` with `SupportedLanguage`, `DEFAULT_LANGUAGE`, `resolveSupportedLanguage()`, and `i18nLanguageToLocale()`.
- [x] 2.2 Add `src/i18n/__tests__/locales.test.ts` covering Spanish variants, English variants, unsupported locale fallback, and Intl locale mapping.
- [x] 2.3 Add `src/i18n/resources/en.ts`, `src/i18n/resources/es.ts`, and `src/i18n/resources/index.ts` with initial English and Spanish resources.
- [x] 2.4 Add `src/i18n/__tests__/resources.test.ts` to enforce English/Spanish resource key parity.
- [x] 2.5 Add `src/i18n/i18n.ts` initialized with `initReactI18next`, fallback language `en`, local resources, and Suspense disabled.
- [x] 2.6 Add `src/i18n/I18nProvider.tsx` that resolves device locale using `expo-localization` and syncs i18next before rendering children.
- [x] 2.7 Add `src/i18n/testing.ts` helper for forcing language in tests.
- [x] 2.8 Mount `I18nProvider` in `src/app/_layout.tsx` around the existing app providers.

## 3. Locale-Aware Formatters

- [x] 3.1 Add `src/i18n/useI18nFormatters.ts` with memoized number, percent, date, month, duration, weight, and volume formatters.
- [x] 3.2 Add `src/i18n/__tests__/formatters.test.ts` covering deterministic English and Spanish duration and weight formatting.
- [x] 3.3 Replace hardcoded `Intl.DateTimeFormat('en', ...)` usage in Home, PR, and calendar components with shared formatters.
- [x] 3.4 Replace manual presentation-only date formatting in exercise history and PR components with shared locale-aware formatters.

## 4. Root, Onboarding, Tabs, And Settings

- [x] 4.1 Localize tab accessibility labels in `src/components/app-tabs.tsx`.
- [x] 4.2 Localize onboarding headings, subtitles, CTAs, skip button, progress-dot labels, and unit/goal accessibility labels in `src/features/onboarding/OnboardingScreen.tsx`.
- [x] 4.3 Localize Settings section titles, setting rows, segmented-control options, action buttons, metadata labels, and accessibility labels in `src/app/settings.tsx`.
- [x] 4.4 Localize Settings export/import/delete alerts and large-file confirmation copy.
- [x] 4.5 Localize the destructive delete confirmation token so Spanish expects `BORRAR` and English expects `DELETE`.

## 5. Home Dashboard

- [x] 5.1 Localize Home greeting keys by time of day without changing local-time behavior.
- [x] 5.2 Localize Home start workout and quick workout CTAs.
- [x] 5.3 Localize Current Routine card labels, empty state, and start/create actions.
- [x] 5.4 Localize Weekly Activity card title, empty state, logged workout pluralization, and weekday labels.
- [x] 5.5 Localize Workout Calendar widget title, empty state, frequency labels, month labels, and repeat action labels.
- [x] 5.6 Localize Recent PR card title, empty state, PR type labels, PR values, and dates.

## 6. Routines Flow

- [x] 6.1 Localize Routines list title, loading/error/empty states, archive undo copy, and create CTA.
- [x] 6.2 Localize Routine create/edit route titles, submit labels, back labels, and not-found states.
- [x] 6.3 Localize RoutineForm labels, placeholders, goals, validation messages, discard-change alerts, and validation summary rendering.
- [x] 6.4 Localize RoutineHeader duplicate/archive/delete alerts and action labels.
- [x] 6.5 Localize DayEditor, DaySection, ExerciseRow, ExerciseConfigurator, ExercisePicker, SuggestedTemplates, and routine accessibility labels.
- [x] 6.6 Update `src/features/routine/routineFormSchema.test.ts` for localized validation behavior or stable validation keys.

## 7. Exercise Library And Detail

- [x] 7.1 Localize Exercise Library titles, search placeholder, filter labels, empty states, FAB accessibility, and create/edit exercise entry points.
- [x] 7.2 Localize ExerciseFormModal fields, placeholders, option pickers, save/loading labels, and validation copy.
- [x] 7.3 Centralize equipment and category enum labels through translation keys.
- [x] 7.4 Add a UI helper for muscle display names that uses Spanish display names for `es` and canonical names for `en`.
- [x] 7.5 Localize Exercise Detail title states, edit/delete/quick-start actions, delete alerts, and loading/error states.
- [x] 7.6 Localize Best Performance, Recent History, Exercise PR List, and Progress Chart labels and formatters.

## 8. Active Workout Flow

- [x] 8.1 Localize Active Workout modal loading state, empty state, add-exercise, add-set, finish, cancel, and fallback exercise copy.
- [x] 8.2 Localize WorkoutExerciseCard and SetRow headers, previous-value labels, input accessibility labels, and completion labels.
- [x] 8.3 Keep Active Workout formatter and translation objects memoized outside hot set-row render paths.
- [x] 8.4 Update memo comparisons for `WorkoutExerciseCard` and `SetRow` if new localized label props are introduced.
- [x] 8.5 Refactor `finishWorkoutFlow()` to receive localized copy from UI instead of hardcoding alert strings.
- [x] 8.6 Refactor `startWorkoutFlow()` alerts/options to use localized copy from callers or an injected copy object.
- [x] 8.7 Run active workout store and start-flow tests to verify autosave and recovery behavior remain unchanged.

## 9. Workout Summary And History

- [x] 9.1 Localize Workout Summary unavailable state, completion heading, metric labels, PR labels, comparison labels, notes label, notes placeholder, and navigation buttons.
- [x] 9.2 Replace direct summary weight-unit MMKV lookup with `SETTINGS_KEYS.weightUnit`.
- [x] 9.3 Flush pending summary notes on unmount so localization remounts or fast navigation do not drop unsaved notes.
- [x] 9.4 Localize History title, completed-sessions heading, and placeholder copy.
- [x] 9.5 Ensure workout summary route payloads remain semantic and do not include translated labels.

## 10. Audit And Verification

- [x] 10.1 Run a targeted hardcoded-string audit over `src/app`, `src/components`, and `src/features`.
- [x] 10.2 Replace remaining user-visible hardcoded strings in alerts, placeholders, accessibility labels, and visible text with translation keys.
- [ ] 10.3 Run `pnpm test -- --runInBand`.
- [x] 10.4 Run `pnpm typecheck`.
- [ ] 10.5 Run `pnpm lint`.
- [ ] 10.6 Run `pnpm test:agent:web` if the web smoke environment is available.
- [ ] 10.7 Smoke test Spanish and English device locales on mobile or emulator, including onboarding, settings delete confirmation, routine creation, active set logging, finish summary, and active-session recovery.
- [ ] 10.8 Rebuild Graphify with `/graphify src` if available and avoid committing ignored graph working files.
