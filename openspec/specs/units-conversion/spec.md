# units-conversion Specification

## Purpose
TBD - created by archiving change utils-units-conversion. Update Purpose after archive.
## Requirements
### Requirement: Convert kilograms to pounds

The system SHALL provide a function `kgToLb` that converts a weight in kilograms to pounds using the conversion factor 2.20462 and rounds the result to 2 decimal places.

#### Scenario: Normal conversion

- **WHEN** `kgToLb(100)` is called
- **THEN** the result SHALL be `220.46`

#### Scenario: Zero weight

- **WHEN** `kgToLb(0)` is called
- **THEN** the result SHALL be `0`

#### Scenario: Negative weight

- **WHEN** `kgToLb(-10)` is called
- **THEN** the result SHALL be `-22.05`

#### Scenario: NaN input

- **WHEN** `kgToLb(NaN)` is called
- **THEN** the result SHALL be `NaN`

### Requirement: Convert pounds to kilograms

The system SHALL provide a function `lbToKg` that converts a weight in pounds to kilograms using the conversion factor 2.20462 and rounds the result to 2 decimal places.

#### Scenario: Normal conversion

- **WHEN** `lbToKg(220.46)` is called
- **THEN** the result SHALL be `100`

#### Scenario: Zero weight

- **WHEN** `lbToKg(0)` is called
- **THEN** the result SHALL be `0`

#### Scenario: Negative weight

- **WHEN** `lbToKg(-225)` is called
- **THEN** the result SHALL be `-102.06`

### Requirement: Bidirectional weight conversion

The system SHALL provide a function `convertWeight` that accepts a numeric value, a source unit, and a target unit, and returns the converted value. Converting to the same unit SHALL return the original value unchanged.

#### Scenario: Convert kg to lb

- **WHEN** `convertWeight(62.5, 'kg', 'lb')` is called
- **THEN** the result SHALL be `137.79`

#### Scenario: Convert lb to kg

- **WHEN** `convertWeight(135, 'lb', 'kg')` is called
- **THEN** the result SHALL be `61.24`

#### Scenario: Same unit conversion

- **WHEN** `convertWeight(100, 'kg', 'kg')` is called
- **THEN** the result SHALL be `100`

### Requirement: Format weight with unit label

The system SHALL provide a function `formatWeight` that returns a string with the numeric value (rounded to 2 decimal places) followed by the unit label.

#### Scenario: Format kilograms

- **WHEN** `formatWeight(62.5, 'kg')` is called
- **THEN** the result SHALL be `"62.5 kg"`

#### Scenario: Format pounds

- **WHEN** `formatWeight(135, 'lb')` is called
- **THEN** the result SHALL be `"135 lb"`

#### Scenario: Format with trailing zeros

- **WHEN** `formatWeight(100, 'kg')` is called
- **THEN** the result SHALL be `"100 kg"`

### Requirement: Format weight without unit label

The system SHALL provide a function `formatWeightShort` that returns the numeric value as a string rounded to 2 decimal places, without the unit label.

#### Scenario: Short format kilograms

- **WHEN** `formatWeightShort(62.5, 'kg')` is called
- **THEN** the result SHALL be `"62.5"`

#### Scenario: Short format pounds

- **WHEN** `formatWeightShort(135, 'lb')` is called
- **THEN** the result SHALL be `"135"`

### Requirement: Get standard gym plate increment

The system SHALL provide a function `getIncrement` that returns the standard smallest plate increment for the given unit system: 2.5 kg for `'kg'` and 5 lb for `'lb'`.

#### Scenario: Increment for kilograms

- **WHEN** `getIncrement('kg')` is called
- **THEN** the result SHALL be `2.5`

#### Scenario: Increment for pounds

- **WHEN** `getIncrement('lb')` is called
- **THEN** the result SHALL be `5`

