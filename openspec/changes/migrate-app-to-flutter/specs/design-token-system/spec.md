## MODIFIED Requirements

### Requirement: Monochromatic color palette
The Flutter theme SHALL expose the Zenlift color palette as Dart constants and ThemeData values, preserving tonal surfaces, white text opacity tiers, lavender primary, and green only for success or completed states.

#### Scenario: Color constants match design tokens
- **WHEN** Flutter color tokens are queried from `flutter-version/lib/theme`
- **THEN** the values match `DESIGN.md` for background, surface hierarchy, text opacity tiers, primary lavender, and success green.

#### Scenario: Green remains success-only
- **WHEN** Flutter widgets use green styling
- **THEN** the usage is limited to success, completed, or positive-result states
- **AND** green is not used as the primary brand color.

### Requirement: Typography scale
The Flutter theme SHALL expose typography tokens as Dart constants and `TextTheme` styles using Inter for UI text and JetBrains Mono for data.

#### Scenario: ThemeData contains typography
- **WHEN** the app builds `ThemeData`
- **THEN** headings and body styles use Inter
- **AND** data styles use JetBrains Mono.

### Requirement: Border radius tokens
The Flutter theme SHALL expose radius tokens as Dart constants and reusable shape helpers.

#### Scenario: Radius constants are available
- **WHEN** Flutter widgets request standard card, input, or pill radius values
- **THEN** the values come from `flutter-version/lib/theme` tokens instead of hard-coded local values.

### Requirement: No shadow tokens
The Flutter theme SHALL NOT introduce shadow or elevation tokens for the Zenlift visual system.

#### Scenario: Flutter components avoid decorative shadows
- **WHEN** migrated components render cards, sheets, or list rows
- **THEN** they use tonal surface colors and borders rather than decorative shadows.

### Requirement: Spacing tokens
The Flutter theme SHALL expose spacing tokens as Dart constants based on the 8px grid and named lateral margin, gutter, stack, and card padding values.

#### Scenario: Spacing constants are available
- **WHEN** Flutter layout code requests standard spacing
- **THEN** the values come from `flutter-version/lib/theme` spacing constants.

### Requirement: Visual parity protection
The Flutter design token system SHALL include golden tests that protect migrated screen and component parity against approved references.

#### Scenario: Golden tests guard token regressions
- **WHEN** `cd flutter-version && flutter test test/golden` runs
- **THEN** it verifies representative screens and shared components against the current Zenlift token system.
