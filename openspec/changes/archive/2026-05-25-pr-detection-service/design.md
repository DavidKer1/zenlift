## Context

When a user finishes a workout, the system needs to detect whether they achieved any new Personal Records. These PRs are compared against the user's entire history for each exercise, not just the most recent session. The PR detection logic must be a pure domain service with no I/O — it receives data and returns results.

The `detectPRs` function takes:
- `session: FullSession` — the just-completed workout
- `previousPRs: PersonalRecord[]` — all historical PRs for this user (pre-filtered by caller)
- `allHistory: FullSession[]` — all historical sessions (needed for session-volume comparison across all exercises)

It returns `DetectedPR[]`.

## Goals / Non-Goals

**Goals:**
- Detect PRs strictly (new value must exceed previous best; ties are not PRs)
- Handle first-ever workout (no previous PRs exist → all qualifying types are PRs)
- Support all five PR types: max_weight, max_volume, max_reps, estimated_1rm, max_session_volume
- Return absolute and percentage improvements
- Remain a pure function (no database access, no side effects)

**Non-Goals:**
- Persisting PRs to database (handled by caller/workout repository)
- UI display of PRs
- Real-time PR detection during active workout (only at session completion)
- Exercise naming/lookup (exerciseName comes from session data)
- Filtering warmup sets from consideration (handled here: only `setType !== 'warmup'` and `isCompleted === 1` are considered)

## Decisions

### Function Signature

```ts
detectPRs(session: FullSession, previousPRs: PersonalRecord[], allHistory: FullSession[]): DetectedPR[]
```

Rationale: `previousPRs` is pre-filtered by the caller for efficiency. `allHistory` is needed for session-volume comparison (historical per-session volumes, not just PRs, because previous best session volume might not have been recorded as a PR if we only look at PR table).

### Previous Best Lookup Strategy

Group `previousPRs` by `exerciseId` and `type` into a `Map<string, Map<PersonalRecordType, number>>` for O(1) lookup. Session-volume PR is looked up globally (not per exercise).

### Dependencies on Other Domain Services

- `calculateExerciseVolume(exercise: WorkoutExerciseWithSets): number` from volume calculation
- `calculateSessionVolume(session: FullSession): number` from volume calculation
- `estimate1RMFromSets(sets: SetLog[]): number | null` from estimated-1rm calculation

These are pure functions imported at the top of the file.

### DetectedPR Interface

```ts
interface DetectedPR {
  exerciseId: string;
  exerciseName: string;
  type: PersonalRecordType;
  value: number;
  previousBest: number | null;
  improvement: number;
  improvementPercent: number;
}
```

- `previousBest: null` for first-ever PR in a category
- `improvement: 0` and `improvementPercent: 0` for first-ever PR (no baseline to compare)
- `improvementPercent` calculated as `(improvement / previousBest) * 100` rounded to 2 decimal places

### Algorithm

For each exercise in the session:
1. Filter to completed non-warmup sets
2. If no qualifying sets, skip this exercise
3. Compute current values: max_weight, exercise_volume, max_reps, estimated_1rm
4. For each type, compare against previous best; if `current > previousBest` (or `previousBest` is null), emit a DetectedPR
5. After all exercises, compute session_volume and compare against previous max_session_volume

## Risks / Trade-offs

- **[Risk] Session volume PR depends on `allHistory`** → The caller must pass all historical sessions, not just PRs. This is because previous max session volume may not be stored as a PR yet (e.g., before this feature existed). Mitigation: Document clearly in the function signature.
- **[Risk] estimated_1rm returns null for invalid inputs** → If `estimate1RMFromSets` returns null, skip the estimated_1rm PR for that exercise. No PR is emitted when calculation fails.
- **[Risk] Large number of historical sessions could be slow** → The `allHistory` array could be large. Mitigation: Caller should pre-filter to relevant sessions if needed; the function only iterates once to compute historical max session volume.
