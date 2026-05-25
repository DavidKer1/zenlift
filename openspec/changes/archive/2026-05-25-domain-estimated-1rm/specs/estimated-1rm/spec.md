## ADDED Requirements

### Requirement: Epley 1RM estimation
The system SHALL provide a pure function `estimate1RM(weight: number, reps: number): number` that calculates estimated one-rep max using the Epley formula.

#### Scenario: Standard rep range
- **WHEN** `estimate1RM(80, 6)` is called
- **THEN** it returns `96.00` (Epley formula: 80 * (1 + 6/30) = 96)

#### Scenario: Single rep is actual 1RM
- **WHEN** `estimate1RM(100, 1)` is called
- **THEN** it returns `100`

#### Scenario: Zero reps returns zero
- **WHEN** `estimate1RM(50, 0)` is called
- **THEN** it returns `0`

#### Scenario: Zero weight returns zero
- **WHEN** `estimate1RM(0, 10)` is called
- **THEN** it returns `0`

#### Scenario: High rep range with heavy weight
- **WHEN** `estimate1RM(60, 12)` is called
- **THEN** it returns `84.00` (Epley formula: 60 * (1 + 12/30) = 84)

#### Scenario: Fractional weight with low reps
- **WHEN** `estimate1RM(52.5, 5)` is called
- **THEN** it returns `61.25` (Epley formula: 52.5 * (1 + 5/30) = 61.25)

### Requirement: 1RM estimation from sets
The system SHALL provide a pure function `estimate1RMFromSets(sets: SetLog[]): number | null` that finds the highest estimated 1RM among valid sets.

#### Scenario: Warmup sets are ignored
- **WHEN** `estimate1RMFromSets` receives sets where the only completed sets have `set_type = 'warmup'`
- **THEN** it returns `null`

#### Scenario: Incomplete sets are ignored
- **WHEN** `estimate1RMFromSets` receives sets where `is_completed = 0` for all non-warmup sets
- **THEN** it returns `null`

#### Scenario: Best estimate selected from mixed sets
- **WHEN** `estimate1RMFromSets` receives a warmup set (60kg × 10), a normal completed set (80kg × 6), and a normal completed set (70kg × 10)
- **THEN** it returns `96.00` (the highest estimated 1RM from the 80kg × 6 set)

#### Scenario: Empty array returns null
- **WHEN** `estimate1RMFromSets` receives an empty array `[]`
- **THEN** it returns `null`

### Requirement: Best historical 1RM across sessions
The system SHALL provide a pure function `getBestEstimated1RM(exerciseId: string, history: SetLog[][]): {value: number, weight: number, reps: number, date: string} | null` that finds the absolute best estimated 1RM across all sessions for an exercise.

#### Scenario: Best found across multiple sessions
- **WHEN** `getBestEstimated1RM` receives history with two sessions: session 1 has a set (80kg × 6, completed, normal), session 2 has a set (85kg × 5, completed, normal)
- **THEN** it returns `{value: 99.17, weight: 85, reps: 5, date: <completed_at from session 2 set>}` (85 × (1 + 5/30) ≈ 99.17 > 80 × (1 + 6/30) = 96.00)

#### Scenario: Warmup sets excluded from history scan
- **WHEN** `getBestEstimated1RM` receives history where all sets are warmup or incomplete
- **THEN** it returns `null`

#### Scenario: Empty history returns null
- **WHEN** `getBestEstimated1RM` receives an empty array `[]`
- **THEN** it returns `null`

#### Scenario: Single valid session
- **WHEN** `getBestEstimated1RM` receives history with one session containing a completed normal set (100kg × 1)
- **THEN** it returns `{value: 100, weight: 100, reps: 1, date: <completed_at>}`
