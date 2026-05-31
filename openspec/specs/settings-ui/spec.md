# settings-ui

## Purpose

Defines the Settings screen UI at `/settings`, including sections (Training, Appearance, Data), controls (weight toggle, theme selector, goal stepper), theming, and scroll behavior.

## Requirements

### Requirement: Settings screen renders all sections

The system SHALL render a Settings screen at the `/settings` route with three sections: Training, Appearance, and Data, using the existing Flutter theme and shared widgets.

#### Scenario: Training section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Training section shows weight unit toggle and weekly goal stepper

#### Scenario: Appearance section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Appearance section shows the theme selector

#### Scenario: Data section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Data section shows share, import, and delete all data options

### Requirement: Weight unit toggle

The Settings screen SHALL provide a toggle or segmented control to switch between kg and lb, reading from and writing to the `weight_unit` SharedPreferences setting.

#### Scenario: Toggle shows current unit

- **WHEN** `weight_unit` is `kg`
- **THEN** the toggle displays kg as selected

#### Scenario: Toggle changes to lb

- **WHEN** the user taps the lb option
- **THEN** `weight_unit` is set to `lb` and the toggle updates

### Requirement: Theme selector

The Settings screen SHALL provide a selector for theme mode (light/dark/system) that updates the theme state and persists via the `theme_mode` SharedPreferences setting.

#### Scenario: Theme selector shows current mode

- **WHEN** the current theme mode is `light`
- **THEN** the selector highlights `light`

#### Scenario: Selecting dark mode updates theme

- **WHEN** the user selects `dark`
- **THEN** the app theme changes to dark immediately

#### Scenario: Selecting system mode updates theme

- **WHEN** the user selects `system`
- **THEN** the theme follows the device color scheme

### Requirement: Weekly goal stepper

The Settings screen SHALL provide a stepper control for the weekly workout goal (1-7), reading from and writing to the `weekly_goal` SharedPreferences setting.

#### Scenario: Stepper displays current goal

- **WHEN** `weekly_goal` is `4`
- **THEN** the stepper displays `4`

#### Scenario: Increment changes value

- **WHEN** the user taps the increment button
- **THEN** the value increases by 1 (up to maximum 7)

#### Scenario: Decrement changes value

- **WHEN** the user taps the decrement button
- **THEN** the value decreases by 1 (down to minimum 1)

### Requirement: Settings screen uses the app color scheme

The Settings screen SHALL use the shared Flutter dark-first color scheme, including primary (`#CFBCFF`) and primary container (`#6750A4`) tokens for interactive selected states, and SHALL NOT use green except for success/confirmation states.

#### Scenario: Interactive elements use app primary tokens

- **WHEN** the settings screen renders
- **THEN** toggles, steppers, chips, and primary buttons use the app primary or primary container colors

#### Scenario: Delete button uses danger color

- **WHEN** the delete all data button renders
- **THEN** it uses the danger color, not primary or success colors

### Requirement: Settings screen is scrollable

The Settings screen SHALL use a scrollable Flutter layout to accommodate all sections without overflow on smaller devices.

#### Scenario: All sections are reachable

- **WHEN** the Settings screen is displayed on a device with 640px height
- **THEN** all three sections are accessible via scrolling
