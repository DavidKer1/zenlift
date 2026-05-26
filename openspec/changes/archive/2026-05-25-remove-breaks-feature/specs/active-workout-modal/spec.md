## ADDED Requirements

### Requirement: Modal excludes break and rest timer UI
The active workout modal SHALL NOT render break, rest timer, countdown, skip rest, or add-rest-time controls in minimized or expanded states.

#### Scenario: Expanded modal has no rest controls
- **WHEN** the modal is expanded during an active workout
- **THEN** the modal SHALL render active workout controls without any break or rest timer UI

#### Scenario: Completing sets does not reveal rest UI
- **WHEN** the user completes a set while the modal is visible
- **THEN** the modal SHALL NOT show a rest countdown, skip rest button, or add-rest-time button

## MODIFIED Requirements

### Requirement: Body content fades when minimizing

The workout body content (Cancel button, exercise list, BottomBar) SHALL fade out using `opacity` interpolation driven by the same shared value, synchronised with the `translateY` animation.

#### Scenario: Body fades during minimize

- **WHEN** the modal transitions from expanded to minimized
- **THEN** the body content SHALL fade from opacity 1 to 0

#### Scenario: Body fades during expand

- **WHEN** the modal transitions from minimized to expanded
- **THEN** the body content SHALL fade from opacity 0 to 1
