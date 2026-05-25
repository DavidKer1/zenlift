## ADDED Requirements

### Requirement: detectPRs detects all PR types for first workout

The system SHALL detect all five PR types (max_weight, max_volume, max_reps, estimated_1rm, max_session_volume) for every exercise when no previous PRs exist, with `previousBest: null`, `improvement: 0`, and `improvementPercent: 0`.

#### Scenario: First workout with one exercise

- **WHEN** `detectPRs` is called with a session containing one exercise with 3 completed non-warmup sets (100kg×10, 100kg×8, 100kg×6), no previous PRs, and no history
- **THEN** the result SHALL contain 5 DetectedPR entries (max_weight, max_volume, max_reps, estimated_1rm, max_session_volume), all with `previousBest: null`, `improvement: 0`, and `improvementPercent: 0`

#### Scenario: First workout with multiple exercises

- **WHEN** `detectPRs` is called with a session containing 2 exercises, each with completed non-warmup sets, no previous PRs, and no history
- **THEN** the result SHALL contain 9 DetectedPR entries (4 per-exercise types × 2 exercises + 1 session volume), all with `previousBest: null`

### Requirement: detectPRs detects max_weight PR

The system SHALL detect a max_weight PR when the maximum weight used in completed non-warmup sets of an exercise strictly exceeds the previous best max_weight for that exercise.

#### Scenario: New weight exceeds previous best

- **WHEN** `detectPRs` is called with an exercise having a max_weight of 120kg against a previous best max_weight PR of 100kg
- **THEN** a DetectedPR SHALL be emitted with type `max_weight`, value `120`, previousBest `100`, improvement `20`, and improvementPercent `20`

#### Scenario: Weight equals previous best (tie)

- **WHEN** `detectPRs` is called with an exercise having a max_weight of 100kg against a previous best max_weight PR of 100kg
- **THEN** no max_weight DetectedPR SHALL be emitted for that exercise

#### Scenario: Weight less than previous best

- **WHEN** `detectPRs` is called with an exercise having a max_weight of 80kg against a previous best max_weight PR of 100kg
- **THEN** no max_weight DetectedPR SHALL be emitted for that exercise

### Requirement: detectPRs detects max_volume PR

The system SHALL detect a max_volume PR when the total exercise volume (calculated via `calculateExerciseVolume`) strictly exceeds the previous best max_volume for that exercise.

#### Scenario: New volume exceeds previous best

- **WHEN** `detectPRs` is called with an exercise having volume 2400kg against a previous best max_volume PR of 2000kg
- **THEN** a DetectedPR SHALL be emitted with type `max_volume`, value `2400`, previousBest `2000`, improvement `400`, and improvementPercent `20`

#### Scenario: Volume equals previous best (tie)

- **WHEN** `detectPRs` is called with an exercise having volume 2000kg against a previous best max_volume PR of 2000kg
- **THEN** no max_volume DetectedPR SHALL be emitted for that exercise

### Requirement: detectPRs detects max_reps PR

The system SHALL detect a max_reps PR when any single completed non-warmup set has reps strictly exceeding the previous best max_reps for that exercise.

#### Scenario: A set has more reps than previous best

- **WHEN** `detectPRs` is called with an exercise where one set has 15 reps against a previous best max_reps PR of 12
- **THEN** a DetectedPR SHALL be emitted with type `max_reps`, value `15`, previousBest `12`, improvement `3`, and improvementPercent `25`

#### Scenario: Same reps, more weight — no max_reps PR

- **WHEN** `detectPRs` is called with an exercise having a set with 10 reps at heavier weight, but previous best max_reps PR is also 10
- **THEN** no max_reps DetectedPR SHALL be emitted (tie on reps)

### Requirement: detectPRs detects estimated_1rm PR

The system SHALL detect an estimated_1rm PR when `estimate1RMFromSets` returns a value strictly exceeding the previous best estimated_1rm for that exercise. If `estimate1RMFromSets` returns null, no estimated_1rm PR SHALL be emitted.

#### Scenario: Estimated 1RM exceeds previous best

- **WHEN** `detectPRs` is called with an exercise where `estimate1RMFromSets` returns 140kg against a previous best estimated_1rm PR of 130kg
- **THEN** a DetectedPR SHALL be emitted with type `estimated_1rm`, value `140`, previousBest `130`, improvement `10`, and improvementPercent `7.69`

#### Scenario: Estimated 1RM calculation returns null

- **WHEN** `detectPRs` is called with an exercise where `estimate1RMFromSets` returns null
- **THEN** no estimated_1rm DetectedPR SHALL be emitted for that exercise, but other PR types SHALL still be evaluated

### Requirement: detectPRs detects max_session_volume PR

The system SHALL detect a max_session_volume PR when the total session volume (calculated via `calculateSessionVolume`) strictly exceeds the previous best max_session_volume across all historical sessions.

#### Scenario: Session volume exceeds previous best

- **WHEN** `detectPRs` is called with a session having total volume 10000kg against a previous best max_session_volume PR of 8000kg
- **THEN** a DetectedPR SHALL be emitted with type `max_session_volume`, value `10000`, previousBest `8000`, improvement `2000`, and improvementPercent `25`

#### Scenario: Session volume equals previous best (tie)

- **WHEN** `detectPRs` is called with a session having total volume 8000kg against a previous best max_session_volume PR of 8000kg
- **THEN** no max_session_volume DetectedPR SHALL be emitted

### Requirement: detectPRs handles edge cases correctly

The system SHALL handle edge cases gracefully without throwing errors.

#### Scenario: Empty session with no exercises

- **WHEN** `detectPRs` is called with a session containing no exercises
- **THEN** an empty array SHALL be returned

#### Scenario: Exercise with no completed non-warmup sets

- **WHEN** `detectPRs` is called with an exercise where all sets are warmups or uncompleted
- **THEN** that exercise SHALL be skipped and no PRs emitted for it

#### Scenario: All sets are warmups

- **WHEN** `detectPRs` is called with an exercise where every set has `setType: 'warmup'`
- **THEN** that exercise SHALL be skipped and no PRs emitted for it

#### Scenario: Completed set with weight 0 and no previous PR

- **WHEN** `detectPRs` is called with an exercise having a completed non-warmup set with weight 0 and no previous PRs exist
- **THEN** a max_weight DetectedPR SHALL still be emitted with value `0`, previousBest `null`, improvement `0`, and improvementPercent `0`

### Requirement: DetectedPR improvement calculations are correct

The system SHALL calculate `improvement` as `value - previousBest` (0 if `previousBest` is null) and `improvementPercent` as `(improvement / previousBest) * 100` rounded to 2 decimal places (0 if `previousBest` is null).

#### Scenario: First-ever PR has zero improvement

- **WHEN** any PR type is detected with `previousBest: null`
- **THEN** `improvement` SHALL be `0` and `improvementPercent` SHALL be `0`

#### Scenario: Improvement percentage is rounded to 2 decimals

- **WHEN** a PR is detected with `value: 100` and `previousBest: 95`
- **THEN** `improvement` SHALL be `5` and `improvementPercent` SHALL be `5.26`

#### Scenario: Multiple exercises detected independently

- **WHEN** `detectPRs` is called with a session containing exercises A and B, where exercise A beats its previous best but exercise B does not
- **THEN** PRs SHALL be emitted only for exercise A, and exercise B SHALL produce no PRs
