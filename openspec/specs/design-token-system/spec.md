# design-token-system Specification

## Purpose
TBD - created by archiving change modernize-ui-design. Update Purpose after archive.
## Requirements
### Requirement: Monochromatic color palette
The system SHALL expose a dark-only color palette with 4 tonal surface levels, white text at 4 opacity tiers, and no accent colors.

#### Scenario: Background color is warm deep black
- **WHEN** the theme tokens are queried for the background color
- **THEN** the value SHALL be `#0C0B10`

#### Scenario: Surface hierarchy has four levels
- **WHEN** components request surface colors
- **THEN** the tokens SHALL include `surface` (`#18191D`), `surfaceElevated` (`#242329`), and `surfaceSecondary` (`#28272F`)

#### Scenario: Text is white with opacity variations
- **WHEN** components request text colors
- **THEN** the tokens SHALL include `textPrimary` (100% white), `textBody` (85% white), `textSecondary` (50% white), and `textDisabled` (30% white)

#### Scenario: No accent colors exist
- **WHEN** the color palette is inspected
- **THEN** no blue, green, orange, or purple accent tokens SHALL be present

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
The system SHALL expose border radius tokens with 12px as the default card radius.

#### Scenario: Card radius is 12px
- **WHEN** the `radius.lg` token is queried
- **THEN** the value SHALL be 12

#### Scenario: Pill radius for chips and badges
- **WHEN** the `radius.pill` token is queried
- **THEN** the value SHALL be 999 (fully rounded)

### Requirement: No shadow tokens
The system SHALL NOT expose any shadow or elevation tokens.

#### Scenario: Shadow tokens are absent
- **WHEN** the theme tokens are inspected
- **THEN** no `shadows` property or shadow-related values SHALL exist

### Requirement: Spacing tokens
The system SHALL define spacing tokens based on an 8px grid with named lateral margin and gutter values.

#### Scenario: Spacing matches DESIGN.md
- **WHEN** spacing tokens are queried
- **THEN** `marginLateral` SHALL be 24, `gutter` SHALL be 16, `stackSm` SHALL be 8, `stackMd` SHALL be 16, `stackLg` SHALL be 32, `paddingCard` SHALL be 20

