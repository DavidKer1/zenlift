# Exercise Form (Delta)

## ADDED Requirements

### Requirement: Exercise form uses tonal surfaces
The system SHALL render the exercise creation/edit form with `#0C0B10` background, form inputs in `#28272F` containers with 12px radius, and action buttons using monochromatic variants.

#### Scenario: Form renders
- **WHEN** the exercise form screen renders
- **THEN** text inputs SHALL use `#28272F` background with 12px radius
- **AND** placeholder text SHALL be white at 30% opacity
- **AND** labels SHALL be white at 85% opacity

#### Scenario: Submit button uses white background
- **WHEN** the form submit/save button renders
- **THEN** it SHALL use white (`#FFFFFF`) background with black (`#0C0B10`) text and 12px radius
