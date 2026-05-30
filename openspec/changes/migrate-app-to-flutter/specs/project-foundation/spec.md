## MODIFIED Requirements

### Requirement: SDK-aligned dependencies
The project foundation SHALL use Flutter stable and Dart 3 dependencies declared in `flutter-version/pubspec.yaml`.

#### Scenario: Flutter dependencies are declared
- **WHEN** a developer inspects `flutter-version/pubspec.yaml`
- **THEN** the Flutter SDK, Dart 3 SDK constraint, go_router, flutter_riverpod, Drift, sqlite3 Flutter support, shared_preferences, intl, uuid, fl_chart, flutter_test, integration_test, and golden-test tooling are declared.

#### Scenario: Flutter dependencies are installed
- **WHEN** `cd flutter-version && flutter pub get` runs
- **THEN** dependency resolution succeeds
- **AND** `flutter-version/pubspec.lock` is updated.

### Requirement: Source structure exists
The project foundation SHALL provide the Flutter source directories for app bootstrap, core utilities, theme tokens, shared storage infrastructure, i18n, shared widgets, and feature modules organized with Clean Architecture layers.

#### Scenario: Folder structure matches Flutter architecture
- **WHEN** the repository is inspected
- **THEN** `flutter-version/lib/app`, `flutter-version/lib/core`, `flutter-version/lib/theme`, `flutter-version/lib/storage`, `flutter-version/lib/features`, `flutter-version/lib/i18n`, and `flutter-version/lib/widgets` exist
- **AND** each migrated feature uses `presentation`, `application`, `domain`, and `data` subdirectories.

### Requirement: Clean Architecture boundaries
The project foundation SHALL enforce Clean Architecture boundaries for all migrated features.

#### Scenario: Domain remains pure Dart
- **WHEN** domain files under `flutter-version/lib/features/*/domain` and shared pure files under `flutter-version/lib/core` are inspected
- **THEN** they do not import Flutter, Riverpod, Drift, SQLite, platform APIs, widgets, or generated database rows.

#### Scenario: Data implementations do not leak upward
- **WHEN** files under `flutter-version/lib/features/*/presentation` and `flutter-version/lib/features/*/application` are inspected
- **THEN** they do not import Drift generated database classes or persistence DTOs
- **AND** repository contracts are consumed through domain/application abstractions.

#### Scenario: Repository implementations map persistence rows
- **WHEN** a feature repository reads or writes SQLite data
- **THEN** its implementation lives under that feature's `data` layer
- **AND** it maps Drift rows or DTOs into domain entities before returning data to application or presentation layers.

### Requirement: Flutter app validates
The Flutter project SHALL keep Flutter static analysis and tests working after dependency and structure changes.

#### Scenario: Flutter analyze validates
- **WHEN** `cd flutter-version && flutter analyze` runs
- **THEN** it exits with code 0.

#### Scenario: Flutter tests validate
- **WHEN** `cd flutter-version && flutter test` runs
- **THEN** it exits with code 0.
