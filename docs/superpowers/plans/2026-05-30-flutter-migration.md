# Zenlift Flutter Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar Zenlift de Expo React Native a Flutter manteniendo la misma funcionalidad, datos locales, especificaciones OpenSpec, experiencia mobile-first y diseno visual con paridad pixel-level razonable.

**Architecture:** Construir una app Flutter paralela dentro de este mismo repo en `flutter-version/`, una subcarpeta temporal que permite consultar la app Expo, docs, specs y assets sin cambiar de workspace. Todos los cambios nuevos deben seguir Clean Architecture por feature: `presentation -> application -> domain`, con `data` implementando contratos del dominio sin que Drift, Flutter o Riverpod entren al dominio. Cuando la migracion sea efectiva y pase la puerta de paridad, `flutter-version/` se movera a la carpeta principal y la app Expo se retirara en un commit de corte controlado.

**Tech Stack:** Flutter stable, Dart 3, MaterialApp.router, go_router, flutter_riverpod 3, Drift + sqlite3_flutter_libs, shared_preferences, intl, uuid, fl_chart, integration_test, flutter_test golden tests, Maestro smoke opcional, OpenSpec.

---

## Context Notes

- Current app stack from `package.json`: Expo `~55.0.26`, React Native `0.83.6`, React `19.2.0`, Expo Router, Zustand, expo-sqlite, react-native-mmkv, FlashList, Zod, i18next, gifted charts, Playwright and Maestro smoke scripts.
- Project docs loaded: `docs/README.md`, `docs/product_context.md`, `docs/ux_workflows.md`, `docs/architecture.md`, `docs/data_model.md`, `docs/roadmap_testing.md`, `docs/ai_development_strategy.md`, and `DESIGN.md`.
- Graphify was present and `.graphify/needs_update` did not exist. The report was built from commit `1d9f588`, while current `HEAD` was `ff09e8a2068efcd205b5c42843f46fe7a03d2156`; treat graph details as helpful but verify against source before implementation.
- Context7 docs checked:
  - Flutter official docs: app workflow uses `flutter create`, `flutter analyze`, `flutter test`, `flutter run lib/main.dart`; accessibility tests can use Flutter guideline matchers for tap target, labels and contrast.
  - go_router pub docs: use `MaterialApp.router(routerConfig: router)`, `GoRoute`, `context.go()`, deep-linkable routes, and `flutter pub add go_router`.
  - flutter_riverpod 3.3 docs: every app needs `ProviderScope`, widgets use `ref.watch`, provider tests use `ProviderContainer` or `ProviderScope` overrides.
- Current OpenSpec specs include core app capabilities for active workout, modal, agent testing, app theme, navigation, data import/export/delete, SQLite, design tokens, domain calculations/entities, exercises, routines, seed data, settings, units, repositories and workout repository. Migration must update specs instead of bypassing them.
- Worktree is dirty with many existing modifications and untracked OpenSpec/doc files. Execution must preserve unrelated local work and only touch files named by the current task.
- The Flutter implementation must live in `flutter-version/` during migration. This folder is temporary; it exists in the same repository so agents can reference the current Expo implementation, OpenSpec specs, docs, assets, seed data and tests with short local paths.
- After the migration is effective, verified and accepted, the Flutter project moves from `flutter-version/` to the repository root. Do not move it earlier.

## Scope Check

This migration spans multiple subsystems: foundation, specs, design, persistence, domain, navigation, every screen, data migration, testing and release. Keep this as one umbrella plan because the user requested a full migration plan, but implement it as independently verifiable phases. Do not delete the Expo app until Flutter passes the parity gate in Task 18.

## Parallel Agent Strategy

This plan is designed for multiple agents working in parallel, but one orchestrator agent must always own sequencing, context budgets and integration. The orchestrator is the only agent allowed to merge task outputs, update the migration matrix, mark OpenSpec tasks complete, move files between major folders, or decide that a phase is ready for the next dependency.

### Orchestrator Responsibilities

- Keep the source Expo app and `flutter-version/` in the same repo until cutover so every agent can reference current behavior without loading broad context.
- Create one focused prompt per worker agent with only the files and docs needed for that task.
- Assign non-overlapping file ownership. Parallel agents must not edit the same file unless the orchestrator explicitly serializes those changes.
- Require each worker to return: files touched, tests added, commands run, failures, assumptions, and follow-up risks.
- Run integration checks after each batch: `cd flutter-version && flutter analyze`, targeted `flutter test`, and OpenSpec validation when specs change.
- Update `docs/flutter_migration/spec_matrix.md`, `docs/flutter_migration/testing.md`, and `openspec/changes/migrate-app-to-flutter/tasks.md` after each accepted batch.
- Keep context small by pointing agents to compact docs first: `docs/README.md` plus only one relevant doc such as `docs/architecture.md`, `docs/data_model.md`, `docs/ux_workflows.md`, or `DESIGN.md`.
- Use current source files as reference by path instead of pasting large code blocks into prompts.

### Parallel Workstreams

| Agent | Owns | Reads | Must not touch |
|---|---|---|---|
| Orchestrator | Plan, task matrix, integration, reviews, cutover decisions | All docs and outputs as needed | Feature implementation except small integration fixes |
| Specs Agent | OpenSpec deltas and migration docs | `openspec/specs`, `docs/README.md`, relevant compact docs | `flutter-version/lib` |
| Foundation Agent | Flutter scaffold, pubspec, router shell, bootstrap | `package.json`, `docs/architecture.md`, Context7 docs | Domain/repository feature internals |
| Design Agent | Theme tokens, shared UI widgets, goldens | `DESIGN.md`, current `src/theme`, current UI components | Storage/database files |
| Domain Agent | Entities, calculations, units, PR detection | `src/domain`, `src/utils`, domain specs | Screens and widgets |
| Storage Agent | Drift schema, migrations, repositories, seed data | `docs/data_model.md`, `src/storage`, repository specs | Screen UI files |
| Settings/Data Agent | settings store, export/import/delete, migration bridge | settings specs, `src/features/settings`, data portability files | Active workout UI |
| Feature UI Agents | One feature folder each: onboarding, home, routines, exercises, workout, history, settings | Matching `src/app`, `src/components`, `docs/ux_workflows.md`, feature specs | Database schema and unrelated features |
| Testing Agent | Integration smoke, accessibility, golden runner, Maestro docs | `e2e`, testing docs, stable selectors | Product logic unless adding test hooks approved by orchestrator |

### Context Budget Rules For Worker Agents

- Each worker prompt should include at most one compact doc, one or two current source directories, and the exact OpenSpec spec for that capability.
- Do not paste the full blueprint or all specs into worker prompts.
- Prefer references like `src/components/workout/SetRow.tsx` and `openspec/specs/active-workout-flow/spec.md` over long excerpts.
- Worker agents should use `rg` for local discovery and Context7 only for package-specific Flutter/Dart/library questions.
- If a worker needs broader context, it must ask the orchestrator for one additional file set instead of scanning the whole repo.

## Product Parity Rules

- Use Clean Architecture for all migrated capabilities. Domain code must stay pure Dart with no Flutter, Riverpod, Drift, SQLite, platform, or generated row imports.
- Preserve the core loop exactly: `Crear rutina -> Iniciar workout -> Registrar sets -> Finalizar sesion -> Ver progreso`.
- Active Workout remains the highest-priority screen. Completing a set must stay under 3 seconds on Android hardware.
- Never risk losing workout data. Completed sets must autosave to SQLite and active sessions must recover after process death.
- Keep offline core flows: onboarding, settings, exercise library, routine creation/editing, active workout, history, summaries and progress.
- Keep UUID text IDs from day 1.
- Keep dark theme default. Do not use green as primary; green is only success/completed state.
- Editing routines must not mutate historical workout sessions.
- Do not add CRM, SaaS, coach dashboard, web admin, marketplace, booking, nutrition or social-first features.

## Spec Migration Matrix

The following specs must be audited and either preserved unchanged, converted from Expo-specific wording to Flutter wording, or expanded with Flutter acceptance criteria:

| Current spec | Flutter migration action |
|---|---|
| `active-workout-flow` | Preserve requirements; replace route/store wording with `ActiveWorkoutController`, Drift autosave and go_router paths. |
| `active-workout-modal` | Preserve minimized/expanded behavior; replace Reanimated-specific requirements with Flutter animation and gesture equivalents. |
| `agent-mobile-testing` | Replace Expo web smoke dependency with Flutter integration smoke; preserve Maestro mobile smoke and stable selectors via `ValueKey`. |
| `app-theme` | Preserve dark default and token semantics; map React theme provider to Flutter `ThemeData` plus `ZenliftThemeExtension`. |
| `base-tab-navigation` | Preserve tab destinations; update implementation to go_router shell route and custom bottom nav. |
| `data-delete` | Preserve double confirmation and deletion of SQLite plus settings store. |
| `data-export` | Preserve `.zenlift` JSON structure; implement with Dart file APIs and platform share plugin selected during implementation. |
| `data-import` | Preserve schema validation; implement Dart parser and merge-by-UUID import path. |
| `database-connection` | Preserve singleton, WAL, foreign keys, migrations and teardown using Drift/SQLite. |
| `design-token-system` | Preserve monochromatic palette, typography, radius, spacing and no shadow rule as Dart constants and golden tests. |
| `domain-entities` | Convert TypeScript interfaces/unions to Dart enums/classes with UUID text IDs and snake_case row mapping. |
| `domain-volume-calculation` | Port pure calculations to Dart with identical tests. |
| `estimated-1rm` | Port Epley calculations to Dart with identical tests. |
| `exercise-detail-screen` | Preserve screen data, PR cards, chart/history, custom edit/delete, quick workout and tonal surfaces. |
| `exercise-form` | Replace Zod form validation with Dart validators returning typed `ValidationResult`. |
| `exercise-library` | Preserve search, filters, favorites, cards, empty state, FAB and list performance. |
| `exercise-repository` | Port repository API to Drift transactions and parameterized queries. |
| `gradient-card-component` | Re-evaluate: current design says no decorative gradients except established component specs. Keep only if active spec still requires it after design audit. |
| `home-screen` | Preserve greeting, start workout actions, calendar widget, weekly card, current routine and recent PRs. |
| `id-generation` | Port UUID generator and fallback tests. |
| `migration-runner` | Replace JS migration runner with Drift migrations and explicit migration table/version tests. |
| `onboarding-flow` | Preserve three skippable screens, unit, weekly goal and completion guard. |
| `pr-detection` | Port PR detection and improvement calculations to Dart. |
| `project-foundation` | Rewrite from Expo/TypeScript to Flutter/Dart. |
| `routine-detail-screen` | Preserve full routine loading, actions, inline edit, duplicate, archive/delete, reorder and start workout. |
| `routine-form-screen` | Preserve create/edit, validation, nested transactional save, unsaved warning and accessibility. |
| `routine-list-screen` | Preserve active routine list, cards, swipe/archive or equivalent explicit action, templates, FAB and empty state. |
| `routine-repository` | Port all routine/day/exercise repository operations with transactions. |
| `seed-data` | Preserve muscle groups, seed exercises, relationships, JSON source and idempotency. |
| `settings-storage` | Replace MMKV with `LocalSettingsStore`; preserve defaults, clamping, namespace and reactive reads. |
| `settings-ui` | Preserve settings sections, unit/theme/weekly goal controls and data operations. |
| `sqlite-ddl` | Preserve table shape, text PKs, cascade FK, enum checks, indexes and no `rest_seconds`. |
| `tab-bar-icons` | Preserve accessible icon-only tabs and minimalist active states using Flutter icons/assets. |
| `units-conversion` | Port kg/lb conversion, formatting and increments. |
| `workout-repository` | Port session CRUD, active session, history, nested reads, previous performance, home summary, set logging and PR persistence. |

## File Structure

Create these top-level migration files:

- Create: `docs/flutter_migration/README.md` - migration overview, commands, parity gates and known risks.
- Create: `docs/flutter_migration/spec_matrix.md` - OpenSpec requirement-by-requirement mapping.
- Create: `docs/flutter_migration/design_parity.md` - token mapping, component checklist, screenshots and golden references.
- Create: `docs/flutter_migration/data_migration.md` - Expo SQLite/MMKV export bridge, Flutter import, first-launch upgrade and rollback.
- Create: `docs/flutter_migration/testing.md` - Dart, widget, golden, integration, Maestro and manual-device test contract.
- Create: `openspec/changes/migrate-app-to-flutter/proposal.md` - OpenSpec proposal.
- Create: `openspec/changes/migrate-app-to-flutter/design.md` - technical design.
- Create: `openspec/changes/migrate-app-to-flutter/tasks.md` - implementation checklist.
- Create: `openspec/changes/migrate-app-to-flutter/specs/*/spec.md` - deltas for changed specs.
- Create: `flutter-version/` - generated Flutter app, then edited.

Flutter app structure:

```text
flutter-version/
  pubspec.yaml
  analysis_options.yaml
  assets/
    data/exercise.json
    images/exercises/
    fonts/inter/
    fonts/jetbrains_mono/
  lib/
    main.dart
    app/
      zenlift_app.dart
      router.dart
      bootstrap.dart
    core/
      errors/database_error.dart
      errors/app_failure.dart
      result.dart
      uuid/id_generator.dart
      date/zenlift_clock.dart
    theme/
      zenlift_colors.dart
      zenlift_spacing.dart
      zenlift_typography.dart
      zenlift_theme.dart
      widgets/
    features/
      onboarding/
        presentation/
        application/
        domain/
        data/
      home/
        presentation/
        application/
        domain/
        data/
      exercises/
        presentation/
        application/
        domain/
        data/
      routines/
        presentation/
        application/
        domain/
        data/
      workout/
        presentation/
        application/
        domain/
        data/
      history/
        presentation/
        application/
        domain/
        data/
      settings/
        presentation/
        application/
        domain/
        data/
      data_portability/
        presentation/
        application/
        domain/
        data/
    storage/
      drift/
      seed/
      migration_bridge/
    i18n/
    widgets/
  test/
    domain/
    storage/
    features/
    golden/
  integration_test/
    core_loop_test.dart
  tool/
    parity/
```

Clean Architecture boundaries:

- `features/<feature>/domain/` owns entities, value objects, repository interfaces, validation contracts, and pure calculations for that feature.
- `features/<feature>/application/` owns use cases, controllers/notifiers, orchestration, and provider-facing state. It may depend on domain contracts but not directly on Drift rows or Flutter widgets.
- `features/<feature>/data/` owns Drift repository implementations, row/entity mappers, DTOs, data-source adapters, and transaction details. It may import Drift and shared storage infrastructure.
- `features/<feature>/presentation/` owns screens, widgets, route entry points, keys, accessibility labels, and UI state rendering. It may use Riverpod providers exposed by application.
- `lib/storage/` is shared infrastructure only: database connection, generated Drift database, common migrations, seed loading, and migration bridge primitives. Feature repositories live in feature `data/`.
- Shared domain utilities that are truly cross-feature may live in `lib/core/` only if they have no Flutter, Riverpod, Drift, platform, or generated-code dependency.
- Drift rows and generated database classes must be mapped to domain entities in `data/` before crossing into application or presentation.

Keep existing Expo files untouched until Task 18:

- Preserve: `src/`, `assets/`, `e2e/`, `package.json`, `app.json`, `openspec/specs/`.
- Modify Expo only in Task 15 if a data bridge release is required.

### Task 1: Freeze Current Behavior And Capture Baseline

**Files:**
- Create: `docs/flutter_migration/README.md`
- Create: `docs/flutter_migration/spec_matrix.md`
- Create: `docs/flutter_migration/design_parity.md`
- Create: `docs/flutter_migration/testing.md`

- [ ] **Step 1: Record current environment**

Run:

```bash
git status --short
git rev-parse HEAD
node -p "require('./package.json').dependencies.expo"
node -p "require('./package.json').dependencies['react-native']"
```

Expected: command prints current dirty files, a commit hash, Expo `~55.0.26`, and React Native `0.83.6`. Copy the output into `docs/flutter_migration/README.md` under `## Baseline`.

- [ ] **Step 2: Create migration README**

Write `docs/flutter_migration/README.md`:

````markdown
# Flutter Migration

## Baseline

- Source app: Expo SDK 55 / React Native 0.83.
- Migration target: Flutter stable / Dart 3.
- Source of truth before cutover: existing Expo app, `DESIGN.md`, `docs/*.md`, and `openspec/specs`.
- Cutover rule: Expo app remains runnable until Flutter passes domain, repository, widget, golden, integration and manual-device parity gates.

## Commands

```bash
cd flutter-version
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

## Parity Gates

- Core loop works offline.
- Active Workout set logging remains under 3 seconds.
- Completed sets autosave and recover after app kill.
- Existing `.zenlift` export/import round-trips.
- UI matches `DESIGN.md` tokens and approved reference screenshots.
- OpenSpec validates with `openspec validate migrate-app-to-flutter --strict`.
````

- [ ] **Step 3: Create initial spec matrix**

Write `docs/flutter_migration/spec_matrix.md` with the table from this plan's "Spec Migration Matrix" section. Add a `Status` column with initial value `pending` for every row.

- [ ] **Step 4: Create design parity checklist**

Write `docs/flutter_migration/design_parity.md`:

```markdown
# Flutter Design Parity

## Required Tokens

- Background: `#141218`
- Lowest surface: `#0f0d13`
- Low surface: `#1d1b20`
- Surface: `#211f24`
- High surface: `#2b292f`
- Highest surface: `#36343a`
- Primary lavender: `#cfbcff`
- Success-only green: use only for completed/success states.
- Error: `#ffb4ab`

## Typography

- Inter for UI text.
- JetBrains Mono for numeric/data values.
- Inputs use at least 16 logical pixels.

## Components To Match

- Bottom tab bar: straight black bottom surface, icon-only, accessible labels.
- Cards: tonal surfaces, no shadow, 12px radius unless compact component uses 8px.
- Primary action: high contrast white background with dark text where `DESIGN.md` requires it.
- Active Workout set row: 48px touch targets, numeric keyboard, previous values visible, complete button not color-only.
- Charts: monochromatic lines/dots unless success/error state is semantically required.

## Golden Screens

- Home
- Routines list
- Routine detail
- Routine form
- Exercise library
- Exercise detail
- Active Workout expanded
- Active Workout minimized
- Workout summary
- History
- Settings
- Onboarding unit screen
```

- [ ] **Step 5: Commit documentation baseline**

Run:

```bash
git add docs/flutter_migration/README.md docs/flutter_migration/spec_matrix.md docs/flutter_migration/design_parity.md docs/flutter_migration/testing.md
git commit -m "docs: add flutter migration baseline"
```

Expected: commit succeeds with only migration docs staged. If unrelated files are staged, unstage them before committing with `git restore --staged <path>`.

### Task 2: Create OpenSpec Migration Change

**Files:**
- Create: `openspec/changes/migrate-app-to-flutter/proposal.md`
- Create: `openspec/changes/migrate-app-to-flutter/design.md`
- Create: `openspec/changes/migrate-app-to-flutter/tasks.md`
- Create: `openspec/changes/migrate-app-to-flutter/specs/project-foundation/spec.md`
- Create: `openspec/changes/migrate-app-to-flutter/specs/agent-mobile-testing/spec.md`
- Create: `openspec/changes/migrate-app-to-flutter/specs/design-token-system/spec.md`
- Create: `openspec/changes/migrate-app-to-flutter/specs/database-connection/spec.md`
- Create: `openspec/changes/migrate-app-to-flutter/specs/settings-storage/spec.md`
- Create: `openspec/changes/migrate-app-to-flutter/specs/active-workout-flow/spec.md`

- [ ] **Step 1: Create proposal**

Write `openspec/changes/migrate-app-to-flutter/proposal.md`:

```markdown
# Change: Migrate Zenlift to Flutter

## Why

Zenlift needs a Flutter implementation that preserves the existing mobile-first workout tracker behavior, dark design system, offline SQLite data model, OpenSpec contract, and core workout loop while reducing dependency on the Expo/React Native stack.

## What Changes

- Add a parallel Flutter app under `flutter-version/`.
- Keep `flutter-version/` inside this repository during migration so worker agents can reference current Expo code, OpenSpec specs, docs and assets through local paths without loading broad context.
- Port domain entities, calculations, repositories, local settings, navigation, screens, i18n and tests using feature-level Clean Architecture boundaries.
- Convert Expo/React Native-specific OpenSpec requirements to Flutter/Dart implementation requirements.
- Add a data migration bridge so existing local user data can move safely into the Flutter app.
- Replace Expo web smoke with Flutter integration smoke while preserving mobile-agent verification and Maestro native smoke.
- Keep the Expo app until Flutter passes parity gates.

## Non-Goals

- No backend.
- No web admin.
- No social features.
- No nutrition.
- No coach dashboard.
- No redesign beyond exact Flutter recreation of the existing design system.
```

- [ ] **Step 2: Create design**

Write `openspec/changes/migrate-app-to-flutter/design.md`:

```markdown
# Design: Flutter Migration

## Architecture

The Flutter app is local-first and uses Clean Architecture for every migrated capability:

- `features/<feature>/presentation/`: screens, widgets, route entry points, stable keys and accessibility labels.
- `features/<feature>/application/`: use cases, controllers/notifiers, Riverpod providers and view state.
- `features/<feature>/domain/`: pure Dart entities, value objects, repository interfaces, services, calculations and validation contracts.
- `features/<feature>/data/`: Drift repository implementations, row/domain mappers, DTOs and local data sources.
- `storage/`: shared Drift connection, generated database, migrations, seed loader and bridge primitives.
- `core/`: shared pure primitives such as results, IDs, clocks and failures.
- `theme/`: exact Zenlift tokens from `DESIGN.md`.
- `app/`: bootstrap, providers and go_router route tree.

Dependency rule: domain imports no Flutter, Riverpod, Drift, SQLite, platform APIs or generated rows. Persistence rows are mapped to domain entities in `data/` before reaching application or presentation.

## State

Riverpod owns presentation/application state, not domain logic. Active workout state is an `AsyncNotifier` backed by use cases and repository contracts, not volatile widget state. Settings are read through a reactive settings store with namespaced keys and mapped into domain-facing values.

## Data

Drift owns SQLite schema, migrations and typed persistence adapters. Feature data layers own repository implementations and mappers. All IDs remain text UUIDs. Foreign keys and WAL are enabled on connection open. Completed set writes happen through repository methods that can retry and surface a `DatabaseError`.

## UI

Flutter widgets must preserve the existing visual language: dark default, tonal surfaces, Inter, JetBrains Mono, no shadows, lavender primary, green success-only, icon-only accessible tabs, and Active Workout optimized for one-handed logging.

## Verification

Every migrated capability needs matching Dart tests before the screen is considered complete. Visual parity uses golden tests plus manual screenshots on Android hardware. Core loop parity uses `integration_test/core_loop_test.dart` and Maestro smoke when available.
```

- [ ] **Step 3: Create tasks checklist**

Write `openspec/changes/migrate-app-to-flutter/tasks.md`:

```markdown
# Tasks

- [ ] 1. Freeze current Expo baseline and document parity gates.
- [ ] 2. Scaffold Flutter app in `flutter-version/`.
- [ ] 3. Port design tokens, radii and theme token tests.
- [ ] 4. Port domain entities, IDs, units, volume, 1RM and PR detection into feature domain layers.
- [ ] 5. Port SQLite schema, migrations, seed data and repositories.
- [ ] 6. Port settings, onboarding completion and data bridge.
- [ ] 7. Port navigation shell and all routes.
- [ ] 8. Port shared UI components.
- [ ] 9. Port onboarding, home, routines, exercises, active workout, summary, history and settings.
- [ ] 10. Port export, import and delete data.
- [ ] 11. Add golden, widget and integration smoke coverage.
- [ ] 12. Run parity gate and manual Android verification.
- [ ] 13. Update docs and archive Expo-specific specs.
- [ ] 14. Cut over to Flutter and remove Expo only after parity passes.
```

- [ ] **Step 4: Add project foundation delta**

Write `openspec/changes/migrate-app-to-flutter/specs/project-foundation/spec.md`:

```markdown
## MODIFIED Requirements

### Requirement: SDK-aligned dependencies
The project SHALL use Flutter stable and Dart 3 dependencies declared in `flutter-version/pubspec.yaml`.

#### Scenario: Flutter dependencies are installed
- **WHEN** `cd flutter-version && flutter pub get` runs
- **THEN** dependency resolution succeeds
- **AND** `flutter-version/pubspec.lock` is updated.

### Requirement: Source structure exists
The project SHALL contain a Flutter source structure under `flutter-version/lib` with app, core, theme, storage, features, i18n and widgets folders. Migrated features SHALL use `presentation`, `application`, `domain` and `data` subdirectories.

#### Scenario: Folder structure matches Flutter architecture
- **WHEN** the repository is inspected
- **THEN** `flutter-version/lib/app`, `flutter-version/lib/core`, `flutter-version/lib/storage`, `flutter-version/lib/features`, and `flutter-version/lib/theme` exist
- **AND** each migrated feature has `presentation`, `application`, `domain` and `data` subdirectories.

### Requirement: Clean Architecture boundaries
The Flutter app SHALL enforce Clean Architecture boundaries for migrated features.

#### Scenario: Domain stays pure Dart
- **WHEN** `flutter-version/lib/features/*/domain` and `flutter-version/lib/core` are inspected
- **THEN** they do not import Flutter, Riverpod, Drift, SQLite, platform APIs, widgets or generated database rows.

### Requirement: Flutter app validates
The Flutter app SHALL pass static analysis and tests.

#### Scenario: Flutter analyze validates
- **WHEN** `cd flutter-version && flutter analyze` runs
- **THEN** it exits with code 0.
```

- [ ] **Step 5: Add testing delta**

Write `openspec/changes/migrate-app-to-flutter/specs/agent-mobile-testing/spec.md`:

```markdown
## MODIFIED Requirements

### Requirement: Agent-neutral test commands
The system SHALL expose agent-neutral Flutter verification commands for Codex, Copilot and Opencode.

#### Scenario: Agent runs Flutter smoke
- **WHEN** `cd flutter-version && flutter test integration_test/core_loop_test.dart` runs against an available simulator or device
- **THEN** it covers the core loop from routine creation through workout summary.

### Requirement: Stable mobile selectors
Flutter interactive widgets in smoke-covered flows SHALL use stable `ValueKey` values that preserve the existing selector names where practical.

#### Scenario: Active set input has stable key
- **WHEN** the Active Workout set row renders the first weight input
- **THEN** the widget key is `active-set-1-weight-input`.
```

- [ ] **Step 6: Validate OpenSpec change**

Run:

```bash
openspec validate migrate-app-to-flutter --strict
```

Expected: PASS. If it fails because more spec deltas are required, add only the missing deltas reported by OpenSpec and rerun.

### Task 3: Scaffold Flutter App

**Files:**
- Create: `flutter-version/`
- Modify: `flutter-version/pubspec.yaml`
- Modify: `flutter-version/analysis_options.yaml`
- Create: `flutter-version/lib/main.dart`
- Create: `flutter-version/lib/app/zenlift_app.dart`
- Create: `flutter-version/lib/app/bootstrap.dart`

- [ ] **Step 1: Create Flutter app**

Run:

```bash
flutter create --org com.zenlift --project-name zenlift flutter-version
```

Expected: Flutter creates `flutter-version/` with Android and iOS runners.

- [ ] **Step 2: Add dependencies**

Run:

```bash
cd flutter-version
flutter pub add go_router flutter_riverpod drift sqlite3_flutter_libs path path_provider shared_preferences intl uuid fl_chart
flutter pub add --dev drift_dev build_runner
```

Expected: `pubspec.yaml` and `pubspec.lock` update successfully.

- [ ] **Step 3: Configure assets and fonts**

Modify `flutter-version/pubspec.yaml` to include:

```yaml
flutter:
  uses-material-design: true
  assets:
    - assets/data/exercise.json
    - assets/images/exercises/
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/inter/Inter-Regular.ttf
          weight: 400
        - asset: assets/fonts/inter/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/inter/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/inter/Inter-Bold.ttf
          weight: 700
    - family: JetBrains Mono
      fonts:
        - asset: assets/fonts/jetbrains_mono/JetBrainsMono-Medium.ttf
          weight: 500
```

Copy assets from the Expo app:

```bash
mkdir -p flutter-version/assets/data flutter-version/assets/images
cp assets/exercise.json flutter-version/assets/data/exercise.json
cp -R assets/images/exercises flutter-version/assets/images/exercises
```

Expected: copied files exist under `flutter-version/assets`.

- [ ] **Step 4: Create root app shell**

Write `flutter-version/lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/bootstrap.dart';
import 'app/zenlift_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final bootstrap = await bootstrapZenlift();

  runApp(
    ProviderScope(
      overrides: bootstrap.overrides,
      child: const ZenliftApp(),
    ),
  );
}
```

Write `flutter-version/lib/app/bootstrap.dart`:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final class ZenliftBootstrap {
  const ZenliftBootstrap({this.overrides = const []});

  final List<Override> overrides;
}

Future<ZenliftBootstrap> bootstrapZenlift() async {
  return const ZenliftBootstrap();
}
```

Write `flutter-version/lib/app/zenlift_app.dart`:

```dart
import 'package:flutter/material.dart';

import '../theme/zenlift_theme.dart';
import 'router.dart';

class ZenliftApp extends StatelessWidget {
  const ZenliftApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Zenlift',
      debugShowCheckedModeBanner: false,
      theme: buildZenliftDarkTheme(),
      routerConfig: zenliftRouter,
    );
  }
}
```

- [ ] **Step 5: Verify scaffold**

Run:

```bash
cd flutter-version
flutter analyze
flutter test
```

Expected: PASS. The scaffold includes a minimal router and theme foundation before feature UI work starts.

### Task 4: Port Design Tokens And Theme

**Files:**
- Create: `flutter-version/lib/theme/zenlift_colors.dart`
- Create: `flutter-version/lib/theme/zenlift_spacing.dart`
- Create: `flutter-version/lib/theme/zenlift_radii.dart`
- Create: `flutter-version/lib/theme/zenlift_typography.dart`
- Create: `flutter-version/lib/theme/zenlift_theme.dart`
- Create: `flutter-version/test/theme/zenlift_theme_test.dart`

- [ ] **Step 1: Write token tests**

Write `flutter-version/test/theme/zenlift_theme_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_colors.dart';
import 'package:zenlift/theme/zenlift_radii.dart';
import 'package:zenlift/theme/zenlift_spacing.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/theme/zenlift_typography.dart';

void main() {
  test('dark theme uses DESIGN.md colors', () {
    final theme = buildZenliftDarkTheme();

    expect(theme.brightness, Brightness.dark);
    expect(theme.colorScheme.surface, ZenliftColors.surface);
    expect(theme.colorScheme.surfaceContainerLow, ZenliftColors.surfaceContainerLow);
    expect(theme.colorScheme.surfaceContainerHighest, ZenliftColors.surfaceContainerHighest);
    expect(theme.colorScheme.primary, ZenliftColors.primary);
    expect(theme.colorScheme.onPrimary, ZenliftColors.onPrimary);
    expect(theme.colorScheme.primaryContainer, ZenliftColors.primaryContainer);
    expect(theme.colorScheme.secondary, ZenliftColors.secondary);
    expect(theme.colorScheme.tertiary, ZenliftColors.tertiary);
    expect(theme.colorScheme.error, ZenliftColors.error);
    expect(theme.colorScheme.errorContainer, ZenliftColors.errorContainer);
    expect(theme.colorScheme.inverseSurface, ZenliftColors.inverseSurface);
    expect(theme.colorScheme.outline, ZenliftColors.outline);
    expect(theme.scaffoldBackgroundColor, ZenliftColors.background);
  });

  test('ports fixed and surface tint tokens', () {
    final scheme = buildZenliftDarkTheme().colorScheme;

    expect(scheme.primaryFixed, ZenliftColors.primaryFixed);
    expect(scheme.secondaryFixed, ZenliftColors.secondaryFixed);
    expect(scheme.tertiaryFixed, ZenliftColors.tertiaryFixed);
    expect(scheme.surfaceTint, ZenliftColors.surfaceTint);
  });

  test('green is not the primary color', () {
    expect(ZenliftColors.primary.toARGB32(), isNot(const Color(0xff00ff00).toARGB32()));
    expect(ZenliftColors.success.toARGB32(), isNot(ZenliftColors.primary.toARGB32()));
  });

  test('typography maps Inter and JetBrains Mono roles', () {
    final textTheme = buildZenliftDarkTheme().textTheme;

    expect(textTheme.displayLarge?.fontFamily, 'Inter');
    expect(textTheme.displayLarge?.fontSize, 40);
    expect(textTheme.displayLarge?.fontWeight, FontWeight.w700);
    expect(textTheme.headlineLarge?.fontFamily, 'Inter');
    expect(textTheme.headlineLarge?.fontSize, 32);
    expect(textTheme.bodyLarge?.fontFamily, 'Inter');
    expect(textTheme.bodyLarge?.fontSize, 16);
    expect(textTheme.labelMedium?.fontFamily, 'JetBrains Mono');
    expect(ZenliftTypography.dataLarge.fontFamily, 'JetBrains Mono');
  });

  test('spacing and radius tokens match DESIGN.md component rules', () {
    expect(ZenliftSpacing.lateral, 24);
    expect(ZenliftSpacing.gutter, 16);
    expect(ZenliftSpacing.cardPadding, 20);
    expect(ZenliftRadii.base, 8);
    expect(ZenliftRadii.card.x, 12);
    expect(ZenliftRadii.pill.x, 9999);
  });

  test('cards use tonal layering with no shadow', () {
    final cardTheme = buildZenliftDarkTheme().cardTheme;
    final shape = cardTheme.shape! as RoundedRectangleBorder;
    final borderRadius = shape.borderRadius as BorderRadius;

    expect(cardTheme.color, ZenliftColors.surfaceContainerLow);
    expect(cardTheme.elevation, 0);
    expect(cardTheme.margin, EdgeInsets.zero);
    expect(borderRadius.topLeft, ZenliftRadii.card);
  });
}
```

- [ ] **Step 2: Run failing theme tests**

Run:

```bash
cd flutter-version
flutter test test/theme/zenlift_theme_test.dart
```

Expected: FAIL because `zenlift_colors.dart` and `zenlift_theme.dart` do not exist.

- [ ] **Step 3: Implement tokens**

Write `flutter-version/lib/theme/zenlift_colors.dart`:

```dart
import 'package:flutter/material.dart';

abstract final class ZenliftColors {
  static const background = Color(0xff141218);
  static const onBackground = Color(0xffe6e0e9);
  static const surface = Color(0xff141218);
  static const surfaceDim = Color(0xff141218);
  static const surfaceBright = Color(0xff3b383e);
  static const surfaceContainerLowest = Color(0xff0f0d13);
  static const surfaceContainerLow = Color(0xff1d1b20);
  static const surfaceContainer = Color(0xff211f24);
  static const surfaceContainerHigh = Color(0xff2b292f);
  static const surfaceContainerHighest = Color(0xff36343a);
  static const surfaceVariant = Color(0xff36343a);
  static const surfaceTint = Color(0xffcfbcff);
  static const onSurface = Color(0xffe6e0e9);
  static const onSurfaceVariant = Color(0xffcbc4d2);
  static const inverseSurface = Color(0xffe6e0e9);
  static const inverseOnSurface = Color(0xff322f35);
  static const outline = Color(0xff948e9c);
  static const outlineVariant = Color(0xff494551);
  static const primary = Color(0xffcfbcff);
  static const onPrimary = Color(0xff381e72);
  static const primaryContainer = Color(0xff6750a4);
  static const onPrimaryContainer = Color(0xffe0d2ff);
  static const inversePrimary = Color(0xff6750a4);
  static const primaryFixed = Color(0xffe9ddff);
  static const primaryFixedDim = Color(0xffcfbcff);
  static const onPrimaryFixed = Color(0xff22005d);
  static const onPrimaryFixedVariant = Color(0xff4f378a);
  static const secondary = Color(0xffcdc0e9);
  static const onSecondary = Color(0xff342b4b);
  static const secondaryContainer = Color(0xff4d4465);
  static const onSecondaryContainer = Color(0xffbfb2da);
  static const secondaryFixed = Color(0xffe9ddff);
  static const secondaryFixedDim = Color(0xffcdc0e9);
  static const onSecondaryFixed = Color(0xff1f1635);
  static const onSecondaryFixedVariant = Color(0xff4b4263);
  static const tertiary = Color(0xffe7c365);
  static const onTertiary = Color(0xff3e2e00);
  static const tertiaryContainer = Color(0xffc9a74d);
  static const onTertiaryContainer = Color(0xff503d00);
  static const tertiaryFixed = Color(0xffffdf93);
  static const tertiaryFixedDim = Color(0xffe7c365);
  static const onTertiaryFixed = Color(0xff241a00);
  static const onTertiaryFixedVariant = Color(0xff594400);
  static const error = Color(0xffffb4ab);
  static const onError = Color(0xff690005);
  static const errorContainer = Color(0xff93000a);
  static const onErrorContainer = Color(0xffffdad6);
  static const success = Color(0xff5ee08d);
}
```

Write `flutter-version/lib/theme/zenlift_spacing.dart`:

```dart
abstract final class ZenliftSpacing {
  static const lateral = 24.0;
  static const gutter = 16.0;
  static const stackSm = 8.0;
  static const stackMd = 16.0;
  static const stackLg = 32.0;
  static const cardPadding = 20.0;
}
```

Write `flutter-version/lib/theme/zenlift_radii.dart`:

```dart
import 'package:flutter/material.dart';

abstract final class ZenliftRadii {
  static const small = 4.0;
  static const base = 8.0;
  static const medium = 12.0;
  static const large = 16.0;
  static const extraLarge = 24.0;
  static const full = 9999.0;

  static const card = Radius.circular(medium);
  static const compactControl = Radius.circular(base);
  static const pill = Radius.circular(full);
}
```

Write `flutter-version/lib/theme/zenlift_typography.dart`:

```dart
import 'package:flutter/material.dart';

abstract final class ZenliftTypography {
  static const displayLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 40,
    fontWeight: FontWeight.w700,
    height: 1.1,
  );

  static const headlineLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: FontWeight.w600,
    height: 1.2,
  );

  static const headlineMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.3,
  );

  static const bodyLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );

  static const bodyMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );

  static const dataLarge = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontSize: 24,
    fontWeight: FontWeight.w500,
    height: 1.2,
  );

  static const dataMedium = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.4,
  );
}
```

Write `flutter-version/lib/theme/zenlift_theme.dart`:

```dart
import 'package:flutter/material.dart';

import 'zenlift_colors.dart';
import 'zenlift_radii.dart';
import 'zenlift_typography.dart';

ThemeData buildZenliftDarkTheme() {
  const colorScheme = ColorScheme.dark(
    primary: ZenliftColors.primary,
    onPrimary: ZenliftColors.onPrimary,
    primaryContainer: ZenliftColors.primaryContainer,
    onPrimaryContainer: ZenliftColors.onPrimaryContainer,
    inversePrimary: ZenliftColors.inversePrimary,
    primaryFixed: ZenliftColors.primaryFixed,
    primaryFixedDim: ZenliftColors.primaryFixedDim,
    onPrimaryFixed: ZenliftColors.onPrimaryFixed,
    onPrimaryFixedVariant: ZenliftColors.onPrimaryFixedVariant,
    secondary: ZenliftColors.secondary,
    onSecondary: ZenliftColors.onSecondary,
    secondaryContainer: ZenliftColors.secondaryContainer,
    onSecondaryContainer: ZenliftColors.onSecondaryContainer,
    secondaryFixed: ZenliftColors.secondaryFixed,
    secondaryFixedDim: ZenliftColors.secondaryFixedDim,
    onSecondaryFixed: ZenliftColors.onSecondaryFixed,
    onSecondaryFixedVariant: ZenliftColors.onSecondaryFixedVariant,
    tertiary: ZenliftColors.tertiary,
    onTertiary: ZenliftColors.onTertiary,
    tertiaryContainer: ZenliftColors.tertiaryContainer,
    onTertiaryContainer: ZenliftColors.onTertiaryContainer,
    tertiaryFixed: ZenliftColors.tertiaryFixed,
    tertiaryFixedDim: ZenliftColors.tertiaryFixedDim,
    onTertiaryFixed: ZenliftColors.onTertiaryFixed,
    onTertiaryFixedVariant: ZenliftColors.onTertiaryFixedVariant,
    surface: ZenliftColors.surface,
    surfaceDim: ZenliftColors.surfaceDim,
    surfaceBright: ZenliftColors.surfaceBright,
    surfaceContainerLowest: ZenliftColors.surfaceContainerLowest,
    surfaceContainerLow: ZenliftColors.surfaceContainerLow,
    surfaceContainer: ZenliftColors.surfaceContainer,
    surfaceContainerHigh: ZenliftColors.surfaceContainerHigh,
    surfaceContainerHighest: ZenliftColors.surfaceContainerHighest,
    surfaceTint: ZenliftColors.surfaceTint,
    onSurface: ZenliftColors.onSurface,
    onSurfaceVariant: ZenliftColors.onSurfaceVariant,
    inverseSurface: ZenliftColors.inverseSurface,
    onInverseSurface: ZenliftColors.inverseOnSurface,
    outline: ZenliftColors.outline,
    outlineVariant: ZenliftColors.outlineVariant,
    error: ZenliftColors.error,
    onError: ZenliftColors.onError,
    errorContainer: ZenliftColors.errorContainer,
    onErrorContainer: ZenliftColors.onErrorContainer,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: ZenliftColors.background,
    colorScheme: colorScheme,
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      displayLarge: ZenliftTypography.displayLarge,
      headlineLarge: ZenliftTypography.headlineLarge,
      headlineMedium: ZenliftTypography.headlineMedium,
      bodyLarge: ZenliftTypography.bodyLarge,
      bodyMedium: ZenliftTypography.bodyMedium,
      labelMedium: ZenliftTypography.dataMedium,
    ),
    cardTheme: const CardThemeData(
      color: ZenliftColors.surfaceContainerLow,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(ZenliftRadii.card),
      ),
    ),
  );
}
```

- [ ] **Step 4: Verify theme**

Run:

```bash
cd flutter-version
flutter test test/theme/zenlift_theme_test.dart
flutter analyze
```

Expected: PASS.

### Task 5: Port Domain Entities And Pure Calculations

**Files:**
- Create: `flutter-version/lib/features/workout/domain/entities/*.dart`
- Create: `flutter-version/lib/features/workout/domain/calculations/volume.dart`
- Create: `flutter-version/lib/features/workout/domain/calculations/one_rm.dart`
- Create: `flutter-version/lib/features/settings/domain/units.dart`
- Create: `flutter-version/lib/features/workout/domain/services/pr_detection.dart`
- Create: `flutter-version/test/features/workout/domain/calculations/*_test.dart`
- Create: `flutter-version/test/features/workout/domain/services/pr_detection_test.dart`

- [ ] **Step 1: Write calculation tests**

Write `flutter-version/test/features/workout/domain/calculations/volume_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/workout/domain/calculations/volume.dart';

void main() {
  test('calculates set volume', () {
    expect(calculateSetVolume(weight: 62.5, reps: 8), 500);
  });

  test('ignores unfinished sets in session volume', () {
    final sets = [
      const VolumeSet(weight: 60, reps: 10, isCompleted: true),
      const VolumeSet(weight: 70, reps: 5, isCompleted: false),
    ];

    expect(calculateSessionVolume(sets), 600);
  });
}
```

Write `flutter-version/test/features/workout/domain/calculations/one_rm_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/workout/domain/calculations/one_rm.dart';

void main() {
  test('uses Epley formula', () {
    expect(estimateOneRepMax(weight: 100, reps: 5), closeTo(116.67, 0.01));
  });

  test('returns weight for one rep', () {
    expect(estimateOneRepMax(weight: 140, reps: 1), 140);
  });
}
```

Write `flutter-version/test/features/settings/domain/units_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/settings/domain/units.dart';

void main() {
  test('converts kg to lb', () {
    expect(kgToLb(100), closeTo(220.46, 0.01));
  });

  test('converts lb to kg', () {
    expect(lbToKg(220.462), closeTo(100, 0.01));
  });

  test('formats weight with unit', () {
    expect(formatWeight(62.5, WeightUnit.kg), '62.5 kg');
  });
}
```

- [ ] **Step 2: Run failing calculation tests**

Run:

```bash
cd flutter-version
flutter test test/features/workout/domain/calculations test/features/settings/domain
```

Expected: FAIL because feature domain files do not exist.

- [ ] **Step 3: Implement calculations**

Write `flutter-version/lib/features/workout/domain/calculations/volume.dart`:

```dart
final class VolumeSet {
  const VolumeSet({
    required this.weight,
    required this.reps,
    required this.isCompleted,
  });

  final double weight;
  final int reps;
  final bool isCompleted;
}

double calculateSetVolume({required double weight, required int reps}) {
  return weight * reps;
}

double calculateSessionVolume(Iterable<VolumeSet> sets) {
  return sets
      .where((set) => set.isCompleted)
      .fold<double>(0, (total, set) => total + calculateSetVolume(weight: set.weight, reps: set.reps));
}
```

Write `flutter-version/lib/features/workout/domain/calculations/one_rm.dart`:

```dart
double estimateOneRepMax({required double weight, required int reps}) {
  if (reps <= 1) {
    return weight;
  }

  return double.parse((weight * (1 + reps / 30)).toStringAsFixed(2));
}
```

Write `flutter-version/lib/features/settings/domain/units.dart`:

```dart
enum WeightUnit { kg, lb }

double kgToLb(double kg) => double.parse((kg * 2.20462).toStringAsFixed(2));

double lbToKg(double lb) => double.parse((lb / 2.20462).toStringAsFixed(2));

String formatWeight(double value, WeightUnit unit) {
  final hasDecimals = value % 1 != 0;
  final formatted = hasDecimals ? value.toStringAsFixed(1) : value.toStringAsFixed(0);
  return '$formatted ${unit.name}';
}
```

- [ ] **Step 4: Port entity enums**

Write `flutter-version/lib/features/workout/domain/entities/workout_entities.dart` with these enums:

```dart
enum MuscleRole { primary, secondary }

enum ExerciseCategory { strength, cardio, mobility, core }

enum SetType { normal, warmup, drop, failure, amrap }

enum WorkoutStatus { active, completed, cancelled }

enum PersonalRecordType {
  maxWeight,
  maxVolume,
  maxReps,
  estimatedOneRepMax,
  maxSessionVolume,
}
```

- [ ] **Step 5: Verify domain**

Run:

```bash
cd flutter-version
flutter test test/features/workout/domain test/features/settings/domain
flutter analyze
```

Expected: PASS.

### Task 6: Port SQLite Schema With Drift

**Files:**
- Create: `flutter-version/lib/storage/database/app_database.dart`
- Create: `flutter-version/lib/storage/database/database_connection.dart`
- Create: `flutter-version/test/storage/database/schema_test.dart`

- [ ] **Step 1: Write schema test**

Write `flutter-version/test/storage/database/schema_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/storage/database/app_database.dart';

void main() {
  test('database schema version starts at current migrated version', () {
    final database = AppDatabase.forTest();
    addTearDown(database.close);

    expect(database.schemaVersion, greaterThanOrEqualTo(1));
  });
}
```

- [ ] **Step 2: Run failing schema test**

Run:

```bash
cd flutter-version
flutter test test/storage/database/schema_test.dart
```

Expected: FAIL because `AppDatabase` does not exist.

- [ ] **Step 3: Implement complete Drift schema**

Write `flutter-version/lib/storage/database/app_database.dart`:

```dart
import 'package:drift/drift.dart';
import 'package:drift/native.dart';

part 'app_database.g.dart';

class MuscleGroups extends Table {
  TextColumn get id => text()();
  TextColumn get name => text().unique()();
  TextColumn get displayNameEs => text()();
  TextColumn get color => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class Exercises extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get equipment => text()();
  TextColumn get category => text()();
  BoolColumn get isCustom => boolean().withDefault(const Constant(false))();
  BoolColumn get isFavorite => boolean().withDefault(const Constant(false))();
  TextColumn get notes => text().nullable()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class ExerciseMuscles extends Table {
  TextColumn get id => text()();
  TextColumn get exerciseId => text().references(Exercises, #id, onDelete: KeyAction.cascade)();
  TextColumn get muscleGroupId => text().references(MuscleGroups, #id, onDelete: KeyAction.cascade)();
  TextColumn get role => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class Routines extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get description => text().nullable()();
  TextColumn get goal => text().nullable()();
  BoolColumn get isArchived => boolean().withDefault(const Constant(false))();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class RoutineDays extends Table {
  TextColumn get id => text()();
  TextColumn get routineId => text().references(Routines, #id, onDelete: KeyAction.cascade)();
  TextColumn get name => text()();
  IntColumn get dayOfWeek => integer().nullable()();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {id};
}

class RoutineExercises extends Table {
  TextColumn get id => text()();
  TextColumn get routineDayId => text().references(RoutineDays, #id, onDelete: KeyAction.cascade)();
  TextColumn get exerciseId => text().references(Exercises, #id)();
  IntColumn get targetSets => integer().nullable()();
  IntColumn get targetRepsMin => integer().nullable()();
  IntColumn get targetRepsMax => integer().nullable()();
  TextColumn get notes => text().nullable()();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {id};
}

class WorkoutSessions extends Table {
  TextColumn get id => text()();
  TextColumn get routineId => text().nullable()();
  TextColumn get routineDayId => text().nullable()();
  TextColumn get name => text().nullable()();
  TextColumn get startedAt => text()();
  TextColumn get endedAt => text().nullable()();
  IntColumn get durationSeconds => integer().nullable()();
  TextColumn get status => text()();
  TextColumn get notes => text().nullable()();
  TextColumn get createdAt => text()();
  TextColumn get updatedAt => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class WorkoutExercises extends Table {
  TextColumn get id => text()();
  TextColumn get workoutSessionId => text().references(WorkoutSessions, #id, onDelete: KeyAction.cascade)();
  TextColumn get exerciseId => text().references(Exercises, #id)();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();
  TextColumn get notes => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class SetLogs extends Table {
  TextColumn get id => text()();
  TextColumn get workoutExerciseId => text().references(WorkoutExercises, #id, onDelete: KeyAction.cascade)();
  IntColumn get setNumber => integer()();
  RealColumn get weight => real()();
  IntColumn get reps => integer()();
  TextColumn get setType => text().withDefault(const Constant('normal'))();
  BoolColumn get isCompleted => boolean().withDefault(const Constant(false))();
  TextColumn get completedAt => text().nullable()();
  TextColumn get notes => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class PersonalRecords extends Table {
  TextColumn get id => text()();
  TextColumn get exerciseId => text().references(Exercises, #id, onDelete: KeyAction.cascade)();
  TextColumn get workoutSessionId => text().references(WorkoutSessions, #id, onDelete: KeyAction.cascade)();
  TextColumn get type => text()();
  RealColumn get value => real()();
  RealColumn get weight => real().nullable()();
  IntColumn get reps => integer().nullable()();
  TextColumn get achievedAt => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class AppSettings extends Table {
  TextColumn get key => text()();
  TextColumn get value => text()();

  @override
  Set<Column> get primaryKey => {key};
}

class MigrationRows extends Table {
  @override
  String get tableName => '_migrations';

  IntColumn get version => integer()();
  TextColumn get description => text()();
  TextColumn get appliedAt => text()();

  @override
  Set<Column> get primaryKey => {version};
}

@DriftDatabase(
  tables: [
    MuscleGroups,
    Exercises,
    ExerciseMuscles,
    Routines,
    RoutineDays,
    RoutineExercises,
    WorkoutSessions,
    WorkoutExercises,
    SetLogs,
    PersonalRecords,
    AppSettings,
    MigrationRows,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  factory AppDatabase.forTest() {
    return AppDatabase(NativeDatabase.memory());
  }

  @override
  int get schemaVersion => 2;
}
```

- [ ] **Step 4: Generate Drift code**

Run:

```bash
cd flutter-version
dart run build_runner build --delete-conflicting-outputs
```

Expected: `flutter-version/lib/storage/database/app_database.g.dart` is generated.

- [ ] **Step 5: Verify schema**

Run:

```bash
cd flutter-version
flutter test test/storage/database/schema_test.dart
flutter analyze
```

Expected: PASS.

### Task 7: Port Repositories

**Files:**
- Create: `flutter-version/lib/storage/repositories/exercise_repository.dart`
- Create: `flutter-version/lib/storage/repositories/routine_repository.dart`
- Create: `flutter-version/lib/storage/repositories/workout_repository.dart`
- Create: `flutter-version/test/storage/repositories/*_test.dart`

- [ ] **Step 1: Write exercise repository test**

Write `flutter-version/test/storage/repositories/exercise_repository_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/storage/database/app_database.dart';
import 'package:zenlift/storage/repositories/exercise_repository.dart';

void main() {
  test('creates and retrieves custom exercise', () async {
    final db = AppDatabase.forTest();
    addTearDown(db.close);
    final repo = ExerciseRepository(db);

    await repo.createExercise(
      id: 'exercise-1',
      name: 'Press banca',
      equipment: 'barbell',
      category: 'strength',
      primaryMuscleId: 'chest',
      secondaryMuscleIds: const ['triceps'],
    );

    final exercise = await repo.getById('exercise-1');

    expect(exercise?.id, 'exercise-1');
    expect(exercise?.name, 'Press banca');
  });
}
```

- [ ] **Step 2: Run failing repository test**

Run:

```bash
cd flutter-version
flutter test test/storage/repositories/exercise_repository_test.dart
```

Expected: FAIL because repository methods do not exist.

- [ ] **Step 3: Implement repository API**

Write `flutter-version/lib/storage/repositories/exercise_repository.dart`:

```dart
import '../database/app_database.dart';

final class ExerciseReadModel {
  const ExerciseReadModel({
    required this.id,
    required this.name,
    required this.equipment,
    required this.category,
  });

  final String id;
  final String name;
  final String equipment;
  final String category;
}

final class ExerciseRepository {
  ExerciseRepository(this._db);

  final AppDatabase _db;

  Future<ExerciseReadModel?> getById(String id) async {
    final row = await (_db.select(_db.exercises)..where((table) => table.id.equals(id))).getSingleOrNull();
    if (row == null) {
      return null;
    }

    return ExerciseReadModel(
      id: row.id,
      name: row.name,
      equipment: row.equipment,
      category: row.category,
    );
  }

  Future<void> createExercise({
    required String id,
    required String name,
    required String equipment,
    required String category,
    required String primaryMuscleId,
    required List<String> secondaryMuscleIds,
  }) async {
    final now = DateTime.now().toIso8601String();
    await _db.into(_db.exercises).insert(
          ExercisesCompanion.insert(
            id: id,
            name: name,
            equipment: equipment,
            category: category,
            createdAt: now,
            updatedAt: now,
          ),
        );
  }
}
```

After this minimal pass, expand it to every requirement in `openspec/specs/exercise-repository/spec.md`: `getAll`, `getByMuscle`, `getByCategory`, `getByEquipment`, `search`, `getFavorites`, `update`, `delete`, `getMuscles`, `toggleFavorite`, `addMuscle`, `removeMuscle`, and read-only muscle group methods. Each method needs a matching test before implementation.

- [ ] **Step 4: Port routine repository method-by-method**

For each requirement in `openspec/specs/routine-repository/spec.md`, add one failing test and one implementation method. Required methods:

```dart
Future<List<RoutineReadModel>> listRoutines({bool includeArchived = false});
Future<RoutineReadModel?> getRoutineById(String id);
Future<FullRoutineReadModel?> getFullRoutine(String id);
Future<void> createRoutine(CreateRoutineInput input);
Future<void> updateRoutine(UpdateRoutineInput input);
Future<void> archiveRoutine(String id);
Future<void> unarchiveRoutine(String id);
Future<void> deleteRoutine(String id);
Future<String> duplicateRoutine(String id);
Future<List<RoutineDayReadModel>> getDaysForRoutine(String routineId);
Future<void> createRoutineDay(CreateRoutineDayInput input);
Future<void> updateRoutineDay(UpdateRoutineDayInput input);
Future<void> deleteRoutineDay(String id);
Future<void> reorderDays(List<ReorderInput> inputs);
Future<List<RoutineExerciseReadModel>> getExercisesForDay(String routineDayId);
Future<void> createRoutineExercise(CreateRoutineExerciseInput input);
Future<void> updateRoutineExercise(UpdateRoutineExerciseInput input);
Future<void> deleteRoutineExercise(String id);
Future<void> reorderExercises(List<ReorderInput> inputs);
```

- [ ] **Step 5: Port workout repository method-by-method**

For each requirement in `openspec/specs/workout-repository/spec.md`, add one failing test and one implementation method. Required methods:

```dart
Future<void> createSession(CreateWorkoutSessionInput input);
Future<void> updateSession(UpdateWorkoutSessionInput input);
Future<void> completeSession(String sessionId, DateTime endedAt);
Future<WorkoutSessionReadModel?> getActiveSession();
Future<List<WorkoutSessionReadModel>> getHistory({int limit = 100});
Future<FullWorkoutSessionReadModel?> getFullSession(String id);
Future<void> addExerciseToSession(AddWorkoutExerciseInput input);
Future<void> removeExerciseFromSession(String workoutExerciseId);
Future<List<PreviousPerformanceReadModel>> getPreviousPerformance(String exerciseId);
Future<void> createSetLog(CreateSetLogInput input);
Future<void> updateSetLog(UpdateSetLogInput input);
Future<void> completeSetLog(String setLogId, DateTime completedAt);
Future<void> deleteSetLog(String setLogId);
Future<void> savePersonalRecords(List<CreatePersonalRecordInput> inputs);
```

- [ ] **Step 6: Verify repositories**

Run:

```bash
cd flutter-version
flutter test test/storage/repositories
flutter analyze
```

Expected: PASS.

### Task 8: Port Settings And Onboarding State

**Files:**
- Create: `flutter-version/lib/features/settings/domain/settings_repository.dart`
- Create: `flutter-version/lib/features/settings/data/local_settings_store.dart`
- Create: `flutter-version/lib/features/settings/application/settings_controller.dart`
- Create: `flutter-version/lib/features/onboarding/application/onboarding_controller.dart`
- Create: `flutter-version/test/features/settings/application/settings_controller_test.dart`

- [ ] **Step 1: Write settings tests**

Write `flutter-version/test/features/settings/application/settings_controller_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/settings/domain/units.dart';
import 'package:zenlift/features/settings/data/local_settings_store.dart';

void main() {
  test('defaults match current Zenlift settings', () async {
    final store = InMemorySettingsStore();

    expect(await store.readWeightUnit(), WeightUnit.kg);
    expect(await store.readThemeMode(), ZenliftThemeMode.dark);
    expect(await store.readWeeklyGoal(), 3);
  });

  test('weekly goal clamps to allowed range', () async {
    final store = InMemorySettingsStore();

    await store.writeWeeklyGoal(99);

    expect(await store.readWeeklyGoal(), 7);
  });
}
```

- [ ] **Step 2: Implement settings store**

Write `flutter-version/lib/features/settings/domain/settings_repository.dart`:

```dart
import 'units.dart';

enum ZenliftThemeMode { dark, light, system }

abstract interface class SettingsRepository {
  Future<WeightUnit> readWeightUnit();
  Future<void> writeWeightUnit(WeightUnit unit);
  Future<ZenliftThemeMode> readThemeMode();
  Future<void> writeThemeMode(ZenliftThemeMode mode);
  Future<int> readWeeklyGoal();
  Future<void> writeWeeklyGoal(int goal);
  Future<bool> readOnboardingCompleted();
  Future<void> writeOnboardingCompleted(bool completed);
}
```

Write `flutter-version/lib/features/settings/data/local_settings_store.dart`:

```dart
import '../domain/settings_repository.dart';
import '../domain/units.dart';

final class InMemorySettingsStore implements SettingsRepository {
  WeightUnit _weightUnit = WeightUnit.kg;
  ZenliftThemeMode _themeMode = ZenliftThemeMode.dark;
  int _weeklyGoal = 3;
  bool _onboardingCompleted = false;

  @override
  Future<WeightUnit> readWeightUnit() async => _weightUnit;

  @override
  Future<void> writeWeightUnit(WeightUnit unit) async {
    _weightUnit = unit;
  }

  @override
  Future<ZenliftThemeMode> readThemeMode() async => _themeMode;

  @override
  Future<void> writeThemeMode(ZenliftThemeMode mode) async {
    _themeMode = mode;
  }

  @override
  Future<int> readWeeklyGoal() async => _weeklyGoal;

  @override
  Future<void> writeWeeklyGoal(int goal) async {
    _weeklyGoal = goal.clamp(1, 7);
  }

  @override
  Future<bool> readOnboardingCompleted() async => _onboardingCompleted;

  @override
  Future<void> writeOnboardingCompleted(bool completed) async {
    _onboardingCompleted = completed;
  }
}
```

- [ ] **Step 3: Verify settings**

Run:

```bash
cd flutter-version
flutter test test/features/settings/settings_controller_test.dart
```

Expected: PASS.

### Task 9: Port Navigation Shell

**Files:**
- Create: `flutter-version/lib/app/router.dart`
- Create: `flutter-version/lib/widgets/navigation/zenlift_scaffold.dart`
- Create: `flutter-version/lib/widgets/navigation/zenlift_bottom_nav.dart`
- Create: `flutter-version/test/app/router_test.dart`

- [ ] **Step 1: Write route smoke test**

Write `flutter-version/test/app/router_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/app/router.dart';

void main() {
  test('core routes are registered', () {
    final paths = zenliftRoutePaths();

    expect(paths, contains('/'));
    expect(paths, contains('/routines'));
    expect(paths, contains('/exercise'));
    expect(paths, contains('/history'));
    expect(paths, contains('/settings'));
    expect(paths, contains('/workout/active'));
    expect(paths, contains('/workout/summary'));
  });
}
```

- [ ] **Step 2: Implement router**

Write `flutter-version/lib/app/router.dart`:

```dart
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import '../features/exercises/exercise_library_screen.dart';
import '../features/history/history_screen.dart';
import '../features/home/home_screen.dart';
import '../features/routines/routines_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/workout/active_workout_screen.dart';
import '../features/workout/workout_summary_screen.dart';

final zenliftRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/routines', builder: (_, __) => const RoutinesScreen()),
    GoRoute(path: '/exercise', builder: (_, __) => const ExerciseLibraryScreen()),
    GoRoute(path: '/history', builder: (_, __) => const HistoryScreen()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    GoRoute(path: '/workout/active', builder: (_, __) => const ActiveWorkoutScreen()),
    GoRoute(path: '/workout/summary', builder: (_, __) => const WorkoutSummaryScreen()),
  ],
);

List<String> zenliftRoutePaths() {
  return ['/', '/routines', '/exercise', '/history', '/settings', '/workout/active', '/workout/summary'];
}
```

Create temporary screen stubs in each referenced feature folder so the router compiles. Each stub must render `Scaffold(body: Text('<screen name>'))` and be replaced in the relevant feature task.

- [ ] **Step 3: Verify router**

Run:

```bash
cd flutter-version
flutter test test/app/router_test.dart
flutter analyze
```

Expected: PASS.

### Task 10: Port Shared UI Components

**Files:**
- Create: `flutter-version/lib/widgets/ui/zenlift_card.dart`
- Create: `flutter-version/lib/widgets/ui/zenlift_button.dart`
- Create: `flutter-version/lib/widgets/ui/zenlift_search_bar.dart`
- Create: `flutter-version/lib/widgets/ui/filter_chip.dart`
- Create: `flutter-version/lib/widgets/ui/muscle_badge.dart`
- Create: `flutter-version/lib/widgets/workout/set_row.dart`
- Create: `flutter-version/test/golden/shared_components_golden_test.dart`

- [ ] **Step 1: Write component tests**

Write `flutter-version/test/golden/shared_components_golden_test.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/widgets/ui/zenlift_card.dart';

void main() {
  testWidgets('ZenliftCard uses tonal surface without elevation', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: const Scaffold(
          body: ZenliftCard(
            child: Text('Rutina actual'),
          ),
        ),
      ),
    );

    expect(find.text('Rutina actual'), findsOneWidget);
    final material = tester.widget<Material>(find.byType(Material).last);
    expect(material.elevation, 0);
  });
}
```

- [ ] **Step 2: Implement card**

Write `flutter-version/lib/widgets/ui/zenlift_card.dart`:

```dart
import 'package:flutter/material.dart';

import '../../theme/zenlift_colors.dart';
import '../../theme/zenlift_radii.dart';
import '../../theme/zenlift_spacing.dart';

class ZenliftCard extends StatelessWidget {
  const ZenliftCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(ZenliftSpacing.cardPadding),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: ZenliftColors.surfaceContainerLow,
      elevation: 0,
      borderRadius: const BorderRadius.all(ZenliftRadii.card),
      child: Padding(
        padding: padding,
        child: child,
      ),
    );
  }
}
```

- [ ] **Step 3: Implement remaining shared components**

Port each existing React Native component to Flutter with a widget test before implementation:

| React Native source | Flutter target | Required test assertion |
|---|---|---|
| `src/components/ui/Card.tsx` | `zenlift_card.dart` | no elevation, 12px radius, tonal surface |
| `src/components/ui/FAB.tsx` | `zenlift_fab.dart` | 48px minimum target and accessible label |
| `src/components/ui/SearchBar.tsx` | `zenlift_search_bar.dart` | search input has `ValueKey('exercise-search-input')` |
| `src/components/ui/FilterChip.tsx` | `filter_chip.dart` | selected and unselected states are visible without color-only dependency |
| `src/components/ui/MuscleBadge.tsx` | `muscle_badge.dart` | muscle name and color dot render |
| `src/components/workout/SetRow.tsx` | `set_row.dart` | weight/reps input keys and complete button render |

- [ ] **Step 4: Verify shared UI**

Run:

```bash
cd flutter-version
flutter test test/golden/shared_components_golden_test.dart
flutter test test/widgets
flutter analyze
```

Expected: PASS.

### Task 11: Port Screens By Core Loop Priority

**Files:**
- Create/Modify: `flutter-version/lib/features/onboarding/*`
- Create/Modify: `flutter-version/lib/features/home/*`
- Create/Modify: `flutter-version/lib/features/routines/*`
- Create/Modify: `flutter-version/lib/features/exercises/*`
- Create/Modify: `flutter-version/lib/features/workout/*`
- Create/Modify: `flutter-version/lib/features/history/*`
- Create/Modify: `flutter-version/lib/features/settings/*`
- Create: `flutter-version/test/features/*`

- [ ] **Step 1: Port Active Workout first**

Write widget tests for `ActiveWorkoutScreen` before implementation:

```dart
testWidgets('active workout renders editable set rows and finish action', (tester) async {
  await pumpActiveWorkout(tester);

  expect(find.byKey(const ValueKey('active-workout-screen')), findsOneWidget);
  expect(find.byKey(const ValueKey('active-set-1-weight-input')), findsOneWidget);
  expect(find.byKey(const ValueKey('active-set-1-reps-input')), findsOneWidget);
  expect(find.byKey(const ValueKey('active-workout-finish')), findsOneWidget);
});
```

Implementation must preserve:

- Header duration visible.
- Exercise list always usable.
- Previous performance visible.
- Weight/reps inputs use numeric keyboard.
- Completed set writes through `WorkoutRepository.completeSetLog`.
- Haptic feedback on native where Flutter APIs permit it.
- Finish validates completed sets, calculates volume, detects PRs and navigates to summary.

- [ ] **Step 2: Port routine creation and detail**

Required widget tests:

```dart
testWidgets('routine form saves nested days and exercises', (tester) async {
  await pumpRoutineForm(tester);

  await tester.enterText(find.byKey(const ValueKey('routine-name-input')), 'Push Pull Legs');
  await tester.tap(find.byKey(const ValueKey('routine-add-day')));
  await tester.pumpAndSettle();

  expect(find.text('Push Pull Legs'), findsOneWidget);
});
```

Implementation must preserve create/edit screens, dynamic days, exercise picker, nested transactional save, unsaved warning and post-save route behavior.

- [ ] **Step 3: Port exercise library and detail**

Required widget tests:

```dart
testWidgets('exercise library filters by search text', (tester) async {
  await pumpExerciseLibrary(tester);

  await tester.enterText(find.byKey(const ValueKey('exercise-picker-search')), 'bench');
  await tester.pump(const Duration(milliseconds: 350));

  expect(find.textContaining('Bench'), findsWidgets);
});
```

Implementation must preserve search debounce, muscle/equipment filters, favorites, create custom exercise, detail cards, PR list, recent history and progress chart.

- [ ] **Step 4: Port home, history, summary and settings**

Required behavior:

- Home shows greeting, start workout CTA, calendar widget, weekly activity, current routine and recent PRs from real repositories.
- History lists completed sessions by date and opens session details if the current app supports that route.
- Summary shows duration, volume, completed sets, exercises and PRs.
- Settings exposes kg/lb, theme mode, weekly goal, export, import, delete data and about.

- [ ] **Step 5: Verify feature widgets**

Run:

```bash
cd flutter-version
flutter test test/features
flutter analyze
```

Expected: PASS.

### Task 12: Data Export, Import, Delete And Migration Bridge

**Files:**
- Create: `flutter-version/lib/storage/migration_bridge/zenlift_export.dart`
- Create: `flutter-version/lib/storage/migration_bridge/zenlift_import.dart`
- Create: `flutter-version/lib/storage/migration_bridge/first_launch_migrator.dart`
- Create: `flutter-version/test/storage/migration_bridge/*_test.dart`
- Modify only if required: `src/features/settings/dataPortability.ts`

- [ ] **Step 1: Preserve `.zenlift` export contract**

Write a Dart test that loads a fixture export generated from the current Expo app and verifies:

```dart
expect(export.metadata.schemaVersion, greaterThanOrEqualTo(1));
expect(export.tables, contains('workout_sessions'));
expect(export.tables, contains('set_logs'));
expect(export.tables, contains('routines'));
expect(export.tables, contains('exercises'));
```

- [ ] **Step 2: Implement Flutter import parser**

Create parser methods:

```dart
Future<ZenliftExport> parseZenliftExport(String jsonText);
Future<void> importZenliftExport(ZenliftExport export, AppDatabase database);
```

Rules:

- Reject missing `metadata`.
- Reject unknown table payload type.
- Merge by UUID.
- Do not delete local rows during import.
- Preserve historical workout sessions.
- Recalculate derived PR/progress after import.

- [ ] **Step 3: Add first-launch migration bridge**

Implement `FirstLaunchMigrator`:

```dart
final class FirstLaunchMigrator {
  FirstLaunchMigrator({
    required this.settings,
    required this.importer,
  });

  final LocalSettingsStore settings;
  final ZenliftImportService importer;

  Future<void> runOnce() async {
    final alreadyRan = await settings.readMigrationBridgeCompleted();
    if (alreadyRan) {
      return;
    }

    await importer.importBundledBridgeIfPresent();
    await settings.writeMigrationBridgeCompleted(true);
  }
}
```

Add `readMigrationBridgeCompleted` and `writeMigrationBridgeCompleted` to `LocalSettingsStore` with tests.

- [ ] **Step 4: Decide bridge release strategy**

If production users already have Expo local data, implement a final Expo release that writes a `.zenlift` bridge JSON to the shared documents directory before Flutter cutover. If there are no production users, document that the migration bridge supports manual import/export only and no automatic upgrade is required.

- [ ] **Step 5: Verify data operations**

Run:

```bash
cd flutter-version
flutter test test/storage/migration_bridge
flutter test test/features/settings
```

Expected: PASS.

### Task 13: Golden Tests And Visual Parity

**Files:**
- Create: `flutter-version/test/golden/golden_test_helpers.dart`
- Create: `flutter-version/test/golden/*_golden_test.dart`
- Update: `docs/flutter_migration/design_parity.md`

- [ ] **Step 1: Create golden helper**

Write `flutter-version/test/golden/golden_test_helpers.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

Future<void> pumpGoldenScreen(
  WidgetTester tester,
  Widget child, {
  Size size = const Size(390, 844),
}) async {
  await tester.binding.setSurfaceSize(size);
  await tester.pumpWidget(
    MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: child,
    ),
  );
  await tester.pumpAndSettle();
}
```

- [ ] **Step 2: Add golden coverage**

For each screen in `docs/flutter_migration/design_parity.md`, add a golden test:

```dart
testWidgets('active workout expanded matches dark design', (tester) async {
  await pumpGoldenScreen(tester, const ActiveWorkoutScreen());
  await expectLater(
    find.byType(ActiveWorkoutScreen),
    matchesGoldenFile('goldens/active_workout_expanded.png'),
  );
});
```

- [ ] **Step 3: Generate goldens**

Run:

```bash
cd flutter-version
flutter test --update-goldens test/golden
```

Expected: golden PNGs are generated.

- [ ] **Step 4: Review screenshots manually**

Open generated goldens and compare against current Expo screenshots. Required checks:

- No text overflow on 390x844.
- Active Workout inputs are reachable with one hand.
- Cards are tonal, not shadowed.
- Green appears only on success/completed states.
- Bottom tabs are icon-only with semantics.

- [ ] **Step 5: Verify goldens**

Run:

```bash
cd flutter-version
flutter test test/golden
```

Expected: PASS.

### Task 14: Integration Smoke For Core Loop

**Files:**
- Create: `flutter-version/integration_test/core_loop_test.dart`
- Create: `flutter-version/tool/run_agent_smoke.sh`
- Update: `docs/flutter_migration/testing.md`

- [ ] **Step 1: Write integration test**

Write `flutter-version/integration_test/core_loop_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:zenlift/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('core loop creates routine, logs sets, finishes workout', (tester) async {
    await app.main();
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('tab-routines')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('routine-create-fab')));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const ValueKey('routine-name-input')), 'Push A');
    await tester.tap(find.byKey(const ValueKey('routine-add-day')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('routine-save')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('routine-start-workout')));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const ValueKey('active-set-1-weight-input')), '60');
    await tester.enterText(find.byKey(const ValueKey('active-set-1-reps-input')), '10');
    await tester.tap(find.byKey(const ValueKey('active-set-1-complete')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('active-workout-finish')));
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('workout-summary-screen')), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run integration smoke**

Run with a simulator/device available:

```bash
cd flutter-version
flutter test integration_test/core_loop_test.dart
```

Expected: PASS. If no device is available, record the exact `flutter devices` output in `docs/flutter_migration/testing.md`.

- [ ] **Step 3: Add agent smoke script**

Write `flutter-version/tool/run_agent_smoke.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

Run:

```bash
chmod +x flutter-version/tool/run_agent_smoke.sh
cd flutter-version
./tool/run_agent_smoke.sh
```

Expected: PASS when a device or simulator is available.

### Task 15: Accessibility And Performance Gate

**Files:**
- Create: `flutter-version/test/accessibility/accessibility_guidelines_test.dart`
- Update: `docs/flutter_migration/testing.md`

- [ ] **Step 1: Add accessibility guideline test**

Write `flutter-version/test/accessibility/accessibility_guidelines_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/app/zenlift_app.dart';

void main() {
  testWidgets('app follows Flutter accessibility guidelines', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(const ZenliftApp());
    await tester.pumpAndSettle();

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    await expectLater(tester, meetsGuideline(textContrastGuideline));

    handle.dispose();
  });
}
```

- [ ] **Step 2: Run accessibility tests**

Run:

```bash
cd flutter-version
flutter test test/accessibility/accessibility_guidelines_test.dart
```

Expected: PASS.

- [ ] **Step 3: Manual performance checklist**

On Android hardware, record results in `docs/flutter_migration/testing.md`:

```markdown
## Android Hardware Performance

- Device:
- Flutter build mode:
- Cold start under 2 seconds:
- Complete set under 3 seconds:
- Completed set persistence under 100 ms observed through logs:
- Active Workout scroll remains smooth with 20 sets:
- App kill and recovery during active workout:
- Airplane mode core loop:
```

Expected: every line is filled with pass/fail evidence.

### Task 16: Documentation Migration

**Files:**
- Modify: `docs/product_context.md`
- Modify: `docs/architecture.md`
- Modify: `docs/data_model.md`
- Modify: `docs/roadmap_testing.md`
- Modify: `docs/ai_development_strategy.md`
- Modify: `docs/README.md`

- [ ] **Step 1: Update product context**

Change "Producto mobile-first construido con React Native + Expo" to "Producto mobile-first construido con Flutter" after Flutter cutover is accepted. Do not change this before Task 18.

- [ ] **Step 2: Update architecture**

Replace Expo-specific stack with:

```markdown
- Flutter stable + Dart 3.
- go_router for declarative navigation.
- Riverpod for minimal app state and active workout controllers.
- Drift + SQLite for structured workout data.
- shared_preferences for lightweight settings/state.
- Custom widgets and ThemeData, no heavy UI kits.
- fl_chart for charts.
- Flutter integration_test and golden tests for UI parity.
```

- [ ] **Step 3: Update roadmap/testing**

Replace Expo web smoke references with Flutter integration smoke:

```markdown
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

Keep Maestro/native smoke and Android physical-device requirements.

- [ ] **Step 4: Validate docs**

Run:

```bash
rg -n "Expo|React Native|Zustand|MMKV|FlashList|Zod|expo-sqlite" docs openspec/specs flutter-version
```

Expected: remaining matches are historical migration notes or explicit comparisons, not current architecture claims.

### Task 17: Full Parity Gate

**Files:**
- Update: `docs/flutter_migration/README.md`
- Update: `docs/flutter_migration/testing.md`
- Update: `openspec/changes/migrate-app-to-flutter/tasks.md`

- [ ] **Step 1: Run static checks**

Run:

```bash
cd flutter-version
flutter analyze
```

Expected: PASS.

- [ ] **Step 2: Run all tests**

Run:

```bash
cd flutter-version
flutter test
```

Expected: PASS.

- [ ] **Step 3: Run integration smoke**

Run:

```bash
cd flutter-version
flutter test integration_test/core_loop_test.dart
```

Expected: PASS with simulator/device available.

- [ ] **Step 4: Validate OpenSpec**

Run:

```bash
openspec validate migrate-app-to-flutter --strict
```

Expected: PASS.

- [ ] **Step 5: Manual Android parity**

Execute this checklist on Android hardware:

```text
1. Fresh install opens dark onboarding.
2. Select kg.
3. Set weekly goal.
4. Create routine.
5. Add day.
6. Add exercise.
7. Start workout.
8. Log 20 sets.
9. Kill app.
10. Reopen app and recover active workout.
11. Finish workout.
12. Confirm summary.
13. Confirm session appears in history.
14. Change kg/lb and verify formatting.
15. Export `.zenlift`.
16. Delete all data with double confirmation.
17. Import `.zenlift`.
18. Confirm routines, sessions and PRs return.
19. Turn on airplane mode.
20. Repeat create routine -> active workout -> finish.
```

Expected: every step passes or has a filed blocking issue before cutover.

### Task 18: Cut Over From Expo To Flutter

**Files:**
- Modify: root project files only after parity gate passes.
- Delete later: Expo-specific files after a dedicated cleanup commit.
- Preserve until release branch is approved: `src/`, `package.json`, `pnpm-lock.yaml`, `app.json`, `e2e/playwright`.

- [ ] **Step 1: Create cutover branch**

Run:

```bash
git switch -c codex/flutter-cutover
```

Expected: branch created. If branch exists, use `git switch codex/flutter-cutover`.

- [ ] **Step 2: Tag last Expo baseline**

Run:

```bash
git tag expo-baseline-before-flutter
```

Expected: tag created locally. Push only when release lead approves.

- [ ] **Step 3: Move Flutter app to repository root**

After parity passes and the release lead accepts the Flutter implementation, move `flutter-version/` into the repository root as the primary app. This is the intended cutover shape:

```text
Before cutover:
zenlift/
  src/
  package.json
  flutter-version/
    lib/
    pubspec.yaml

After cutover:
zenlift/
  lib/
  pubspec.yaml
  android/
  ios/
```

Do this only after Task 17 passes. Until then, keep `flutter-version/` in place because the same-repo side-by-side layout is what lets agents inspect the old implementation with minimal context.

- [ ] **Step 4: Remove Expo only in cleanup commit**

After Flutter files are moved to the root and the build is accepted, remove Expo files in one cleanup commit:

```bash
git mv flutter-version/lib lib
git mv flutter-version/test test
git mv flutter-version/integration_test integration_test
git mv flutter-version/tool tool
git mv assets assets_expo_baseline
git mv flutter-version/assets assets
git mv flutter-version/pubspec.yaml pubspec.yaml
git mv flutter-version/pubspec.lock pubspec.lock
git mv flutter-version/analysis_options.yaml analysis_options.yaml
git mv flutter-version/android android
git mv flutter-version/ios ios
git rm -r src e2e/playwright assets_expo_baseline flutter-version
git rm package.json pnpm-lock.yaml app.json
```

Expected: only move/remove these when there is an approved rollback tag, Flutter parity has passed, and root-level Flutter build succeeds after the move.

- [ ] **Step 5: Final release checks**

Run:

```bash
flutter analyze
flutter test
flutter build apk --release
```

Expected: PASS from the repository root and release APK builds.

## Self-Review

- Spec coverage: every current OpenSpec area is represented in the migration matrix and has a migration action. The highest-risk specs, Active Workout, database, settings, design tokens and agent testing, have explicit delta files in Task 2.
- Placeholder scan: this plan avoids unresolved placeholder markers and gives concrete paths, commands, file contents, test snippets and acceptance criteria.
- Type consistency: Dart examples use `WeightUnit`, `ZenliftThemeMode`, `LocalSettingsStore`, `AppDatabase`, `ExerciseRepository`, and route keys consistently.
- Risk note: Task 6 defines all 12 current SQLite tables in Drift before repository work begins. Do not begin Task 7 until generated Drift code exists and schema tests pass.
- Scope note: Flutter package-specific details beyond Flutter, go_router and Riverpod should be re-checked with Context7 during execution before writing package-specific implementation code.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-30-flutter-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - Keep one orchestrator agent active, dispatch fresh worker agents per workstream, review and integrate between tasks.

**2. Inline Execution** - Execute tasks in this session using executing-plans, with this session acting as the orchestrator and batching worker-equivalent checkpoints.

Which approach?
