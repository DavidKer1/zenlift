## Why

Zenlift stores all weight values internally in kilograms (kg), but must display them in pounds (lb) for users who prefer imperial units. Without centralized conversion utilities, inline conversion logic gets duplicated across screens, leading to rounding inconsistencies and bugs. Standard gym increments differ by unit system (2.5 kg vs 5 lb), and these rules must be consistent everywhere.

## What Changes

- Add `src/utils/units.ts` with pure functions for kg/lb conversion and weight formatting
- Add `src/utils/__tests__/units.test.ts` with unit tests covering conversion, formatting, and edge cases
- No existing code is modified — this is a new utility module

## Capabilities

### New Capabilities

- `units-conversion`: Pure functions for converting between kg and lb, formatting weight values for display, and determining standard gym plate increments for each unit system.

### Modified Capabilities

<!-- None -->

## Impact

- New file: `src/utils/units.ts`
- New file: `src/utils/__tests__/units.test.ts`
- No dependencies on other modules; consumed by future workout/display screens
