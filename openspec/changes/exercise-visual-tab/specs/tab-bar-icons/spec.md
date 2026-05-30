## MODIFIED Requirements

### Requirement: Modern minimalist icon system
The tab bar SHALL use visually consistent, modern, minimalist icons for all five primary tabs.

#### Scenario: Icons share one visual style
- **WHEN** the bottom tab bar renders
- **THEN** all tab icons SHALL use consistent size, optical weight, tint, and active/inactive opacity behavior

#### Scenario: New dependency is avoided when installed packages satisfy requirements
- **WHEN** installed icon packages provide all required tab icons and active/inactive variants
- **THEN** the implementation SHALL use installed packages instead of adding a new dependency

### Requirement: Tab-specific iconography
Each of the five primary tabs SHALL have its own semantically appropriate minimalist icon.

#### Scenario: Home tab icon
- **WHEN** the Home tab is visible
- **THEN** it displays a four-square grid or dashboard icon

#### Scenario: Routines tab icon
- **WHEN** the Routines tab is visible
- **THEN** it displays a list, clipboard, or workout-plan icon

#### Scenario: Exercises tab icon
- **WHEN** the Ejercicios tab is visible
- **THEN** it displays a dumbbell or fitness-equipment icon

#### Scenario: History tab icon
- **WHEN** the History tab is visible
- **THEN** it displays a clock or calendar-history icon

#### Scenario: Settings tab icon
- **WHEN** the Settings tab is visible
- **THEN** it displays a gear or cog icon

#### Scenario: Tab icon identities are not duplicated
- **WHEN** the five tab definitions are inspected
- **THEN** no two tabs SHALL use the same inactive and active icon identity pair
