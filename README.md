# Zenlift

Workout tracker app built with [Expo](https://expo.dev).

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Verification

Core local checks:

```bash
pnpm typecheck
pnpm test
pnpm lint
```

## Agent Mobile Testing

Codex, Copilot, and Opencode share the same script surface for mobile-focused smoke testing. Use these commands instead of agent-specific one-off steps:

```bash
pnpm test:agent:web
pnpm test:agent:ios
pnpm test:agent:smoke
```

The web smoke path runs Playwright against Expo web with a mobile browser profile. It is fast and agent-friendly, and browser MCP tools can inspect the same local target at `http://127.0.0.1:8081` when a failure needs manual reproduction.

Before the first web smoke run, install the Playwright browser binary:

```bash
pnpm exec playwright install chromium
```

The iOS smoke path runs Maestro against the native iOS app bundle id `com.zenlift.workout`. Requirements:

- macOS with Xcode Command Line Tools installed.
- A booted iOS Simulator.
- The Zenlift iOS app installed in that simulator, usually via `pnpm ios`.
- Maestro CLI installed.

Run the native smoke test with:

```bash
open -a Simulator
pnpm ios
pnpm test:agent:ios
```

Agent smoke tests cover the Zenlift core loop: create routine, start workout, log two sets, finish the session, and confirm the summary/history result. Generated artifacts are ignored by git:

- `test-results/agent-web/`
- `playwright-report/agent-web/`
- `e2e/artifacts/maestro/`

These smoke tests complement Jest, typecheck, SQLite repository tests, and real-device manual testing. They do not replace Android hardware validation for keyboard ergonomics, haptics, offline behavior, performance, active-session recovery, or gym-use feel.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Knowledge Graph

This project includes a [graphify](https://github.com/ai-ng/graphify) knowledge graph for codebase navigation. The graph maps 726 nodes across 55 communities, covering domain entities, repositories, UI components, and calculation services.

- **Interactive graph:** open `.graphify/graph.html` in any browser
- **Audit report:** `.graphify/GRAPH_REPORT.md`
- **Rebuild:** run `/graphify src` in Claude Code or `graphify src` in the terminal

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
