# gradient-card-component Specification

## Purpose
Provides a reusable `GradientCard` wrapper component that renders a subtle bottom-to-top linear gradient background for card-like UI elements.

## Requirements

### Requirement: Gradient card background component

The system SHALL provide a reusable Flutter card wrapper that renders a subtle bottom-to-top linear gradient background, fading from `surfaceContainer` at the bottom to `surfaceContainerHigh` at the top.

#### Scenario: Gradient direction is bottom-to-top

- **WHEN** `GradientCard` renders
- **THEN** the gradient SHALL transition from `surfaceContainer` at 0% (bottom) to `surfaceContainerHigh` at 100% (top)

#### Scenario: Gradient card accepts children

- **WHEN** children are passed to `GradientCard`
- **THEN** the children SHALL render inside the gradient container

#### Scenario: Gradient card accepts standard card props

- **WHEN** `GradientCard` receives `borderRadius`, `padding`, or style props
- **THEN** those props SHALL be applied to the outer Flutter container

#### Scenario: Fallback to solid background when gradient unsupported

- **WHEN** the runtime environment does not support gradients
- **THEN** the card SHALL render with a solid `surfaceContainerHigh` background color
