## ADDED Requirements

### Requirement: Gradient card background component

The system SHALL provide a reusable `GradientCard` component that renders a View with a subtle bottom-to-top linear gradient background, fading from `surfaceElevatedDark` at the bottom to `surfaceElevated` at the top.

#### Scenario: Gradient direction is bottom-to-top

- **WHEN** `GradientCard` renders
- **THEN** the gradient SHALL transition from `surfaceElevatedDark` at 0% (bottom) to `surfaceElevated` at 100% (top)

#### Scenario: Gradient card accepts children

- **WHEN** children are passed to `GradientCard`
- **THEN** the children SHALL render inside the gradient container

#### Scenario: Gradient card accepts standard card props

- **WHEN** `GradientCard` receives `borderRadius`, `padding`, or style props
- **THEN** those props SHALL be applied to the outer container View

#### Scenario: Fallback to solid background when gradient unsupported

- **WHEN** the runtime environment does not support `experimental_backgroundImage`
- **THEN** the card SHALL render with a solid `surfaceElevated` background color
