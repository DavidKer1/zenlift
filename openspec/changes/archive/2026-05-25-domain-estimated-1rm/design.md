## Context

Zenlift's domain calculations live as pure functions under `src/domain/calculations/`. The `SetLog` entity already exists with `weight`, `reps`, `set_type`, `is_completed`, and `completed_at` fields. There are no existing 1RM calculations. This is a greenfield addition of three pure functions that consume `SetLog` data without side effects or database access.

## Goals / Non-Goals

**Goals:**
- Implement the Epley formula (`weight × (1 + reps/30)`) as a pure function
- Provide a convenience function to estimate 1RM from an array of sets (filtering warmups and incomplete)
- Provide a historical best-finder across multiple sessions for an exercise
- Round outputs to 2 decimal places for practical display
- All functions are pure: same input → same output, zero side effects

**Non-Goals:**
- Other 1RM formulas (Brzycki, Lombardi, etc.) — only Epley for now
- Weight unit conversion (kg ↔ lb) — this is purely numeric calculation
- State management or storage — these are pure functions consumed by repositories or screens
- UI integration or PR detection logic — those consume these functions

## Decisions

### Epley formula choice
The Epley formula (`weight × (1 + reps / 30)`) is the most widely used and validated 1RM estimation formula in the fitness industry. It provides reasonable estimates for the 1–10 rep range typical of strength training, with diminishing accuracy beyond 10 reps.

**Alternatives considered:**
- Brzycki (`weight × 36 / (37 - reps)`): More conservative below 5 reps, similar in mid-range. Epley is more commonly cited in lifting apps (Strong, Hevy).
- Lombardi (`weight × reps^0.10`): Less accurate at low reps. No strong adoption advantage.
- No formula (raw weight comparison): Cannot compare sets with different rep counts.

### Warmup filtering
Warmup sets (`set_type === 'warmup'`) are excluded from 1RM estimation because they represent submaximal effort and would produce misleading low estimates. Users do warmups with intentionally light weight that should not dilute their strength metrics.

### Rounding to 2 decimal places
Estimated 1RM values are rounded to 2 decimal places — a practical precision for display. Internal calculations use full float precision; rounding only applies at the function boundary before returning.

### Return values: null vs 0
`estimate1RMFromSets` and `getBestEstimated1RM` return `null` when no valid data exists (empty arrays, all warmups, all incomplete). This distinguishes "no data" from "the value is zero," which have different UI meaning.

## Risks / Trade-offs

- **Epley accuracy degrades beyond 10 reps** → Document this in function JSDoc. For high-rep sets (>12), estimates are increasingly unreliable. This is a known limitation of all 1RM formulas.
- **Historical scanning could be expensive with large datasets** → `getBestEstimated1RM` operates on pre-loaded history arrays from the repository, not direct DB queries. The repository handles filtering/limiting. If performance becomes an issue, the repository can add date-range-based pre-filtering.
- **SQLiteBoolean for is_completed** → The function checks for truthy (`!!set.is_completed`), making it resilient to both JS booleans and SQLite 0/1 integers.
