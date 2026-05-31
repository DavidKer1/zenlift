---
name: zenlift-flutter
description: Use when implementing, testing, or reviewing Zenlift Flutter code.
---

# Zenlift Flutter

Use this skill for code changes in the Zenlift Flutter app.

## Context

- Read `AGENTS.md`.
- Read `docs/README.md`.
- Open only the compact doc that matches the task.
- Use Context7 for package, SDK, CLI, or platform docs before writing package-specific code.

## Architecture

- Keep route widgets thin.
- Put business rules in feature domain/application layers.
- Keep Drift access in data repositories.
- Keep reusable visual primitives in `lib/widgets` or `lib/theme`.
- Preserve local-first behavior and offline core flows.

## Verification

Run focused checks first, then broaden:

```bash
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

If a command cannot run because local tooling or a simulator is unavailable, report the exact command and error.
