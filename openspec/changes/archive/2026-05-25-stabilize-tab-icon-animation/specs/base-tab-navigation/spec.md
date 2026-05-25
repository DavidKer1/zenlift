## MODIFIED Requirements

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

### Requirement: Tab interactions use Reanimated motion
The tab bar SHALL use `react-native-reanimated` for modern, minimal focus and press transitions. Motion SHALL be subtle, finite, responsive, and limited to color and/or opacity changes for icon active-state animation.

#### Scenario: Focus transition animates subtly
- **WHEN** the active tab changes
- **THEN** the newly active tab SHALL animate its visual state using Reanimated
- **AND** the animation SHALL be limited to subtle opacity and/or theme-aware color transitions
- **AND** the animation SHALL NOT scale the icon up or down

#### Scenario: Press feedback animates without layout shift
- **WHEN** the user presses a tab
- **THEN** the pressed tab SHALL provide Reanimated feedback without changing tab bar height or reflowing neighboring tabs
- **AND** the pressed tab SHALL NOT change the icon size

#### Scenario: Animation remains minimal during workout use
- **WHEN** tab animations run
- **THEN** they SHALL NOT loop, pulse indefinitely, bounce heavily, glow, resize icons, or block navigation input
