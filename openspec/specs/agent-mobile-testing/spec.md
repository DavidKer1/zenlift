# Agent Mobile Testing

## Purpose

Defines the agent-neutral mobile testing system for Zenlift, including Flutter analysis, Flutter tests, core-loop integration coverage, stable selectors, and testing documentation.

## Requirements

### Requirement: Agent-neutral test commands

The project SHALL provide documented Flutter commands that Codex, Copilot, and Opencode can run without agent-specific command knowledge.

#### Scenario: Agent runs the full local verification surface

- **WHEN** an agent runs the documented full verification command
- **THEN** the command executes static analysis, unit/widget tests, and configured integration tests in the documented order

#### Scenario: Agent runs only integration smoke

- **WHEN** an agent runs the documented core-loop integration command
- **THEN** the command runs the mobile core-loop flow with Flutter integration testing

#### Scenario: Agent runs only device smoke

- **WHEN** an agent runs the documented iOS smoke command on a machine with the required native tooling
- **THEN** the command runs the native mobile smoke flow against an iOS Simulator or connected device

### Requirement: Flutter integration smoke runner

The project SHALL include a Flutter integration-test runner for fast agent validation of core mobile flows.

#### Scenario: Integration smoke uses a mobile target

- **WHEN** the integration smoke test starts
- **THEN** it runs against a documented simulator, emulator, device, or Flutter-supported test target

#### Scenario: Integration smoke captures failure context

- **WHEN** the integration smoke test fails
- **THEN** the failure output identifies the failing step and preserves any available Flutter test diagnostics

#### Scenario: Manual inspection can reproduce the same target

- **WHEN** Codex or another agent needs interactive inspection
- **THEN** the documented Flutter target and smoke path let the agent reproduce failures manually

### Requirement: Native device validation

The project SHALL document native simulator or device validation for mobile behavior that requires platform ergonomics.

#### Scenario: Native smoke launches the iOS app

- **WHEN** the native smoke flow starts
- **THEN** it launches Zenlift by its documented iOS bundle identifier on an available simulator

#### Scenario: Native smoke starts from isolated state

- **WHEN** the native smoke flow starts
- **THEN** it clears or resets app state so previous local developer data does not affect the run

#### Scenario: Native smoke records artifacts

- **WHEN** the native smoke flow fails
- **THEN** the run produces reproducible output such as console logs, screenshots, or recordings in ignored artifact paths

### Requirement: Core-loop smoke coverage

Agent smoke tests SHALL focus on Zenlift's core loop and MUST NOT expand test scope into non-MVP product areas.

#### Scenario: Core loop completes

- **WHEN** an agent smoke test executes the happy path
- **THEN** it creates or selects a routine, starts a workout, logs at least one exercise with at least two sets, finishes the session, and verifies that completion is visible in summary or history

#### Scenario: Active workout remains prioritized

- **WHEN** an agent smoke test logs sets during an active workout
- **THEN** it validates that the set logging controls remain reachable in a mobile-sized viewport or simulator screen

#### Scenario: Out-of-scope product flows are excluded

- **WHEN** agent smoke flows are authored
- **THEN** they do not include CRM, coach dashboard, marketplace, nutrition, booking, social-first, or backend-only workflows

### Requirement: Stable mobile selectors

The app SHALL provide stable accessibility labels or test identifiers for controls required by the agent smoke flows.

#### Scenario: Repeated controls are selectable

- **WHEN** a smoke flow needs to tap repeated set logging controls
- **THEN** the target controls have stable labels or identifiers that allow deterministic selection

#### Scenario: User-facing accessibility remains intact

- **WHEN** selectors are added for smoke testing
- **THEN** they do not remove meaningful accessibility labels, roles, or visible copy from the mobile UI

### Requirement: Testing documentation

The README and compact project docs SHALL document the agent mobile testing system, setup prerequisites, commands, artifacts, and limitations.

#### Scenario: New contributor configures mobile verification

- **WHEN** a contributor reads the README testing setup
- **THEN** they can identify the required Flutter setup and the commands for analysis, tests, integration tests, and manual device validation
