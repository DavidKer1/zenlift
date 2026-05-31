# App Theme

## Purpose

Define and provide the Zenlift design system through a theme provider with color tokens, typography, spacing, and theme mode persistence.
## Requirements
### Requirement: Theme tokens
The app theme SHALL provide Zenlift color tokens for the dark-first Material palette with tonal surface levels, primary/secondary/tertiary brand colors, danger colors, success color for completed states, and text colors with opacity tiers. Typography SHALL use Inter for UI and JetBrains Mono for data. No shadow tokens SHALL be provided.

#### Scenario: Primary brand color is defined
- **WHEN** components read the theme tokens
- **THEN** the active color scheme SHALL include primary `#CFBCFF`, onPrimary `#381E72`, primaryContainer `#6750A4`, and onPrimaryContainer `#E0D2FF`
- **AND** green SHALL be reserved for success or completed states, not primary actions

#### Scenario: Surface hierarchy has four tonal levels
- **WHEN** components query surface tokens
- **THEN** `background` SHALL be `#141218`, `surface` SHALL be `#141218`, `surfaceContainerLow` SHALL be `#1D1B20`, `surfaceContainer` SHALL be `#211F24`, and `surfaceContainerHigh` SHALL be `#2B292F`

#### Scenario: Text hierarchy uses opacity
- **WHEN** components query text tokens
- **THEN** `textPrimary` SHALL be white at 100%, `textBody` at 85%, `textSecondary` at 50%, and `textDisabled` at 30%

### Requirement: Theme mode preference
The app theme SHALL support `light`, `dark`, and `system` theme modes and persist the selected mode in SharedPreferences. The default mode SHALL be `dark` when no stored preference exists.

#### Scenario: User preference persists
- **WHEN** a theme mode is saved and the app restarts
- **THEN** the provider initializes with the saved mode

#### Scenario: System mode follows device scheme
- **WHEN** the saved theme mode is `system`
- **THEN** the active palette follows the current device color scheme

#### Scenario: Default theme is dark
- **WHEN** no theme mode preference has ever been stored
- **THEN** the provider initializes with dark mode

### Requirement: Root provider integration
The root app shell SHALL wrap the app with the Zenlift theme provider.

#### Scenario: App routes can read theme
- **WHEN** a route widget reads the Zenlift theme
- **THEN** it receives the active tokens from the provider
