# App Theme

## Purpose

Define and provide the Zenlift design system through a theme provider with color tokens, typography, spacing, and theme mode persistence.

## Requirements

### Requirement: Theme tokens
The app theme SHALL expose Zenlift color, typography, spacing, radius, and shadow tokens for light and dark appearances.

#### Scenario: Primary brand color is available
- **WHEN** components read the theme tokens
- **THEN** the primary color is `#F97316`

#### Scenario: Success color is separate from primary
- **WHEN** components read success/completed state tokens
- **THEN** those tokens are distinct from the primary orange token

### Requirement: Theme mode preference
The app theme SHALL support `light`, `dark`, and `system` theme modes and persist the selected mode in MMKV. The default mode SHALL be `dark` when no stored preference exists.

#### Scenario: User preference persists
- **WHEN** a theme mode is saved and the app restarts
- **THEN** the provider initializes with the saved mode

#### Scenario: System mode follows device scheme
- **WHEN** the saved theme mode is `system`
- **THEN** the active palette follows the current device color scheme

#### Scenario: Default theme is dark
- **WHEN** no theme mode preference has ever been stored
- **THEN** the provider initializes with dark mode

### Requirement: Muscle group colors
The app theme SHALL define stable display colors for the 13 seeded muscle groups.

#### Scenario: Muscle colors are complete
- **WHEN** the muscle color map is inspected
- **THEN** it contains one color entry for each seeded muscle group

### Requirement: Root provider integration
The root app layout SHALL wrap the app with the Zenlift theme provider.

#### Scenario: App routes can read theme
- **WHEN** a route component calls the Zenlift theme hook
- **THEN** it receives the active tokens from the provider
