# settings-storage

## Purpose

Defines the persistent storage of user preferences (weight unit, theme mode, weekly goal) in SharedPreferences with namespaced keys, defaults, clamping, and reactive app state.

## Requirements

### Requirement: Weight unit preference storage

The system SHALL persist the user's weight unit preference (`kg` or `lb`) in SharedPreferences under the key `zenlift.settings.weight_unit` and default to `kg` when no value is stored.

#### Scenario: Default unit is kg

- **WHEN** no weight_unit value exists in SharedPreferences
- **THEN** the settings state returns `kg`

#### Scenario: User changes to lb

- **WHEN** the weight unit is set to `lb`
- **THEN** subsequent reads return `lb` and the value persists after app restart

#### Scenario: Invalid value falls back to default

- **WHEN** a non-`kg`/`lb` value is stored in the SharedPreferences key
- **THEN** the settings state returns `kg`

### Requirement: Theme mode preference storage

The system SHALL persist the theme mode (`light`, `dark`, or `system`) in SharedPreferences under the key `zenlift.settings.theme_mode` and default to `dark` when no value is stored.

#### Scenario: Default theme is dark

- **WHEN** no theme_mode value exists in SharedPreferences
- **THEN** the settings state returns `dark`

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

The system SHALL persist the user's weekly workout goal (integer 1-7) in SharedPreferences under the key `zenlift.settings.weekly_goal` and default to `3` when no value is stored.

#### Scenario: Default weekly goal is 3

- **WHEN** no weekly_goal value exists in SharedPreferences
- **THEN** the settings state returns `3`

#### Scenario: User changes weekly goal

- **WHEN** weekly goal is set to `5`
- **THEN** subsequent reads return `5` and the value persists after app restart

#### Scenario: Out-of-range value clamps to bounds

- **WHEN** weekly goal is set to `0` or `8`
- **THEN** the value is clamped to `1` or `7` respectively before being stored

### Requirement: Settings state provides reactive values

The system SHALL provide a Riverpod-backed settings controller or equivalent app state that returns the current values for launch-phase settings and setter functions, and SHALL update consuming widgets when any setting changes.

#### Scenario: Hook returns all settings

- **WHEN** the settings state is read
- **THEN** the returned object contains `weightUnit`, `themeMode`, `weeklyGoal`, and their corresponding setter functions

#### Scenario: Component re-renders on change

- **WHEN** a setting value is changed via its setter
- **THEN** all widgets consuming the settings state rebuild with the new value

### Requirement: Settings SharedPreferences namespace isolation

The system SHALL prefix all settings keys with `zenlift.settings.` to avoid collisions with other SharedPreferences consumers.

#### Scenario: All keys use the namespace prefix

- **WHEN** any setting is read or written
- **THEN** the SharedPreferences key starts with `zenlift.settings.`
