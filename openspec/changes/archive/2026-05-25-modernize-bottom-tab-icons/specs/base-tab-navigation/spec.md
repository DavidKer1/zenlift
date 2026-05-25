## ADDED Requirements

### Requirement: Icon-only tabs remain accessible
The tab bar SHALL hide visual tab labels while preserving accessible names for every tab target.

#### Scenario: Screen reader announces tab destination
- **WHEN** a screen reader focuses any bottom tab target
- **THEN** the tab target SHALL expose the destination name: Home, Routines, History, or Settings

#### Scenario: Labels are not visually rendered
- **WHEN** the bottom tab bar renders
- **THEN** no visible text label SHALL render inside the tab bar for Home, Routines, History, or Settings

## MODIFIED Requirements

### Requirement: Four primary tabs
The app shell SHALL expose four primary tabs: Home, Routines, History, and Settings.

#### Scenario: Tabs are visible
- **WHEN** the app root layout renders
- **THEN** the tab bar shows four icon-only tab targets for Home, Routines, History, and Settings
- **AND** each target SHALL preserve an accessible name for its destination

### Requirement: Theme-aware tab styling
The tab navigator SHALL use opacity-based styling for active and inactive icon states instead of color tinting.

#### Scenario: Active tab uses full opacity
- **WHEN** a tab is active
- **THEN** its icon SHALL render at 100% white opacity

#### Scenario: Inactive tabs use reduced opacity
- **WHEN** a tab is inactive
- **THEN** its icon SHALL render at 40% white opacity

### Requirement: Tab bar uses straight black bottom design
The tab bar SHALL render as a full-width bottom navigation surface with a black background, straight edges, no border radius, no shadow, no visible border, and no blur-dependent styling. It SHALL preserve safe-area spacing and appropriate tab proportions for mobile use.

#### Scenario: Tab bar renders as straight bottom surface
- **WHEN** the tab bar renders
- **THEN** it SHALL occupy the bottom navigation area as a straight-edged black surface
- **AND** it SHALL NOT render as a floating container
- **AND** it SHALL NOT use border radius, shadow, visible border, or backdrop blur

#### Scenario: Tab targets preserve usable proportions
- **WHEN** the tab bar renders on a mobile viewport
- **THEN** each tab target SHALL remain at least 48px tall
- **AND** the four tabs SHALL share the available width evenly
- **AND** the bottom safe area SHALL not obscure any tab icon

### Requirement: Tab icons use minimalist active states
The tab bar SHALL use minimalist icon presentation for all primary tabs. Active and inactive states SHALL be distinguished through opacity, subtle scale, and optional filled/outline icon pairing without introducing accent colors or visible text labels.

#### Scenario: Active tab is visually distinct without accent color
- **WHEN** a tab is active
- **THEN** its icon SHALL render at the active opacity level
- **AND** it SHALL NOT rely on blue, green, orange, purple, gradient, glow, or badge-like accent styling to indicate selection

#### Scenario: Inactive tabs remain legible
- **WHEN** a tab is inactive
- **THEN** its icon SHALL render with reduced opacity
- **AND** the icon SHALL remain recognizable without decorative treatment
