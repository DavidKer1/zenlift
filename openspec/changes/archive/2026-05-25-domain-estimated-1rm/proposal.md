## Why

Users need to compare their strength across different rep ranges — a lifter pressing 80kg for 6 reps should understand that translates to roughly a 96kg max. Without estimated 1RM, every set exists in isolation, making it impossible to track strength progression or detect personal records when rep counts vary between sessions. The Epley formula is the fitness industry standard for this estimation.

## What Changes

- Create `src/domain/calculations/oneRM.ts` with three pure functions:
  - `estimate1RM(weight, reps)` — Epley formula: `weight × (1 + reps/30)`. Guards: reps=1 returns weight (actual 1RM); reps=0 or weight=0 returns 0. Result rounded to 2 decimal places.
  - `estimate1RMFromSets(sets)` — finds the highest estimated 1RM among non-warmup, completed sets. Returns `null` if no valid sets.
  - `getBestEstimated1RM(exerciseId, history)` — scans all historical sessions for an exercise, returning the absolute best estimated 1RM with its weight, reps, and date. Returns `null` if no valid data.
- Create `src/domain/calculations/__tests__/oneRM.test.ts` with reference values verified against the Epley formula.

## Capabilities

### New Capabilities

- `estimated-1rm`: Pure domain calculation for estimating one-rep max using the Epley formula, filtering warmup sets, and finding best historical estimates across workout sessions.

### Modified Capabilities

<!-- No existing capabilities are modified. -->

## Impact

- New files: `src/domain/calculations/oneRM.ts`, `src/domain/calculations/__tests__/oneRM.test.ts`
- Depends on `SetLog` entity type from `domain-entities` capability
- No **BREAKING** changes — pure functions with no existing consumers
- Enables PR detection (comparing estimated 1RM across sessions), workout summary stats, and progress tracking features
