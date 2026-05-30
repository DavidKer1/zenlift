## MODIFIED Requirements

### Requirement: Weight unit preference storage
The Flutter app SHALL persist the user's weight unit preference (`kg` or `lb`) in a local settings store under the key `zenlift.settings.weight_unit` and default to `kg` when no value is stored.

#### Scenario: Default unit is kg
- **WHEN** no weight unit value exists in the local settings store
- **THEN** the settings provider returns `kg`.

#### Scenario: User changes to lb
- **WHEN** the weight unit is set to `lb`
- **THEN** subsequent reads return `lb`
- **AND** the value persists after app restart.

#### Scenario: Invalid value falls back to default
- **WHEN** a non-`kg`/`lb` value is stored under the namespaced key
- **THEN** the settings provider returns `kg`.

### Requirement: Theme mode preference storage
The Flutter app SHALL persist the theme mode (`light`, `dark`, or `system`) in the local settings store under the key `zenlift.settings.theme_mode` and default to `dark` when no value is stored.

#### Scenario: Default theme is dark
- **WHEN** no theme mode value exists in the local settings store
- **THEN** the settings provider returns `dark`.

#### Scenario: User selects system mode
- **WHEN** theme mode is set to `system`
- **THEN** subsequent reads return `system`
- **AND** the active palette follows the device color scheme.

### Requirement: Weekly goal preference storage
The Flutter app SHALL persist the user's weekly workout goal as an integer from 1 to 7 in the local settings store under the key `zenlift.settings.weekly_goal` and default to `3` when no value is stored.

#### Scenario: Default weekly goal is 3
- **WHEN** no weekly goal value exists in the local settings store
- **THEN** the settings provider returns `3`.

#### Scenario: User changes weekly goal
- **WHEN** weekly goal is set to `5`
- **THEN** subsequent reads return `5`
- **AND** the value persists after app restart.

#### Scenario: Out-of-range value clamps to bounds
- **WHEN** weekly goal is set to `0` or `8`
- **THEN** the value is clamped to `1` or `7` respectively before being stored.

### Requirement: Onboarding completion storage
The Flutter app SHALL persist onboarding completion in the local settings store under the key `zenlift.settings.onboarding_completed`.

#### Scenario: Onboarding completion persists
- **WHEN** the user completes or skips onboarding
- **THEN** onboarding completion is stored
- **AND** app restart opens the post-onboarding flow.

### Requirement: Settings store provides reactive values
The Flutter app SHALL provide Riverpod settings providers that expose current launch-phase settings and setter functions, and SHALL notify consuming widgets when settings change.

#### Scenario: Provider returns all settings
- **WHEN** the settings provider is read
- **THEN** the returned value contains `weightUnit`, `themeMode`, `weeklyGoal`, `onboardingCompleted`, and their corresponding setter functions.

#### Scenario: Widget rebuilds on change
- **WHEN** a setting value is changed via its setter
- **THEN** all widgets watching the setting provider rebuild with the new value.

### Requirement: Settings namespace isolation
The Flutter settings store SHALL prefix all settings keys with `zenlift.settings.` to avoid collisions with other local storage consumers.

#### Scenario: All keys use the namespace prefix
- **WHEN** any setting is read or written
- **THEN** the local settings key starts with `zenlift.settings.`.
