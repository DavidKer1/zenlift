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

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service. This includes React, React Native, Expo, Expo Router, SQLite, Zustand, FlashList, Zod, EAS, and similar tools.

Always start with `resolve-library-id` unless the user provides an exact `/org/project` library ID, then call `query-docs` with the selected library and the full question.

Do not use Context7 for general refactors, business logic debugging, code review, or general programming concepts.

## Expo

Expo has changed. Before writing Expo or React Native code, read the exact versioned Expo docs for the project SDK. Current project rule: read `https://docs.expo.dev/versions/v55.0.0/` before writing code.

If the installed Expo SDK differs from this instruction, verify the installed version and mention the mismatch before implementation.

## Product Rules

- Optimize Active Workout above all other screens.
- A set should be loggable in under 3 seconds.
- Never risk losing workout data; autosave completed sets.
- The app must work offline for core flows.
- Use UUID text IDs from day 1.
- Use light theme by default and athletic orange (`#F97316`) as the primary color. Do not use green as primary; reserve green for success/completed states.
- Editing routines must not mutate past workout sessions.
- Prefer local-first data and simple architecture until a backend is explicitly required.

## Implementation Rules

- Keep domain calculations in pure functions under domain services/calculations.
- Keep screens thin; avoid heavy business logic in route files.
- Use SQLite for structured workout data and MMKV for lightweight settings/state.
- Use FlashList for large lists or lists with editable inputs.
- Avoid UI kits that add unnecessary weight.
- Add tests for calculations, PR detection, unit conversion, repositories, migrations, and active-session recovery when touching those areas.
