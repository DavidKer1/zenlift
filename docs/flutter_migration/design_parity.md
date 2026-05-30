# Flutter Design Parity

## Required Tokens

- Background: `#141218`
- Lowest surface: `#0f0d13`
- Low surface: `#1d1b20`
- Surface: `#211f24`
- High surface: `#2b292f`
- Highest surface: `#36343a`
- Primary lavender: `#cfbcff`
- Success-only green: use green only for completed/success states; never use green as primary.
- Error: `#ffb4ab`
- Radius: match `DESIGN.md`; cards default to 12px unless a compact component uses 8px.
- Spacing: match `DESIGN.md` spacing scale and preserve dense mobile workout ergonomics.
- Shadows: no decorative shadows unless `DESIGN.md` explicitly permits them.

## Typography

- Inter for UI text.
- JetBrains Mono for numeric/data values.
- Inputs use at least 16 logical pixels.
- Preserve current hierarchy, weights, line heights, and compact label treatment from `DESIGN.md`.
- Numeric workout values must remain easy to scan during one-handed logging.

## Components To Match

- Bottom tab bar: straight black bottom surface, icon-only, accessible labels.
- Cards: tonal surfaces, no shadow, 12px radius unless compact component uses 8px.
- Primary action: high contrast white background with dark text where `DESIGN.md` requires it.
- Active Workout set row: 48px touch targets, numeric keyboard, previous values visible, complete button not color-only.
- Active Workout modal: minimized and expanded states with matching gesture affordances and motion timing.
- Search and filter controls: match current exercise library density, touch targets, and selected states.
- Routine editor rows: preserve nested day/exercise structure, drag/reorder affordances, validation states, and unsaved-warning behavior.
- Charts: monochromatic lines/dots unless success/error state is semantically required.
- Empty states: preserve concise mobile copy and action placement without introducing marketing-style panels.
- Settings controls: preserve section grouping, unit/theme/weekly goal controls, and destructive data operation hierarchy.

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

## Parity Rule

Flutter UI is expected to recreate the existing dark Zenlift design system with reasonable pixel-level parity. Any intentional visual deviation must be documented with an owner, reason, screenshot, and acceptance from the orchestrator before it can pass the design gate.
