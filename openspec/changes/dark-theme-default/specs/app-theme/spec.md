## MODIFIED Requirements

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
