## MODIFIED Requirements

### Requirement: Settings screen renders all sections

The system SHALL render a Settings screen at the `/settings` route with three sections: General, Data, and Information, using the existing `ThemedText`, `ThemedView`, and theme hooks.

#### Scenario: General section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the General section shows weight unit toggle, theme selector, and weekly goal stepper

#### Scenario: Data section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Data section shows export, import, and delete all data options

#### Scenario: Information section is visible

- **WHEN** the Settings screen is displayed
- **THEN** the Information section shows app name, version, and build number

## REMOVED Requirements

### Requirement: Default rest timer slider

**Reason**: Breaks/rest timers are removed from the current launch phase and the Settings screen must not expose configuration for a future feature.

**Migration**: Remove the slider UI, its formatted time label, its accessibility labels, and writes to `default_rest`. Keep weight unit, theme, and weekly goal settings unchanged.
