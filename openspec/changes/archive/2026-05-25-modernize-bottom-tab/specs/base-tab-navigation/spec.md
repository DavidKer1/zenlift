## ADDED Requirements

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
- **AND** the bottom safe area SHALL not obscure any tab icon or label

### Requirement: Tab icons use minimalist active states
The tab bar SHALL use minimalist icon presentation for all primary tabs. Active and inactive states SHALL be distinguished through opacity, subtle scale, and optional filled/outline icon pairing without introducing accent colors.

#### Scenario: Active tab is visually distinct without accent color
- **WHEN** a tab is active
- **THEN** its icon and label SHALL render at the active opacity level
- **AND** it SHALL NOT rely on blue, green, orange, purple, gradient, glow, or badge-like accent styling to indicate selection

#### Scenario: Inactive tabs remain legible
- **WHEN** a tab is inactive
- **THEN** its icon and label SHALL render with reduced opacity
- **AND** the icon SHALL remain recognizable without decorative treatment

### Requirement: Tab interactions use Reanimated motion
The tab bar SHALL use `react-native-reanimated` for modern, minimal focus and press transitions. Motion SHALL be subtle, finite, and responsive.

#### Scenario: Focus transition animates subtly
- **WHEN** the active tab changes
- **THEN** the newly active tab SHALL animate its visual state using Reanimated
- **AND** the animation SHALL be limited to subtle opacity, scale, or translation changes

#### Scenario: Press feedback animates without layout shift
- **WHEN** the user presses a tab
- **THEN** the pressed tab SHALL provide Reanimated feedback without changing tab bar height or reflowing neighboring tabs

#### Scenario: Animation remains minimal during workout use
- **WHEN** tab animations run
- **THEN** they SHALL NOT loop, pulse indefinitely, bounce heavily, glow, or block navigation input

## REMOVED Requirements

### Requirement: Tab bar uses frosted glass pill design
**Reason**: The requested visual direction replaces the floating rounded frosted pill with a modern minimal black bottom bar that has straight edges and no border radius.

**Migration**: Replace the floating pill container styles with the straight black bottom bar requirements above and remove blur-dependent styling from the active navigation surface.