# settings-storage

## Purpose

Defines the persistent storage of user preferences (weight unit, theme mode, weekly goal, default rest timer) in MMKV with namespaced keys, defaults, clamping, and a reactive `useSettings` hook.

## Requirements

### Requirement: Weight unit preference storage

The system SHALL persist the user's weight unit preference (`kg` or `lb`) in MMKV under the key `zenlift.settings.weight_unit` and default to `kg` when no value is stored.

#### Scenario: Default unit is kg

- **WHEN** no weight_unit value exists in MMKV
- **THEN** the settings hook returns `kg`

#### Scenario: User changes to lb

- **WHEN** the weight unit is set to `lb`
- **THEN** subsequent reads return `lb` and the value persists after app restart

#### Scenario: Invalid value falls back to default

- **WHEN** a non-`kg`/`lb` value is stored in the MMKV key
- **THEN** the settings hook returns `kg`

### Requirement: Theme mode preference storage

The system SHALL persist the theme mode (`light`, `dark`, or `system`) in MMKV under the key `zenlift.settings.theme_mode` and default to `dark` when no value is stored.

#### Scenario: Default theme is dark

- **WHEN** no theme_mode value exists in MMKV
- **THEN** the settings hook returns `dark`

#### Scenario: User selects light mode

- **WHEN** theme mode is set to `light`
- **THEN** subsequent reads return `light` and the theme updates immediately

#### Scenario: User selects dark mode

- **WHEN** theme mode is set to `dark`
- **THEN** subsequent reads return `dark` and the theme updates immediately

#### Scenario: User selects system mode

- **WHEN** theme mode is set to `system`
- **THEN** subsequent reads return `system` and the active palette follows the device color scheme

### Requirement: Weekly goal preference storage

The system SHALL persist the user's weekly workout goal (integer 1-7) in MMKV under the key `zenlift.settings.weekly_goal` and default to `3` when no value is stored.

#### Scenario: Default weekly goal is 3

- **WHEN** no weekly_goal value exists in MMKV
- **THEN** the settings hook returns `3`

#### Scenario: User changes weekly goal

- **WHEN** weekly goal is set to `5`
- **THEN** subsequent reads return `5` and the value persists after app restart

#### Scenario: Out-of-range value clamps to bounds

- **WHEN** weekly goal is set to `0` or `8`
- **THEN** the value is clamped to `1` or `7` respectively before being stored

### Requirement: Default rest timer preference storage

The system SHALL persist the default rest timer in seconds (integer 30-300) in MMKV under the key `zenlift.settings.default_rest` and default to `90` when no value is stored.

#### Scenario: Default rest timer is 90 seconds

- **WHEN** no default_rest value exists in MMKV
- **THEN** the settings hook returns `90`

#### Scenario: User adjusts rest timer

- **WHEN** default rest is set to `120`
- **THEN** subsequent reads return `120` and the value persists after app restart

#### Scenario: Out-of-range value clamps to bounds

- **WHEN** default rest is set to `10` or `500`
- **THEN** the value is clamped to `30` or `300` respectively before being stored

### Requirement: Settings hook provides reactive values

The system SHALL provide a `useSettings` React hook that returns the current values for all four settings and setter functions, and SHALL re-render consuming components when any setting changes via MMKV listener.

#### Scenario: Hook returns all settings

- **WHEN** `useSettings()` is called
- **THEN** the returned object contains `weightUnit`, `themeMode`, `weeklyGoal`, `defaultRest`, and their corresponding setter functions

#### Scenario: Component re-renders on change

- **WHEN** a setting value is changed via its setter
- **THEN** all components consuming `useSettings` re-render with the new value

### Requirement: Settings MMKV namespace isolation

The system SHALL prefix all settings keys with `zenlift.settings.` to avoid collisions with other MMKV consumers.

#### Scenario: All keys use the namespace prefix

- **WHEN** any setting is read or written
- **THEN** the MMKV key starts with `zenlift.settings.`
