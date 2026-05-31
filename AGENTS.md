# Zenlift Agent Instructions

Zenlift is a B2C mobile-first workout tracker for gym users. Keep the product focused on the core loop:

```text
Crear rutina -> Iniciar workout -> Registrar sets -> Finalizar sesión -> Ver progreso
```

Do not turn Zenlift into a CRM, SaaS, coach dashboard, web admin, marketplace, booking system, nutrition platform, or social-first product.

## Documentation Loading

To reduce tokens, do not open the full blueprint by default.

1. Start with `docs/README.md`.
2. Open only the compact doc relevant to the task:
   - Product/scope/positioning: `docs/product_context.md`
   - UX/screens/flows/copy: `docs/ux_workflows.md`
   - Architecture/state/storage/performance/errors: `docs/architecture.md`
   - SQLite/entities/repositories/seeds: `docs/data_model.md`
   - MVP/roadmap/testing/release/risks: `docs/roadmap_testing.md`
   - AI task planning/delegation: `docs/ai_development_strategy.md`
3. Open `docs/zenlift_product_blueprint.md` only when the compact docs are insufficient, ambiguous, or you are updating strategic documentation.

## Context7

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service. This includes Flutter, Dart, go_router, Riverpod, Drift, SQLite, shared_preferences, fl_chart, file_picker, share_plus, Android Gradle, Xcode, and similar tools.

Always start with `resolve-library-id` unless the user provides an exact `/org/project` library ID, then call `query-docs` with the selected library and the full question.

Do not use Context7 for general refactors, business logic debugging, code review, or general programming concepts.

## Flutter

Before writing Flutter or Dart code that depends on framework, package, CLI, platform, or build-system behavior, verify the current project package versions in `pubspec.yaml` and fetch current docs with Context7.

Use `flutter analyze` and focused `flutter test` commands for verification. Use `flutter test integration_test/core_loop_test.dart` when touching navigation, persistence, or the core workout loop.

## Product Rules

- Optimize Active Workout above all other screens.
- A set should be loggable in under 3 seconds.
- Never risk losing workout data; autosave completed sets.
- The app must work offline for core flows.
- Use UUID text IDs from day 1.
- Use dark theme by default. Reference `DESIGN.md` for the complete color system, typography, spacing, and component tokens. Do not use green as primary; reserve green for success/completed states.
- Editing routines must not mutate past workout sessions.
- Prefer local-first data and simple architecture until a backend is explicitly required.

## Implementation Rules

- Keep domain calculations in pure Dart under feature domain layers.
- Keep route widgets and screens thin; avoid heavy business logic in route files.
- Use Drift/SQLite for structured workout data and shared_preferences for lightweight settings/state.
- Keep repositories behind feature-level domain contracts.
- Avoid UI kits that add unnecessary weight.
- Add tests for calculations, PR detection, unit conversion, repositories, schema changes, and active-session recovery when touching those areas.

## Testing

- Use `flutter analyze` for static analysis.
- Use `flutter test` for unit, widget, repository, controller, and theme tests.
- Use `flutter test integration_test/core_loop_test.dart` for the core loop when navigation, storage, or workout completion changes.
- Still test on Android hardware for keyboard ergonomics, haptics, offline behavior, performance, and active-session recovery.
