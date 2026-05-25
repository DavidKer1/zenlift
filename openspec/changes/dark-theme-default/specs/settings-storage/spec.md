## MODIFIED Requirements

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
