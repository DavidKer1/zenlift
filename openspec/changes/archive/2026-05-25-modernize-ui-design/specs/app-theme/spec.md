# App Theme (Delta)

## MODIFIED Requirements

### Requirement: Theme tokens
The app theme SHALL expose Zenlift color tokens for the monochromatic dark palette with 4 surface levels and white text at 4 opacity tiers. Typography SHALL use Inter for UI and JetBrains Mono for data. No shadow tokens SHALL be exposed.

#### Scenario: Primary brand color is absent
- **WHEN** components read the theme tokens
- **THEN** no `primary` color token using a hue-based accent SHALL exist; the highest-contrast action element SHALL be the white-on-black button token (`buttonPrimary: '#FFFFFF'`)

#### Scenario: Surface hierarchy has four tonal levels
- **WHEN** components query surface tokens
- **THEN** `background` SHALL be `#0C0B10`, `surface` SHALL be `#18191D`, `surfaceElevated` SHALL be `#242329`, and `surfaceSecondary` SHALL be `#28272F`

#### Scenario: Text hierarchy uses opacity
- **WHEN** components query text tokens
- **THEN** `textPrimary` SHALL be white at 100%, `textBody` at 85%, `textSecondary` at 50%, and `textDisabled` at 30%

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

### Requirement: Root provider integration
The root app layout SHALL wrap the app with the Zenlift theme provider.

#### Scenario: App routes can read theme
- **WHEN** a route component calls the Zenlift theme hook
- **THEN** it receives the active tokens from the provider
