## Context

Zenlift is a local-first Expo/React Native workout tracker. The current UI contains Spanish, English, and mixed copy across the onboarding flow, tab navigation, home dashboard, routines, exercise library, Active Workout, workout summary, history, settings, alerts, placeholders, and accessibility labels.

The product scope is intentionally mobile-first and focused on the loop: create routine, start workout, log sets, finish session, view progress. Localization must support that loop without introducing a backend, account system, analytics, or a larger settings surface. Active Workout is the highest-risk area because set logging must remain fast and workout data must never be lost.

Expo SDK is currently `~55.0.26`. Context7 Expo SDK 55 docs identify `expo-localization` as the package for reading device locale through `getLocales()`, installed with `npx expo install expo-localization`, and configurable through the `expo-localization` config plugin. Context7 react-i18next docs identify `i18next` initialized with `initReactI18next` and `useTranslation()` as the React integration pattern.

## Goals / Non-Goals

**Goals:**

- Support exactly English and Spanish UI copy for current app screens and shared UI components.
- Resolve default language from the device locale: Spanish locale variants use Spanish, and unsupported locales fall back to English.
- Centralize translation resources with parity tests so English and Spanish keys remain aligned.
- Support interpolation and pluralization for workout counts, set counts, weekly goals, import counts, and dynamic alerts.
- Add memoized locale-aware formatting for dates, numbers, percentages, durations, PR values, weight, and volume.
- Keep persisted data language-neutral and local-first.
- Preserve Active Workout responsiveness and autosave behavior.

**Non-Goals:**

- No manual language selector in Settings.
- No backend or remote translation loading.
- No database schema migration solely for translated UI copy.
- No translation of user-authored routine names, exercise names, session notes, or import/export field names.
- No expansion beyond Spanish and English.
- No redesign of screens outside the translation changes.

## Decisions

### Use `expo-localization` for device language

The app will install `expo-localization`, add the config plugin to `app.json`, and read `getLocales()[0]?.languageTag` during app startup.

Alternatives considered:

- React Native `I18nManager`: insufficient because it focuses on directionality and does not provide enough locale data for language selection.
- Manual Settings language selector: out of scope because the requested default is device configuration.

### Use `i18next` and `react-i18next` for translation

The app will initialize a single in-memory i18next instance with `en` and `es` resources, `fallbackLng: 'en'`, `react.useSuspense: false`, and `initReactI18next`. UI code will use `useTranslation()` for translated strings.

Alternatives considered:

- A custom `t()` helper: too small for pluralization, interpolation, and future testability across many screens.
- Loading JSON translations remotely: unnecessary for a local-first MVP and adds network risk.

### Add a small `src/i18n` module boundary

The implementation will create:

- `src/i18n/locales.ts` for language types and resolution.
- `src/i18n/resources/en.ts` and `src/i18n/resources/es.ts` for copy.
- `src/i18n/i18n.ts` for initialization.
- `src/i18n/I18nProvider.tsx` for app startup language sync.
- `src/i18n/useI18nFormatters.ts` for memoized presentation formatters.

This keeps translation infrastructure separate from domain calculations, repositories, and screen-specific components.

### Mount i18n at the root

`I18nProvider` will wrap the existing root providers in `src/app/_layout.tsx`. It may render `null` until the device language is resolved and i18next is synced, preventing a visible flash from English fallback to Spanish on Spanish devices.

### Keep data language-neutral

Repositories, SQLite rows, MMKV state, workout summaries passed in route params, and import/export payloads must not store translated copy. They should store IDs, enums, dates, and numbers. Screens and components translate those values at render time.

### Memoize formatting and protect Active Workout

`Intl.NumberFormat` and `Intl.DateTimeFormat` instances will be created inside `useMemo()` in `useI18nFormatters()`. Active Workout set rows and list item render callbacks should receive primitive translated labels or stable memoized label objects from parent components, not create formatters per row render.

### Treat existing literal labels as examples after localization

Existing specs often mention concrete Spanish or English labels. The new `app-localization` capability establishes the cross-cutting requirement that those labels render in the resolved app language. Existing screen behavior remains the same unless this change explicitly alters copy source, locale formatting, or accessibility label localization.

## Risks / Trade-offs

- [Risk] Active Workout re-renders every second because of the elapsed timer. Creating translators or `Intl` formatters in hot rows could slow set logging. → Mitigation: memoize formatters by locale and pass stable translated labels from parent components.
- [Risk] Resource files can drift, causing missing copy in one language. → Mitigation: add a resource parity test that flattens English and Spanish resources and requires matching keys.
- [Risk] Persisted translated strings would corrupt historical semantics after language changes. → Mitigation: keep translation in UI only and add spec requirements that forbid persisted translated UI copy.
- [Risk] Existing tests may assert literal Spanish or English strings. → Mitigation: update tests to assert localized output through test language setup or stable translation keys where appropriate.
- [Risk] Spanish copy in this repository currently mixes accented and unaccented text. → Mitigation: keep resources centralized so a later copy polish can update text in one place without code changes.
- [Risk] Graphify is stale for this change planning session. → Mitigation: rely on direct file inspection for implementation and rebuild graph after significant code changes if `/graphify src` is available.

## Migration Plan

1. Install `expo-localization`, `i18next`, and `react-i18next`; add the Expo config plugin.
2. Add locale resolution, resources, i18next initialization, provider, and formatter tests.
3. Mount `I18nProvider` in the root layout.
4. Migrate UI copy in feature slices: tabs/onboarding/settings, home, routines, exercises, active workout, summary/history.
5. Run a hardcoded-string audit for alerts, placeholders, accessibility labels, and visible text.
6. Run unit tests, typecheck, lint, and available web/mobile smoke tests.

Rollback is straightforward before release: remove the root provider, remove new dependencies and config plugin, and revert feature-slice translation changes. No database rollback is required because no schema or persisted data format changes are planned.

## Open Questions

- Should Spanish resources use full accented copy now, or keep ASCII-only copy to match current file editing constraints and polish accents later?
- Should unsupported non-English locales always fall back to English, or should Spanish be fallback for Latin America in a later product decision?
- Should muscle groups eventually gain explicit English display fields in seed data, or should English use the existing canonical `name` field indefinitely?
