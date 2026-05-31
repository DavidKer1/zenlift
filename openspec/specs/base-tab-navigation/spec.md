# Base Tab Navigation

## Purpose

Provide the primary tab-based navigation shell for the Zenlift app with four main tabs and theme-aware styling.
## Requirements
### Requirement: Icon-only tabs remain accessible
The tab bar SHALL hide visual tab labels while preserving accessible names for every tab target.

#### Scenario: Screen reader announces tab destination
- **WHEN** a screen reader focuses any bottom tab target
- **THEN** the tab target SHALL provide the destination name: Home, Routines, History, or Settings

#### Scenario: Labels are not visually rendered
- **WHEN** the bottom tab bar renders
- **THEN** no visible text label SHALL render inside the tab bar for Home, Routines, History, or Settings

### Requirement: Four primary tabs
The app shell SHALL provide four primary tabs: Home, Routines, History, and Settings.

#### Scenario: Tabs are visible
- **WHEN** the app root layout renders
- **THEN** the tab bar shows four icon-only tab targets for Home, Routines, History, and Settings
- **AND** each target SHALL preserve an accessible name for its destination

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
The tab bar SHALL use minimalist icon presentation for all primary tabs. Active and inactive states SHALL be distinguished through opacity, theme-aware color/tint where practical, and optional filled/outline icon pairing without changing icon size, icon container size, or tab item layout.

#### Scenario: Active tab is visually distinct without accent color
- **WHEN** a tab is active
- **THEN** its icon and label SHALL render at the active opacity level
- **AND** it SHALL NOT rely on blue, green, orange, purple, gradient, glow, badge-like accent styling, or increased icon size to indicate selection

#### Scenario: Inactive tabs remain legible
- **WHEN** a tab is inactive
- **THEN** its icon and label SHALL render with reduced opacity
- **AND** the icon SHALL remain recognizable without decorative treatment

#### Scenario: Active and inactive icons share one size
- **WHEN** a tab changes between inactive and active states
- **THEN** the icon SHALL keep the same configured icon size as the inactive state
- **AND** the icon container SHALL NOT resize or scale as part of the active state

### Requirement: Tab interactions use Flutter animation motion
The tab bar SHALL use Flutter animation primitives for modern, minimal focus and press transitions. Motion SHALL be subtle, finite, responsive, and limited to color and/or opacity changes for icon active-state animation.

#### Scenario: Focus transition animates subtly
- **WHEN** the active tab changes
- **THEN** the newly active tab SHALL animate its visual state using Flutter animations
- **AND** the animation SHALL be limited to subtle opacity and/or theme-aware color transitions
- **AND** the animation SHALL NOT scale the icon up or down

#### Scenario: Press feedback animates without layout shift
- **WHEN** the user presses a tab
- **THEN** the pressed tab SHALL provide animated feedback without changing tab bar height or reflowing neighboring tabs
- **AND** the pressed tab SHALL NOT change the icon size

#### Scenario: Animation remains minimal during workout use
- **WHEN** tab animations run
- **THEN** they SHALL NOT loop, pulse indefinitely, bounce heavily, glow, resize icons, or block navigation input

### Requirement: Starter navigation is retired
The active navigation surface SHALL not show starter-template tabs.

#### Scenario: Starter tab is absent
- **WHEN** the tab bar renders
- **THEN** it does not include an Explore tab
