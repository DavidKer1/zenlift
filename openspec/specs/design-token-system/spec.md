# design-token-system Specification

## Purpose
TBD - created by archiving change modernize-ui-design. Update Purpose after archive.
## Requirements
### Requirement: Dark-first color palette
The system SHALL provide a dark-first Material color palette with tonal surface levels, primary/secondary/tertiary brand colors, danger colors, success color for completed states, and text colors with opacity tiers.

#### Scenario: Background color is warm deep black
- **WHEN** the theme tokens are queried for the background color
- **THEN** the value SHALL be `#141218`

#### Scenario: Surface hierarchy has Material container levels
- **WHEN** components request surface colors
- **THEN** the tokens SHALL include `surface` (`#141218`), `surfaceContainerLow` (`#1D1B20`), `surfaceContainer` (`#211F24`), `surfaceContainerHigh` (`#2B292F`), and `surfaceContainerHighest` (`#36343A`)

#### Scenario: Surface tint is available
- **WHEN** components request surface tint colors
- **THEN** the tokens SHALL include `surfaceTint` (`#CFBCFF`)

#### Scenario: Text is white with opacity variations
- **WHEN** components request text colors
- **THEN** the tokens SHALL include `textPrimary` (100% white), `textBody` (85% white), `textSecondary` (50% white), and `textDisabled` (30% white)

#### Scenario: Brand and status colors are explicit
- **WHEN** the color palette is inspected
- **THEN** the tokens SHALL include primary `#CFBCFF`, primaryContainer `#6750A4`, tertiary `#E7C365`, error `#FFB4AB`, and success `#5EE08D`
- **AND** green SHALL be reserved for success or completed states, not primary actions

### Requirement: Typography scale
The system SHALL define a typography scale using Inter for UI text and JetBrains Mono for data.

#### Scenario: Inter is used for UI headings and body
- **WHEN** `display-lg`, `headline-lg`, `headline-lg-mobile`, `headline-md`, `body-lg`, `body-md`, or `label-caps` typography tokens are queried
- **THEN** the font family SHALL be Inter

#### Scenario: JetBrains Mono is used for data
- **WHEN** `data-lg` or `data-md` typography tokens are queried
- **THEN** the font family SHALL be JetBrains Mono

#### Scenario: Typography tokens match DESIGN.md sizes
- **WHEN** the typography scale is inspected
- **THEN** `display-lg` SHALL be 40px/700, `headline-lg` 32px/600, `headline-lg-mobile` 28px/600, `headline-md` 20px/600, `body-lg` 16px/400, `body-md` 14px/400, `data-lg` 24px/500, `data-md` 14px/500, `label-caps` 12px/600 with 0.05em letter spacing

### Requirement: Border radius tokens
The system SHALL provide border radius tokens with 12px as the default card radius.

#### Scenario: Card radius is 12px
- **WHEN** the `radius.lg` token is queried
- **THEN** the value SHALL be 12

#### Scenario: Pill radius for chips and badges
- **WHEN** the `radius.pill` token is queried
- **THEN** the value SHALL be 999 (fully rounded)

### Requirement: No shadow tokens
The system SHALL NOT provide any shadow or elevation tokens.

#### Scenario: Shadow tokens are absent
- **WHEN** the theme tokens are inspected
- **THEN** no `shadows` property or shadow-related values SHALL exist

### Requirement: Spacing tokens
The system SHALL define spacing tokens based on an 8px grid with named lateral margin and gutter values.

#### Scenario: Spacing matches DESIGN.md
- **WHEN** spacing tokens are queried
- **THEN** `marginLateral` SHALL be 24, `gutter` SHALL be 16, `stackSm` SHALL be 8, `stackMd` SHALL be 16, `stackLg` SHALL be 32, `paddingCard` SHALL be 20
