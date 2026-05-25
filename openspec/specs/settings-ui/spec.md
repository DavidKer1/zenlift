# settings-ui

## Purpose

Defines the Settings screen UI at `/settings`, including sections (General, Data, Information), controls (weight toggle, theme selector, goal stepper, rest slider), theming, and scroll behavior.

## Requirements

### Requirement: Settings screen renders all sections

The system SHALL render a Settings screen at the `/settings` route with three sections: General, Data, and Information, using the existing `ThemedText`, `ThemedView`, and theme hooks.

#### Scenario: General section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the General section shows weight unit toggle, theme selector, weekly goal stepper, and rest timer slider

#### Scenario: Data section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Data section shows export, import, and delete all data options

#### Scenario: Information section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Information section shows app name, version, and build number

### Requirement: Weight unit toggle

The Settings screen SHALL provide a toggle or segmented control to switch between kg and lb, reading from and writing to the `weight_unit` MMKV setting.

#### Scenario: Toggle shows current unit

- **WHEN** `weight_unit` is `kg`
- **THEN** the toggle displays kg as selected

#### Scenario: Toggle changes to lb

- **WHEN** the user taps the lb option
- **THEN** `weight_unit` is set to `lb` and the toggle updates

### Requirement: Theme selector

The Settings screen SHALL provide a selector for theme mode (light/dark/system) that calls the ThemeProvider's `setMode` function and persists via the `theme_mode` MMKV setting.

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

The Settings screen SHALL provide a stepper control for the weekly workout goal (1-7), reading from and writing to the `weekly_goal` MMKV setting.

#### Scenario: Stepper displays current goal

- **WHEN** `weekly_goal` is `4`
- **THEN** the stepper displays `4`

#### Scenario: Increment changes value

- **WHEN** the user taps the increment button
- **THEN** the value increases by 1 (up to maximum 7)

#### Scenario: Decrement changes value

- **WHEN** the user taps the decrement button
- **THEN** the value decreases by 1 (down to minimum 1)

### Requirement: Default rest timer slider

The Settings screen SHALL provide a slider control for the default rest timer (30-300 seconds), reading from and writing to the `default_rest` MMKV setting.

#### Scenario: Slider displays current value

- **WHEN** `default_rest` is `120`
- **THEN** the slider position reflects `120` seconds

#### Scenario: Slider changes value

- **WHEN** the user drags the slider to `180`
- **THEN** `default_rest` is set to `180`

#### Scenario: Slider value label shows formatted time

- **WHEN** the slider is at `90`
- **THEN** the label displays `1:30` (minutes:seconds format)

### Requirement: Settings screen uses light theme by default

The Settings screen SHALL use athletic orange (`#F97316`) as the primary accent for interactive elements like toggles, sliders, and buttons, and SHALL NOT use green except for success/confirmation states.

#### Scenario: Interactive elements use orange

- **WHEN** the settings screen renders
- **THEN** toggles, sliders, and primary buttons use the primary orange color

#### Scenario: Delete button uses danger color

- **WHEN** the delete all data button renders
- **THEN** it uses the danger color (red), not green or orange

### Requirement: Settings screen is scrollable

The Settings screen SHALL use a ScrollView to accommodate all sections without overflow on smaller devices.

#### Scenario: All sections are reachable

- **WHEN** the Settings screen is displayed on a device with 640px height
- **THEN** all three sections are accessible via scrolling
