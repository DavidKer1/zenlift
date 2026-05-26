## ADDED Requirements

### Requirement: Agent-neutral test commands

The project SHALL expose documented package scripts that Codex, Copilot, and Opencode can run without agent-specific command knowledge.

#### Scenario: Agent runs the full local verification surface

- **WHEN** an agent runs the documented full verification command
- **THEN** the command executes typecheck, unit tests, and configured agent smoke tests in the documented order

#### Scenario: Agent runs only web smoke

- **WHEN** an agent runs the documented web smoke command
- **THEN** the command starts or reuses the Expo web target and runs the mobile viewport smoke flow

#### Scenario: Agent runs only iOS smoke

- **WHEN** an agent runs the documented iOS smoke command on a machine with the required native tooling
- **THEN** the command runs the native mobile smoke flow against an iOS Simulator

### Requirement: Playwright mobile web smoke runner

The project SHALL include a Playwright-based mobile web smoke runner for fast agent validation of Expo web flows.

#### Scenario: Web smoke uses a mobile viewport

- **WHEN** the Playwright smoke test starts
- **THEN** it runs with a documented mobile device profile or equivalent mobile viewport, touch, and user-agent settings

#### Scenario: Web smoke captures failure artifacts

- **WHEN** the Playwright smoke test fails
- **THEN** it records diagnostic artifacts such as screenshots, traces, or reports in ignored output directories

#### Scenario: Browser MCP can inspect the same target

- **WHEN** Codex or another browser-capable agent needs interactive inspection
- **THEN** the documented Expo web URL and smoke path match the Playwright target so the agent can reproduce failures manually

### Requirement: Maestro iOS native smoke runner

The project SHALL include a Maestro-based iOS Simulator smoke runner for native mobile validation.

#### Scenario: Native smoke launches the iOS app

- **WHEN** the Maestro iOS smoke flow starts
- **THEN** it launches Zenlift by its documented iOS bundle identifier on an available simulator

#### Scenario: Native smoke starts from isolated state

- **WHEN** the Maestro iOS smoke flow starts
- **THEN** it clears or resets app state so previous local developer data does not affect the run

#### Scenario: Native smoke records artifacts

- **WHEN** the Maestro iOS smoke flow fails
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

The app SHALL expose stable accessibility labels or test identifiers for controls required by the agent smoke flows.

#### Scenario: Repeated controls are selectable

- **WHEN** a smoke flow needs to tap repeated set logging controls
- **THEN** the target controls have stable labels or identifiers that allow deterministic selection

#### Scenario: User-facing accessibility remains intact

- **WHEN** selectors are added for smoke testing
- **THEN** they do not remove meaningful accessibility labels, roles, or visible copy from the mobile UI

### Requirement: Testing documentation

The README and compact project docs SHALL document the agent mobile testing system, setup prerequisites, commands, artifacts, and limitations.

#### Scenario: New contributor configures web smoke

- **WHEN** a contributor reads the README testing setup
- **THEN** they can identify the required Node/Expo/Playwright setup and the command for mobile web smoke testing

#### Scenario: New contributor configures iOS smoke

- **WHEN** a contributor reads the README testing setup on macOS
- **THEN** they can identify the required Xcode Command Line Tools, iOS Simulator, Maestro installation, app build/run prerequisite, and the command for native smoke testing

#### Scenario: Agent limitations are clear

- **WHEN** an agent or contributor reads the compact AI development docs
- **THEN** the docs state that Playwright/browser MCP and Maestro smoke tests complement but do not replace Jest, repository tests, SQLite migration tests, or real-device manual validation
