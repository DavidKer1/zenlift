# Base Tab Navigation (Delta)

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Four primary tabs
The app shell SHALL expose four primary tabs: Home, Routines, History, and Settings.

#### Scenario: Tabs are visible
- **WHEN** the app root layout renders
- **THEN** the tab bar shows Home, Routines, History, and Settings

### Requirement: Theme-aware tab styling
The tab navigator SHALL use opacity-based styling for active and inactive states instead of color tinting.

#### Scenario: Active tab uses full opacity
- **WHEN** a tab is active
- **THEN** its icon and label SHALL render at 100% white opacity

#### Scenario: Inactive tabs use reduced opacity
- **WHEN** a tab is inactive
- **THEN** its icon and label SHALL render at 40% white opacity
