## Why

Zenlift is still close to the default Expo starter, while the MVP needs a local-first workout tracker foundation with the project folders and dependencies required for the core loop. Establishing this foundation now prevents later feature work from scattering domain, storage, and UI code across template files.

## What Changes

- Align the Expo project foundation with the installed SDK 55 project rule, noting that the Notion task references SDK 56 while `package.json` currently uses Expo `~55.0.24`.
- Add the missing runtime dependencies for local data, forms, validation, state, haptics, lists, dates, and charts using Expo-compatible versions.
- Create the base `src/` folder structure for app routes, domain, storage, features, components, utilities, theme, and providers.
- Keep TypeScript strict mode and Expo Router configuration active.
- Remove or isolate starter-only sample code so future screens can be implemented against Zenlift conventions.

## Capabilities

### New Capabilities
- `project-foundation`: Base Expo SDK 55 structure, dependency set, and source organization for Zenlift feature work.

### Modified Capabilities

## Impact

- Affects `package.json`, lockfile, `app.json`, `tsconfig.json`, and `src/` directory layout.
- Adds dependencies such as `expo-sqlite`, `react-native-mmkv`, `zustand`, `date-fns`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@shopify/flash-list`, `expo-haptics`, `react-native-svg`, and a charting library compatible with Expo SDK 55.
- Sets the baseline for later database, workout, routine, history, and progress changes.
