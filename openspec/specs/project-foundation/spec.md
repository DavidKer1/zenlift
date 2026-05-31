# Project Foundation

## Purpose

Establish the foundational project structure, dependencies, and configuration for the Zenlift mobile app using Flutter.

## Requirements

### Requirement: SDK-aligned dependencies
The project foundation SHALL include the dependencies needed by the Zenlift MVP using versions compatible with the installed Flutter project.

#### Scenario: Dependencies are installed
- **WHEN** a developer inspects `pubspec.yaml`
- **THEN** the required local-first, form, validation, list, haptics, date, SVG, and chart dependencies are present

#### Scenario: Flutter dependencies remain consistent
- **WHEN** Flutter packages are installed
- **THEN** their versions are compatible with the current Flutter SDK constraints

### Requirement: Source structure exists
The project foundation SHALL provide the base source directories for app routes, domain models, domain services, calculations, storage, repositories, migrations, features, UI widgets, workout widgets, chart widgets, utilities, theme, and providers.

#### Scenario: Folder structure matches architecture
- **WHEN** a developer lists the `lib/` tree
- **THEN** the architecture folders from the Zenlift compact docs are present

### Requirement: Dart and go_router remain valid
The project foundation SHALL keep Dart analysis and go_router configuration working after dependency and structure changes.

#### Scenario: Dart analysis validates
- **WHEN** `flutter analyze` runs
- **THEN** it completes without analyzer errors

#### Scenario: Flutter app starts
- **WHEN** `flutter run` runs
- **THEN** the project starts without configuration errors
