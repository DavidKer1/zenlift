## Why

Zenlift currently mixes Spanish and English UI copy across core screens, alerts, accessibility labels, and formatters, which makes the product feel inconsistent and limits use for English- or Spanish-configured devices. A small localization layer is needed now because the app already spans onboarding, routines, active workout, history, progress, settings, and data portability flows where hardcoded strings are spreading.

## What Changes

- Add a Spanish/English localization capability for all user-visible UI copy in the current app.
- Select the default app language from the device locale: Spanish device locales resolve to Spanish, and all other locales resolve to English.
- Add translation resources for English and Spanish with interpolation and pluralization support.
- Localize tabs, onboarding, home, routines, exercise library/detail, active workout, workout summary, history, settings, alerts, placeholders, and accessibility labels.
- Add locale-aware formatting for dates, numbers, percentages, durations, PR values, and workout volume while keeping database values language-neutral.
- Add tests for locale resolution, resource key parity, and shared formatters.
- Add `expo-localization`, `i18next`, and `react-i18next` as runtime dependencies.
- Do not add a manual language selector in Settings for this change.
- Do not persist translated strings in SQLite, MMKV, URL parameters, import/export payloads, or workout summaries.

## Capabilities

### New Capabilities

- `app-localization`: Covers Spanish/English app localization, device-locale language resolution, translation resources, locale-aware presentation formatting, and guarantees that persisted workout data stays language-neutral.

### Modified Capabilities

None.

## Impact

- Affected dependencies: `expo-localization`, `i18next`, `react-i18next`.
- Affected config: `app.json` plugins, `package.json`, and `pnpm-lock.yaml`.
- Affected root composition: `src/app/_layout.tsx` wraps app providers with an i18n provider.
- Affected UI: `src/app/*`, `src/components/home/*`, `src/components/routine/*`, `src/components/workout/*`, `src/components/exercise/*`, `src/components/charts/*`, `src/features/onboarding/*`, `src/features/routine/*`, `src/features/exercises/*`, `src/features/settings/*`, and workout flow alert helpers.
- Affected tests: new i18n tests plus updates to any assertions that currently expect hardcoded Spanish or English copy.
- No database schema changes.
- No backend, network, analytics, account, or cloud dependency changes.
- Active Workout performance remains critical: translation and `Intl` formatter creation must be memoized outside hot set-row render paths.
