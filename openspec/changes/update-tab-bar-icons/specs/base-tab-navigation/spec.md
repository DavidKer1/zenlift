# Base Tab Navigation (Delta)

## MODIFIED Requirements

### Requirement: Theme-aware tab styling
The tab navigator SHALL use Zenlift theme colors for active and inactive states, applying tinted image icons that render on both iOS and Android.

#### Scenario: Active tab uses primary color
- **WHEN** a tab is active
- **THEN** its icon displays the filled variant and uses the Zenlift primary color for tinting

#### Scenario: Inactive tab uses muted color
- **WHEN** a tab is inactive
- **THEN** its icon displays the outlined variant and uses the Zenlift mutedText color for tinting
