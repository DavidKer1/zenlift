# Routine Form Screen (Delta)

## ADDED Requirements

### Requirement: Routine form uses tonal surfaces
The system SHALL render the routine creation/edit form with `#0C0B10` background, form fields in `#28272F` input containers, and action buttons using the monochromatic button variants.

#### Scenario: Form renders
- **WHEN** the routine form screen renders
- **THEN** text inputs SHALL use `#28272F` background with 12px radius, placeholder text at 30% white opacity, and focus state shifting to `#242329`

#### Scenario: Submit button uses white background
- **WHEN** the form submit/save button renders
- **THEN** it SHALL use white (`#FFFFFF`) background with black (`#0C0B10`) text

#### Scenario: Cancel button uses ghost style
- **WHEN** a cancel/back action renders
- **THEN** it SHALL use transparent background with white 50% text
