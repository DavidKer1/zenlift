## MODIFIED Requirements

### Requirement: Settings hook provides reactive values

The system SHALL provide a `useSettings` React hook that returns the current values for launch-phase settings and setter functions, and SHALL re-render consuming components when any setting changes via MMKV listener.

#### Scenario: Hook returns all settings

- **WHEN** `useSettings()` is called
- **THEN** the returned object contains `weightUnit`, `themeMode`, `weeklyGoal`, and their corresponding setter functions

#### Scenario: Component re-renders on change

- **WHEN** a setting value is changed via its setter
- **THEN** all components consuming `useSettings` re-render with the new value

## REMOVED Requirements

### Requirement: Default rest timer preference storage

**Reason**: Breaks/rest timers are removed from the current launch phase, so MMKV settings must not expose or depend on a `default_rest` preference.

**Migration**: Remove `defaultRest`, `setDefaultRest`, `DEFAULT_REST_RANGE`, and `SETTINGS_KEYS.defaultRest` from active settings contracts. Any existing `zenlift.settings.default_rest` value in MMKV is ignored and must not affect set completion.
