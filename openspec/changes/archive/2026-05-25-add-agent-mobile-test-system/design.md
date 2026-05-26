## Context

Zenlift is an Expo SDK 55 mobile-first workout tracker. The existing docs already require Jest, typecheck, repository/integration tests, manual device validation, and agent-browser smoke testing when an Expo web URL is available.

The missing piece is a shared test harness that Codex, Copilot, and Opencode can all run consistently. Agent-specific browser tools are useful, but they are not portable across agents and they do not validate native iOS touch, keyboard, app launch, or app state behavior. A native-only approach would be more mobile-faithful, but it would raise setup cost and slow down iteration for every UI change.

## Goals / Non-Goals

**Goals:**

- Provide one documented command surface for Codex, Copilot, and Opencode.
- Keep mobile behavior as the priority while preserving a fast browser smoke path.
- Validate the Zenlift core loop: create routine, start workout, log sets, finish session, and verify summary/history.
- Capture useful artifacts for failed agent runs: screenshots, traces, videos, logs, and reproducible steps.
- Document all required local setup in README and compact docs.

**Non-Goals:**

- Replace Jest, typecheck, repository tests, SQLite migration tests, or manual real-device validation.
- Add a backend, cloud device farm, or CI-only service.
- Expand Zenlift into a web-first product.
- Guarantee iOS App Store readiness; this is a local agent testing system.

## Decisions

### Use a two-layer UI smoke strategy

Use Playwright against Expo web for fast mobile viewport smoke tests and Maestro against an iOS Simulator for native smoke tests.

- Playwright gives every agent a deterministic scriptable web smoke path with mobile device presets, screenshots, traces, and easy CI compatibility.
- Maestro gives a mobile-native black-box runner that works against the iOS Simulator through the app bundle ID and declarative YAML flows.
- The two layers share the same core-loop intent but do not pretend to validate the same platform details.

Alternatives considered:

- Browser MCP only: faster for Codex, but too agent-specific and not native enough for mobile keyboard/touch validation.
- iOS simulator only: more faithful, but slower and unavailable for agents running on non-macOS environments.
- Detox/Appium: powerful, but heavier to configure and maintain than the MVP needs.

### Make npm scripts the common contract

Codex, Copilot, and Opencode should not need custom instructions to discover test entrypoints. The project should expose scripts such as:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:agent:web`
- `pnpm test:agent:ios`
- `pnpm test:agent:smoke`

The scripts can call Playwright, Maestro, and existing checks internally. Agent-specific tools may still be used for exploration, but the pass/fail contract comes from scripts.

Alternatives considered:

- Documenting one-off terminal commands: easy to write, but agents tend to drift.
- Agent-specific commands under `.opencode` or `.github/prompts`: useful later, but they should wrap the same package scripts instead of becoming separate sources of truth.

### Keep test data deterministic and isolated

UI smoke tests must be able to reset app state before running. Native Maestro flows can use `clearState`; web smoke tests should start from a clean browser context and, if needed, a project-owned e2e reset/seed path guarded behind an e2e-only environment flag.

Alternatives considered:

- Reusing existing developer data: realistic but unsafe and flaky.
- Seeding through SQLite implementation details from the test runner: fast, but too coupled to storage internals for black-box smoke tests.

### Add stable selectors where human-visible labels are insufficient

The core loop should remain accessible through labels and roles first. When visual text is duplicated or unstable, add stable `testID`/accessibility identifiers on critical controls only.

Alternatives considered:

- Querying purely by visible copy: best for user realism, but brittle for Spanish copy changes and repeated controls.
- Adding test IDs everywhere: noisy and unnecessary.

### Store artifacts under ignored e2e output directories

Playwright and Maestro outputs should be written to predictable ignored folders such as `test-results/`, `playwright-report/`, and `e2e/artifacts/`. Agents should report paths and visible failure details, not commit generated artifacts.

## Risks / Trade-offs

- iOS Simulator availability varies by machine -> document macOS/Xcode requirements and keep web smoke usable when native smoke is unavailable.
- Expo web behavior can differ from native -> label Playwright as a fast smoke layer, not final mobile validation.
- Maestro flows can become brittle if UI copy shifts -> prefer accessibility labels/test IDs for repeated controls and keep flows focused on the core loop.
- E2E reset hooks can leak into production behavior -> guard any reset/seed behavior behind an explicit e2e-only environment variable and keep it unreachable in normal app usage.
- Native smoke tests may be slower than unit/integration tests -> run them on UI/navigation changes and pre-release checks, not for every small pure-function edit.

## Migration Plan

1. Add the Playwright web smoke test scaffold, config, scripts, and ignored artifact paths.
2. Add Maestro flow files and scripts for iOS Simulator smoke testing.
3. Add any minimal accessibility labels/test IDs needed by the core-loop flows.
4. Update README and compact docs with setup, commands, agent usage, artifacts, and limitations.
5. Verify the web smoke script locally. Verify the iOS smoke script when Xcode/iOS Simulator and Maestro are available.

Rollback is limited to removing the new test dependencies, configs, scripts, flows, and docs; no user data migration is involved.

## Open Questions

- Which exact iOS simulator/device name should be the default local target, or should the script auto-detect the booted simulator?
- Should the native smoke initially target iOS only, or should a parallel Android Maestro flow be added once Android emulator validation becomes a priority?
