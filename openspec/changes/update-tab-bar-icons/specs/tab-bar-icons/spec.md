# Tab Bar Icons

## Purpose

Define the icon assets and rendering behavior for the bottom tab navigation bar, ensuring cross-platform visibility and clear active/inactive state differentiation.

## ADDED Requirements

### Requirement: Cross-platform tab icons
Each tab in the bottom navigation bar SHALL render a visible icon on both iOS and Android platforms.

#### Scenario: Icons render on iOS
- **WHEN** the tab bar renders on an iOS device
- **THEN** each tab displays its designated icon image

#### Scenario: Icons render on Android
- **WHEN** the tab bar renders on an Android device
- **THEN** each tab displays its designated icon image

### Requirement: Active and inactive icon states
Each tab SHALL display a distinct icon variant for its active and inactive states.

#### Scenario: Active tab shows filled icon
- **WHEN** a tab is the currently selected tab
- **THEN** the tab displays its filled (active) icon variant

#### Scenario: Inactive tab shows outlined icon
- **WHEN** a tab is not the currently selected tab
- **THEN** the tab displays its outlined (inactive) icon variant

### Requirement: Tab-specific iconography
Each of the four primary tabs SHALL have its own semantically appropriate icon.

#### Scenario: Home tab icon
- **WHEN** the Home tab is visible
- **THEN** it displays a home or house icon

#### Scenario: Routines tab icon
- **WHEN** the Routines tab is visible
- **THEN** it displays a list or clipboard icon

#### Scenario: History tab icon
- **WHEN** the History tab is visible
- **THEN** it displays a clock or calendar-history icon

#### Scenario: Settings tab icon
- **WHEN** the Settings tab is visible
- **THEN** it displays a gear or cog icon
