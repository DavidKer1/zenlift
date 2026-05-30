# Change: Migrate Zenlift to Flutter

## Why

Zenlift needs a Flutter implementation that preserves the existing mobile-first workout tracker behavior, dark design system, offline SQLite data model, OpenSpec contract, and core workout loop while reducing dependency on the Expo/React Native stack.

The Flutter app will live temporarily under `flutter-version/` in this same repository. Keeping it beside the Expo implementation lets agents reference current behavior, docs, assets, seed data, and OpenSpec specs through local paths with minimal context instead of switching workspaces or loading broad excerpts.

## What Changes

- Add a parallel Flutter app under `flutter-version/`.
- Port domain entities, calculations, repositories, local settings, navigation, screens, i18n, and tests.
- Convert Expo/React Native-specific OpenSpec requirements to Flutter/Dart implementation requirements.
- Add a data migration bridge so existing SQLite/MMKV user data can move safely into the Flutter app without overwriting local UUID records, deleting Expo data, or running destructive cleanup before a verified export exists.
- Replace Expo web smoke with Flutter integration smoke while preserving mobile-agent verification and Maestro native smoke.
- Keep the Expo app until Flutter passes parity gates.
- Cut over from `flutter-version/` to the repository root only after parity is accepted.
- Preserve active-workout safety during migration: completed sets must autosave with retry, remain recoverable after restart, and surface a persisted pending-write state if SQLite writes cannot be confirmed.

## Non-Goals

- No backend.
- No web admin.
- No social features.
- No nutrition.
- No coach dashboard.
- No redesign.
