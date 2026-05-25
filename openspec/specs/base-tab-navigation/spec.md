# Base Tab Navigation

## Purpose

Provide the primary tab-based navigation shell for the Zenlift app with four main tabs and theme-aware styling.
## Requirements
### Requirement: Four primary tabs
The app shell SHALL expose four primary tabs: Home, Routines, History, and Settings.

#### Scenario: Tabs are visible
- **WHEN** the app root layout renders
- **THEN** the tab bar shows Home, Routines, History, and Settings

### Requirement: Tab routes render placeholders
Each primary tab route SHALL render a stable placeholder screen for its product area.

#### Scenario: Home route renders
- **WHEN** the user opens the Home tab
- **THEN** a Home placeholder screen renders without starter instructional copy

#### Scenario: Routines route renders
- **WHEN** the user opens the Routines tab
- **THEN** a Routines placeholder screen renders without crashing

#### Scenario: History route renders
- **WHEN** the user opens the History tab
- **THEN** a History placeholder screen renders without crashing

#### Scenario: Settings route renders
- **WHEN** the user opens the Settings tab
- **THEN** a Settings placeholder screen renders without crashing

### Requirement: Theme-aware tab styling
The tab navigator SHALL use opacity-based styling for active and inactive states instead of color tinting.

#### Scenario: Active tab uses full opacity
- **WHEN** a tab is active
- **THEN** its icon and label SHALL render at 100% white opacity

#### Scenario: Inactive tabs use reduced opacity
- **WHEN** a tab is inactive
- **THEN** its icon and label SHALL render at 40% white opacity

### Requirement: Starter navigation is retired
The active navigation surface SHALL not expose the default Expo starter Explore tab.

#### Scenario: Starter tab is absent
- **WHEN** the tab bar renders
- **THEN** it does not include an Explore tab

### Requirement: Tab bar uses frosted glass pill design
The tab bar SHALL render as a floating rounded pill container with `#18191D` at 80% opacity, backdrop blur, 24px border radius, and horizontal margins. It SHALL have no shadow and no top border.

#### Scenario: Tab bar renders as floating pill
- **WHEN** the tab bar renders
- **THEN** it SHALL be a rounded container (24px radius) with `#18191D` at 80% opacity background
- **AND** it SHALL have horizontal margins (8px each side)
- **AND** it SHALL have bottom margin (24px)
- **AND** it SHALL NOT have a border or shadow

#### Scenario: Tab bar has backdrop blur on supported platforms
- **WHEN** the tab bar renders on a platform that supports backdrop blur
- **THEN** the tab bar SHALL apply backdrop blur effect

