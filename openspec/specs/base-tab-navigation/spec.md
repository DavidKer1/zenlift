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
The tab navigator SHALL use Zenlift theme colors for active and inactive states, applying tinted image icons that render on both iOS and Android.

#### Scenario: Active tab uses primary color
- **WHEN** a tab is active
- **THEN** its icon displays the filled variant and uses the Zenlift primary color for tinting

#### Scenario: Inactive tab uses muted color
- **WHEN** a tab is inactive
- **THEN** its icon displays the outlined variant and uses the Zenlift mutedText color for tinting

### Requirement: Starter navigation is retired
The active navigation surface SHALL not expose the default Expo starter Explore tab.

#### Scenario: Starter tab is absent
- **WHEN** the tab bar renders
- **THEN** it does not include an Explore tab
