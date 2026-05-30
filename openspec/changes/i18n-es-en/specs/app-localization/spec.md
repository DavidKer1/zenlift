## ADDED Requirements

### Requirement: App resolves supported language from device locale
The system SHALL resolve the app language from the device locale at startup and SHALL support exactly English (`en`) and Spanish (`es`) for this change.

#### Scenario: Spanish device locale resolves to Spanish
- **WHEN** the device locale is `es`, `es-MX`, `es-ES`, or `es-419`
- **THEN** the app language SHALL resolve to `es`

#### Scenario: English device locale resolves to English
- **WHEN** the device locale is `en`, `en-US`, or `en-GB`
- **THEN** the app language SHALL resolve to `en`

#### Scenario: Unsupported device locale falls back to English
- **WHEN** the device locale is unsupported or unavailable
- **THEN** the app language SHALL resolve to `en`

### Requirement: App provides English and Spanish translation resources
The system SHALL provide complete English and Spanish translation resources for all current user-visible app copy.

#### Scenario: Resource keys remain in parity
- **WHEN** the translation resource tests inspect English and Spanish resources
- **THEN** every translation key present in English SHALL also be present in Spanish
- **AND** every translation key present in Spanish SHALL also be present in English

#### Scenario: Dynamic copy supports interpolation and pluralization
- **WHEN** UI copy includes dynamic values such as workout counts, completed set counts, import record counts, routine names, step numbers, or weekly goals
- **THEN** the rendered text SHALL use translation interpolation and pluralization rather than manual string concatenation

### Requirement: Root app renders through the localization provider
The system SHALL mount a localization provider at the app root before rendering normal navigation or onboarding content.

#### Scenario: Provider wraps root navigation
- **WHEN** the root layout renders
- **THEN** the root navigation SHALL be rendered within the i18n provider
- **AND** all descendant screens and shared components SHALL be able to access translations through the React translation hook

#### Scenario: Startup avoids a visible fallback-language flash
- **WHEN** the device language is resolved during app startup
- **THEN** the app SHALL avoid visibly rendering English fallback copy and then switching to Spanish copy on Spanish-configured devices

### Requirement: Current app UI renders localized copy
The system SHALL render localized copy for current tabs, screens, shared components, alerts, placeholders, and accessibility labels.

#### Scenario: Navigation and onboarding copy are localized
- **WHEN** the app renders tab navigation or onboarding
- **THEN** tab accessibility labels, onboarding headings, onboarding CTAs, progress-dot labels, unit labels, weekly-goal labels, and skip copy SHALL render in the resolved app language

#### Scenario: Core workout loop copy is localized
- **WHEN** the user creates a routine, starts a workout, logs sets, finishes a session, or views workout summary and history
- **THEN** visible copy, button labels, empty states, placeholders, alerts, and accessibility labels in those flows SHALL render in the resolved app language

#### Scenario: Supporting screens are localized
- **WHEN** the user views Home, Exercise Library, Exercise Detail, Settings, import/export actions, or delete-data confirmation UI
- **THEN** visible copy, button labels, empty states, placeholders, alerts, and accessibility labels in those surfaces SHALL render in the resolved app language

### Requirement: Presentation formatting is locale-aware
The system SHALL format dates, month labels, numbers, percentages, durations, weights, volumes, and personal record values according to the resolved app language.

#### Scenario: Dates and month labels use resolved locale
- **WHEN** Home, Exercise Detail, Recent History, PR lists, or Workout Summary render date or month text
- **THEN** the date or month text SHALL be formatted with the locale corresponding to the resolved app language

#### Scenario: Numeric workout values use resolved locale
- **WHEN** the app renders volume, percentages, PR values, or decimal weight values
- **THEN** the number formatting SHALL use the locale corresponding to the resolved app language

#### Scenario: Workout units remain user preference values
- **WHEN** the app renders weight or volume units
- **THEN** the unit SHALL remain based on the user's weight unit setting (`kg` or `lb`)
- **AND** the unit SHALL NOT be translated into a different measurement system solely because the app language changed

### Requirement: Persisted data remains language-neutral
The system SHALL NOT persist translated UI strings in local storage, database rows, route parameters, or import/export payloads.

#### Scenario: Workout summary route data remains semantic
- **WHEN** the app navigates to Workout Summary after finishing a workout
- **THEN** the route payload SHALL contain semantic values such as IDs, enums, dates, counts, duration, and volume
- **AND** translated labels SHALL be computed at render time

#### Scenario: SQLite and MMKV stay language-neutral
- **WHEN** the app saves routines, exercises, sessions, settings, active workout state, or data portability metadata
- **THEN** the saved values SHALL NOT include translated UI labels

#### Scenario: User-authored text is not translated
- **WHEN** the app renders a user-created routine name, exercise name, session name, or session note
- **THEN** the app SHALL display the stored user-authored text as written

### Requirement: Active Workout localization preserves logging performance
The system SHALL localize Active Workout without adding expensive per-row formatter creation or unstable translation objects in hot render paths.

#### Scenario: Set rows avoid formatter creation
- **WHEN** Active Workout renders set rows while the timer updates every second
- **THEN** set rows SHALL NOT instantiate new `Intl.NumberFormat` or `Intl.DateTimeFormat` objects during each row render

#### Scenario: Translated labels remain current after language initialization
- **WHEN** Active Workout renders after the localization provider has resolved the app language
- **THEN** active workout headers, empty states, add-set labels, add-exercise labels, finish labels, and alerts SHALL render in the resolved app language

#### Scenario: Workout autosave behavior is unchanged
- **WHEN** the user completes or edits a set after localization is added
- **THEN** the existing local autosave and active-session recovery behavior SHALL continue without requiring network access or schema changes

### Requirement: Localization behavior is covered by automated tests
The system SHALL include automated tests for locale resolution, resource parity, and shared locale-aware formatting.

#### Scenario: Locale resolution tests pass
- **WHEN** tests run for locale resolution
- **THEN** Spanish variants SHALL resolve to `es`
- **AND** unsupported locales SHALL resolve to `en`

#### Scenario: Resource parity tests pass
- **WHEN** tests run for translation resources
- **THEN** English and Spanish resources SHALL contain matching keys

#### Scenario: Formatter tests pass
- **WHEN** tests run for shared i18n formatters
- **THEN** durations, weights, and other shared presentation values SHALL produce deterministic output for English and Spanish
