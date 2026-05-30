## MODIFIED Requirements

### Requirement: Agent-neutral test commands
The system SHALL expose documented agent-neutral Flutter verification commands that Codex, Copilot, and Opencode can run without agent-specific command knowledge.

#### Scenario: Agent runs Flutter verification
- **WHEN** an agent runs the documented Flutter verification surface
- **THEN** the commands execute `flutter analyze`, Dart/unit/widget/golden tests, and configured Flutter integration smoke tests in the documented order.

#### Scenario: Agent runs Flutter core-loop smoke
- **WHEN** `cd flutter-version && flutter test integration_test/core_loop_test.dart` runs against an available simulator or device
- **THEN** it covers the core loop from routine creation through workout summary.

### Requirement: Flutter integration smoke runner
The project SHALL include Flutter integration smoke coverage under `flutter-version/integration_test` for fast agent validation of migrated mobile flows.

#### Scenario: Integration smoke covers core loop
- **WHEN** the Flutter integration smoke test executes the happy path
- **THEN** it creates or selects a routine, starts a workout, logs at least one exercise with at least two sets, finishes the session, and verifies that completion is visible in summary or history.

#### Scenario: Integration smoke records reproducible failures
- **WHEN** a Flutter integration smoke test fails
- **THEN** the failure output identifies the command, target device or simulator, failing selector, and visible error state when available.

### Requirement: Stable mobile selectors
Flutter interactive widgets in smoke-covered flows SHALL use stable `ValueKey` values that preserve the existing selector names where practical.

#### Scenario: Active set input has stable key
- **WHEN** the Active Workout set row renders the first weight input
- **THEN** the widget key is `active-set-1-weight-input`.

#### Scenario: User-facing accessibility remains intact
- **WHEN** `ValueKey` selectors are added for smoke testing
- **THEN** they do not remove meaningful semantics labels, roles, or visible copy from the mobile UI.
