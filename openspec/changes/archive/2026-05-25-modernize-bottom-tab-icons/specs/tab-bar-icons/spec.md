## ADDED Requirements

### Requirement: Modern minimalist icon system
The tab bar SHALL use a visually consistent, modern, minimalist icon set for all four primary tabs.

#### Scenario: Icons share one visual style
- **WHEN** the bottom tab bar renders
- **THEN** all tab icons SHALL use a consistent icon family, stroke/fill style, size, and optical weight

#### Scenario: New dependency is avoided when installed packages satisfy requirements
- **WHEN** an installed icon package provides all required tab icons and active/inactive variants
- **THEN** the implementation SHALL use the installed package instead of adding a new dependency

## MODIFIED Requirements

### Requirement: Tab-specific iconography
Each of the four primary tabs SHALL have its own semantically appropriate minimalist icon.

#### Scenario: Home tab icon
- **WHEN** the Home tab is visible
- **THEN** it displays a four-square grid or dashboard icon

#### Scenario: Routines tab icon
- **WHEN** the Routines tab is visible
- **THEN** it displays a list, clipboard, or workout-plan icon

#### Scenario: History tab icon
- **WHEN** the History tab is visible
- **THEN** it displays a clock, history, or calendar-history icon

#### Scenario: Settings tab icon
- **WHEN** the Settings tab is visible
- **THEN** it displays a gear or cog icon
