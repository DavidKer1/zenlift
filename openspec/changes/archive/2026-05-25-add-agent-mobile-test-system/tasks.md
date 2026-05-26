## 1. Command Surface And Dependencies

- [x] 1.1 Add `typecheck`, `test`, `test:agent:web`, `test:agent:ios`, and `test:agent:smoke` scripts to `package.json`
- [x] 1.2 Add Playwright test tooling as a dev dependency and document the Playwright browser install command
- [x] 1.3 Add ignored artifact paths for Playwright and Maestro outputs without committing generated reports, screenshots, traces, or recordings
- [x] 1.4 Verify the scripts use `pnpm` consistently and fail with clear errors when required native tooling is missing

## 2. Playwright Mobile Web Smoke

- [x] 2.1 Create Playwright config with an Expo web `webServer` target and mobile project profile
- [x] 2.2 Add a web smoke test for the Zenlift core loop: create/select routine, start workout, log at least two sets, finish session, and verify summary or history
- [x] 2.3 Configure screenshots/traces/reports for failed web smoke runs
- [x] 2.4 Ensure the documented local web URL can also be inspected manually by browser MCP tools

## 3. Maestro iOS Native Smoke

- [x] 3.1 Add `e2e/maestro/ios-core-loop.yaml` targeting iOS bundle id `com.zenlift.workout`
- [x] 3.2 Configure the Maestro flow to launch the app from isolated state before executing steps
- [x] 3.3 Implement the native core-loop smoke path: create/select routine, start workout, log at least two sets, finish session, and verify summary or history
- [x] 3.4 Configure Maestro artifact output for logs, screenshots, or recordings under an ignored path
- [x] 3.5 Document how to boot/select the iOS Simulator and build/run the app before invoking the Maestro command

## 4. Selector And Test-State Support

- [x] 4.1 Audit the core-loop screens for stable accessibility labels and `testID` coverage needed by Playwright and Maestro
- [x] 4.2 Add minimal labels or test IDs for repeated controls such as routine actions, active workout set inputs, add-set, complete-set, and finish-workout controls
- [x] 4.3 Keep user-facing accessibility labels meaningful while adding test selectors
- [x] 4.4 Add an e2e-only reset or deterministic state path only if clear browser/native state is insufficient for reliable smoke tests

## 5. Documentation

- [x] 5.1 Update `README.md` with the agent testing strategy, prerequisites, setup commands, script list, and artifact locations
- [x] 5.2 Update `docs/ai_development_strategy.md` to explain how Codex, Copilot, and Opencode should use the common scripts and when to use browser MCP inspection
- [x] 5.3 Update `docs/roadmap_testing.md` to include Playwright web smoke and Maestro iOS smoke in the testing pyramid without replacing Jest or manual device tests
- [x] 5.4 Document limitations clearly: Expo web is a fast smoke layer, iOS Simulator is native smoke, and real-device validation remains required for ergonomics, haptics, offline behavior, performance, and recovery

## 6. Verification

- [x] 6.1 Run `pnpm typecheck` and fix any TypeScript errors introduced by selectors or test support
- [x] 6.2 Run `pnpm test` and verify existing Jest coverage still passes
- [x] 6.3 Run `pnpm test:agent:web` and capture any failing URL, visible error text, screenshot, or trace path
- [x] 6.4 Run `pnpm test:agent:ios` on macOS with Xcode/iOS Simulator and Maestro, or document the exact missing prerequisite if unavailable
- [x] 6.5 Run `openspec validate add-agent-mobile-test-system --strict` and fix any spec/task formatting issues
