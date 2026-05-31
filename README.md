# Zenlift

Zenlift is a mobile-first workout tracker for people who train in the gym and want a fast, reliable way to plan routines, log sets, and understand progress over time.

The product is intentionally focused on one loop:

```text
Create a routine -> Start a workout -> Log sets -> Finish the session -> Review progress
```

It is not a coach dashboard, gym management system, social network, marketplace, or nutrition platform. The goal is a personal training log that feels quick enough to use mid-set and dependable enough to trust with months of workout history.

## What Zenlift Does

- Create routines, training days, and exercise plans.
- Start workouts from a saved routine.
- Log weight, reps, and completed sets quickly.
- Recover active workouts if the app is closed.
- Review workout history and exercise progress.
- Track local data first, without requiring an account or network connection.

## Product Principles

- Active Workout is the most important screen.
- A completed set should be loggable in under 3 seconds.
- Completed workout data should never be lost.
- Core flows must work offline.
- Routine edits must not mutate past workout sessions.
- The interface is dark-first, focused, and designed for one-handed gym use.

## Tech Stack

- Flutter and Dart 3.
- go_router for route configuration.
- flutter_riverpod for app state where shared state is needed.
- Drift with SQLite for structured workout data.
- shared_preferences for lightweight persisted state and settings.
- fl_chart for progress visualization.
- file_picker and share_plus for local data portability.
- flutter_test and integration_test for unit, widget, repository, and core-loop verification.

## Project Structure

```text
lib/
  app/                    App bootstrap, router, and route composition
  core/                   Shared date, ID, and small utility primitives
  features/               Feature-first application, domain, data, and presentation code
  storage/                Drift database, connection, schema, and seed data
  theme/                  Design tokens and Flutter theme helpers
  widgets/                Shared reusable UI widgets

test/                     Unit, widget, controller, repository, and theme tests
integration_test/         End-to-end Flutter core-loop tests
assets/                   Exercise data and exercise images
docs/                     Product, architecture, data, testing, and AI workflow notes
```

Screens stay thin. Business rules, PR detection, volume calculations, unit conversion, and persistence logic live outside route widgets so they can be tested without rendering full app flows.

## Getting Started

### Requirements

- Flutter stable with Dart 3.
- Xcode for iOS builds on macOS.
- Android Studio or Android command-line tools for Android builds.

### Install

```bash
flutter pub get
```

### Run The App

```bash
flutter run
```

For a specific target:

```bash
flutter devices
flutter run -d <device-id>
```

## Quality Checks

Run the core local checks:

```bash
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

The most important areas to keep covered are:

- Workout volume and 1RM calculations.
- Personal record detection.
- Unit conversion.
- Drift repositories and schema behavior.
- Active workout persistence and recovery.
- Core-loop navigation from routine creation through workout completion.

## Local-First Data

Zenlift stores core workout data on-device. Drift and SQLite are used for routines, exercises, sessions, sets, settings snapshots, and history. shared_preferences is reserved for small, high-frequency state such as settings and active workout recovery helpers.

This keeps the app simple, fast, and usable in the gym even with poor connectivity.

## Design Direction

Zenlift uses a dark-first visual system built around monochromatic depth, high-contrast data, and restrained purple/lavender accents. Green is reserved for success and completed states, not primary actions.

See [DESIGN.md](DESIGN.md) for the full color, typography, spacing, and component system.

## Documentation

Start with [docs/README.md](docs/README.md). It points to compact docs for product scope, UX flows, architecture, data modeling, roadmap, testing, and AI development workflow.

Useful entry points:

- [Product context](docs/product_context.md)
- [UX workflows](docs/ux_workflows.md)
- [Architecture](docs/architecture.md)
- [Data model](docs/data_model.md)
- [Roadmap and testing](docs/roadmap_testing.md)

## Development Notes

- Keep the core workout loop small and fast.
- Prefer local-first behavior until a backend is explicitly required.
- Put domain calculations in pure Dart under feature domain layers.
- Keep SQLite access inside Drift repositories.
- Use UUID text IDs for records.
- Add focused tests when touching calculations, repositories, schema behavior, or active-session recovery.

## License

Apache-2.0. See [LICENSE](LICENSE).
