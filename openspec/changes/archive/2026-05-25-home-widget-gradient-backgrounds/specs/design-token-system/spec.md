## MODIFIED Requirements

### Requirement: Monochromatic color palette

The system SHALL expose a monochromatic color palette with 4 tonal surface levels, a gradient endpoint variant for card backgrounds, white text at 4 opacity tiers, and no accent colors.

#### Scenario: Background color is warm deep black

- **WHEN** the theme tokens are queried for the background color
- **THEN** the value SHALL be `#0C0B10`

#### Scenario: Surface hierarchy has four levels plus gradient endpoint

- **WHEN** components request surface colors
- **THEN** the tokens SHALL include `surface` (`#18191D`), `surfaceElevated` (`#242329`), `surfaceSecondary` (`#28272F`), and `surfaceElevatedDark` (`#1F1E24`)

#### Scenario: Light mode gradient endpoint is a subtle darkening of surfaceElevated

- **WHEN** the light mode theme is active
- **THEN** `surfaceElevatedDark` SHALL be `#EBEBEB` (approximately 3% darker than `surfaceElevated` at `#F0F0F0`)

#### Scenario: Text is white with opacity variations

- **WHEN** components request text colors
- **THEN** the tokens SHALL include `textPrimary` (100% white), `textBody` (85% white), `textSecondary` (50% white), and `textDisabled` (30% white)

#### Scenario: No accent colors exist

- **WHEN** the color palette is inspected
- **THEN** no blue, green, orange, or purple accent tokens SHALL be present
