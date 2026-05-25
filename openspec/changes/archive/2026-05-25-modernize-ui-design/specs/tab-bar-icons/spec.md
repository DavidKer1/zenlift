# Tab Bar Icons (Delta)

## MODIFIED Requirements

### Requirement: Active and inactive icon states
Each tab SHALL display distinct visual states for active and inactive using opacity rather than color tinting. Active icons SHALL render at 100% white opacity; inactive icons SHALL render at 40% white opacity.

#### Scenario: Active tab shows full-opacity icon
- **WHEN** a tab is the currently selected tab
- **THEN** the tab icon and label render at 100% white opacity

#### Scenario: Inactive tab shows reduced-opacity icon
- **WHEN** a tab is not the currently selected tab
- **THEN** the tab icon and label render at 40% white opacity

## ADDED Requirements

### Requirement: Icon variant selection
Each tab SHALL use a filled icon variant when active and an outlined variant when inactive, rendered in white.

#### Scenario: Active tab uses filled icon
- **WHEN** a tab is active
- **THEN** it displays a filled icon variant in white at 100% opacity

#### Scenario: Inactive tab uses outlined icon
- **WHEN** a tab is inactive
- **THEN** it displays an outlined icon variant in white at 40% white opacity
