# Flutter Migration Testing Contract

## Ownership

- The orchestrator runs integration checks after each accepted worker batch.
- Worker agents run only targeted tests for their owned files and report exact commands, outputs, failures, and assumptions.
- Workers must not broaden formatting, modify unrelated files, or mark a parity gate complete without orchestrator acceptance.

## Static Checks

```bash
cd flutter-version
flutter analyze
```

## Unit Tests

Run targeted unit tests for migrated domain, validation, repository, settings, migration, and data bridge work:

```bash
cd flutter-version
flutter test test/domain
flutter test test/storage
flutter test test/features
```

## Widget Tests

Run feature-owned widget tests for screens and shared components touched by the worker:

```bash
cd flutter-version
flutter test test/features
flutter test test/widgets
```

## Golden Tests

Golden tests cover the approved design parity screens in `docs/flutter_migration/design_parity.md`:

```bash
cd flutter-version
flutter test test/golden
```

Golden updates require orchestrator approval and a note explaining which reference changed.

## Integration Smoke

The core loop integration smoke is the migration replacement for Expo web smoke:

```bash
cd flutter-version
flutter test integration_test/core_loop_test.dart
```

The smoke must cover creating a routine, starting a workout, logging sets, finishing the session, and confirming history/progress.

Current status:

- `flutter test integration_test/core_loop_test.dart` passes on the available local iOS Simulator target.
- Android emulator/device execution remains pending and is still required before parity sign-off.
- The test currently exercises the real Drift repositories in memory for the local-first core loop rather than brittle UI clicks.

## Optional Maestro Smoke

When Maestro is installed and a runnable iOS Simulator or iOS build is available, preserve the existing native mobile smoke path with stable `ValueKey` selectors:

```bash
cd flutter-version
maestro test ../e2e/maestro/ios-core-loop.yaml
```

If the existing Maestro flow is platform-specific or incompatible with Flutter selectors, report the blocker and wait for orchestrator direction.

## Manual Android Checklist

- [ ] Create routine.
- [ ] Start workout.
- [ ] Log a set in under 3 seconds.
- [ ] Finish workout.
- [ ] Confirm history/progress.
- [ ] Kill and relaunch during active workout; confirm recovery.
- [ ] Toggle airplane mode and complete the core loop offline.
- [ ] Verify numeric keyboard ergonomics and one-handed reach.
- [ ] Verify haptics, tap targets, and accessibility labels.
- [ ] Export, import, and delete data; run destructive delete checks only on isolated test data, a fresh install/emulator state, or after verifying a backup/export round-trip.

## Blocked Environment Reporting

If a command cannot run because of missing Flutter, missing Android tooling, no device/simulator, occupied ports, sandbox limits, or unavailable Maestro, report:

- Command attempted.
- Exact error or visible blocker.
- Environment detail, including tool version when available.
- Whether code changed after the failed command.
- The smallest follow-up needed from the orchestrator or local environment.

## Current Environment Notes

- Flutter is available as Flutter 3.44.0 / Dart 3.12.0.
- Flutter commands may need permission to update/read `/Users/victorsanchez/flutter/bin/cache` outside the repo sandbox.
- Current full unit/widget/repository command: `cd flutter-version && flutter test` passes.
- Current static check command: `cd flutter-version && flutter analyze` passes.
- Current OpenSpec check: `openspec validate migrate-app-to-flutter --strict` passes.
- Clean Architecture import scans have no matches for Flutter/Riverpod/Drift leakage into feature domain/application or generated storage rows into presentation/application.
- `file_picker` currently emits an iOS Swift Package Manager support warning and CocoaPods deprecation warnings during simulator builds; this is not blocking current tests but should be revisited before iOS release hardening.
- Font binaries for Inter and JetBrains Mono are not present in this repo yet; real font assets must be added before declaring final typography pixel parity complete.
