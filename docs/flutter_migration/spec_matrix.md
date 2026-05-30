# Flutter Spec Migration Matrix

| Current spec | Flutter migration action | Status |
|---|---|---|
| `active-workout-flow` | Preserve requirements; replace route/store wording with `ActiveWorkoutController`, Drift autosave and go_router paths. | pending |
| `active-workout-modal` | Preserve minimized/expanded behavior; replace Reanimated-specific requirements with Flutter animation and gesture equivalents. | pending |
| `agent-mobile-testing` | Replace Expo web smoke dependency with Flutter integration smoke; preserve Maestro mobile smoke and stable selectors via `ValueKey`. | pending |
| `app-theme` | Preserve dark default and token semantics; map React theme provider to Flutter `ThemeData` plus `ZenliftThemeExtension`. | pending |
| `base-tab-navigation` | Preserve tab destinations; update implementation to go_router shell route and custom bottom nav. | pending |
| `data-delete` | Preserve double confirmation and deletion of SQLite plus settings store. | pending |
| `data-export` | Preserve `.zenlift` JSON structure; implement with Dart file APIs and platform share plugin selected during implementation. | pending |
| `data-import` | Preserve schema validation; implement Dart parser and merge-by-UUID import path. | pending |
| `database-connection` | Preserve singleton, WAL, foreign keys, migrations and teardown using Drift/SQLite. | pending |
| `design-token-system` | Preserve monochromatic palette, typography, radius, spacing and no shadow rule as Dart constants and golden tests. | pending |
| `domain-entities` | Convert TypeScript interfaces/unions to Dart enums/classes with UUID text IDs and snake_case row mapping. | pending |
| `domain-volume-calculation` | Port pure calculations to Dart with identical tests. | pending |
| `estimated-1rm` | Port Epley calculations to Dart with identical tests. | pending |
| `exercise-detail-screen` | Preserve screen data, PR cards, chart/history, custom edit/delete, quick workout and tonal surfaces. | pending |
| `exercise-form` | Replace Zod form validation with Dart validators returning typed `ValidationResult`. | pending |
| `exercise-library` | Preserve search, filters, favorites, cards, empty state, FAB and list performance. | pending |
| `exercise-repository` | Port repository API to Drift transactions and parameterized queries. | pending |
| `gradient-card-component` | Re-evaluate: current design says no decorative gradients except established component specs. Keep only if active spec still requires it after design audit. | pending |
| `home-screen` | Preserve greeting, start workout actions, calendar widget, weekly card, current routine and recent PRs. | pending |
| `id-generation` | Port UUID generator and fallback tests. | pending |
| `migration-runner` | Replace JS migration runner with Drift migrations and explicit migration table/version tests. | pending |
| `onboarding-flow` | Preserve three skippable screens, unit, weekly goal and completion guard. | pending |
| `pr-detection` | Port PR detection and improvement calculations to Dart. | pending |
| `project-foundation` | Rewrite from Expo/TypeScript to Flutter/Dart. | pending |
| `routine-detail-screen` | Preserve full routine loading, actions, inline edit, duplicate, archive/delete, reorder and start workout. | pending |
| `routine-form-screen` | Preserve create/edit, validation, nested transactional save, unsaved warning and accessibility. | pending |
| `routine-list-screen` | Preserve active routine list, cards, swipe/archive or equivalent explicit action, templates, FAB and empty state. | pending |
| `routine-repository` | Port all routine/day/exercise repository operations with transactions. | pending |
| `seed-data` | Preserve muscle groups, seed exercises, relationships, JSON source and idempotency. | pending |
| `settings-storage` | Replace MMKV with `LocalSettingsStore`; preserve defaults, clamping, namespace and reactive reads. | pending |
| `settings-ui` | Preserve settings sections, unit/theme/weekly goal controls and data operations. | pending |
| `sqlite-ddl` | Preserve table shape, text PKs, cascade FK, enum checks, indexes and no `rest_seconds`. | pending |
| `tab-bar-icons` | Preserve accessible icon-only tabs and minimalist active states using Flutter icons/assets. | pending |
| `units-conversion` | Port kg/lb conversion, formatting and increments. | pending |
| `workout-repository` | Port session CRUD, active session, history, nested reads, previous performance, home summary, set logging and PR persistence. | pending |
