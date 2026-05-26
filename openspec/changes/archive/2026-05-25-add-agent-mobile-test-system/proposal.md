## Why

Zenlift already documents unit, integration, manual, and agent-browser smoke testing, but Codex, Copilot, and Opencode do not have one shared, repeatable way to validate the mobile core loop. The project needs an agent-friendly test system that keeps mobile behavior first while still giving browser-capable agents a fast fallback.

## What Changes

- Add a documented, agent-neutral mobile testing system for Codex, Copilot, and Opencode.
- Define a two-layer UI smoke strategy:
  - Expo web + Playwright/browser MCP for fast mobile-viewport smoke tests and screenshots.
  - iOS Simulator + Maestro for native mobile flows, keyboard/touch behavior, and launch/resume checks.
- Add npm scripts and configuration conventions so every agent can run the same commands without relying on agent-specific UI tools.
- Add mobile smoke flows focused on the core loop: create routine, start workout, log sets, finish session, and verify summary/history.
- Document local setup requirements in README and the relevant docs, including Node, Expo, Playwright browser install, Xcode/iOS Simulator, and Maestro.
- Keep existing Jest/typecheck/repository tests as required lower layers; the new system complements them instead of replacing them.

## Capabilities

### New Capabilities

- `agent-mobile-testing`: Defines the agent-friendly mobile test system, supported runners, required scripts, artifacts, smoke flows, documentation, and pass/fail expectations.

### Modified Capabilities

- None.

## Impact

- Affected files may include `package.json`, Playwright config/tests, Maestro flow files, README, and compact docs such as `docs/ai_development_strategy.md` and `docs/roadmap_testing.md`.
- New development dependencies may include Playwright test tooling and optional Maestro CLI installation documentation.
- Local iOS native smoke tests require macOS with Xcode Command Line Tools and an available iOS Simulator.
- Browser smoke tests require Expo web compatibility and installed Playwright browsers; they remain useful for Codex/browser MCP even when the iOS simulator is unavailable.
