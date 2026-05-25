## Why

Zenlift needs to celebrate user progress by detecting Personal Records (PRs) when a workout session is completed. Without PR detection, users have no feedback loop to know they're improving, which undermines retention and motivation. This service compares current performance against the user's entire history and detects new records across five PR types.

## What Changes

- Create `src/domain/services/prDetection.ts` with the `detectPRs` function and `DetectedPR` interface
- Implement PR detection algorithm comparing current session performance against historical PRs
- Handle edge cases: first workout (all types are PRs), ties (not PRs), empty sessions, warmup-only exercises

## Capabilities

### New Capabilities

- `pr-detection`: Detect new Personal Records by comparing current workout performance against the user's historical bests. Covers max_weight, max_volume, max_reps, estimated_1rm, and max_session_volume. Returns detailed detection results with absolute and percentage improvements.

### Modified Capabilities

<!-- None - this is a new capability with no requirement changes to existing specs -->

## Impact

- New file: `src/domain/services/prDetection.ts`
- New file: `src/domain/services/__tests__/prDetection.test.ts`
- Dependencies: `domain-volume-calculation` (calculateExerciseVolume, calculateSessionVolume), `domain-estimated-1rm` (estimate1RMFromSets)
- Uses domain entities: `FullSession`, `PersonalRecord`, `PersonalRecordType`, `WorkoutExerciseWithSets`, `SetLog`
- Called by workout completion flow after session is finalized
