# domain-volume-calculation Specification

## Purpose
TBD - created by archiving change domain-volume-calculation. Update Purpose after archive.
## Requirements
### Requirement: Calculate set volume
The system SHALL provide a pure function `calculateSetVolume(weight: number, reps: number): number` that returns `weight * reps`. If either weight or reps is 0, the function SHALL return 0.

#### Scenario: Normal set with positive weight and reps
- **WHEN** `calculateSetVolume(60, 10)` is called
- **THEN** returns `600`

#### Scenario: Set with zero weight
- **WHEN** `calculateSetVolume(0, 10)` is called
- **THEN** returns `0`

#### Scenario: Set with zero reps
- **WHEN** `calculateSetVolume(60, 0)` is called
- **THEN** returns `0`

#### Scenario: Set with both zero
- **WHEN** `calculateSetVolume(0, 0)` is called
- **THEN** returns `0`

#### Scenario: Set with fractional weight
- **WHEN** `calculateSetVolume(22.5, 8)` is called
- **THEN** returns `180`

### Requirement: Calculate exercise volume
The system SHALL provide a pure function `calculateExerciseVolume(sets: SetLog[]): number` that sums `calculateSetVolume` for all sets where `isCompleted` is `true` AND `setType` is NOT `"warmup"`. Sets that are not completed or are warmup sets SHALL be excluded.

#### Scenario: Exercise with completed non-warmup sets
- **WHEN** `calculateExerciseVolume` receives sets `[{ weight: 60, reps: 10, isCompleted: true, setType: 'normal' }, { weight: 65, reps: 8, isCompleted: true, setType: 'normal' }]`
- **THEN** returns `60*10 + 65*8 = 1120`

#### Scenario: Exercise with warmup sets excluded
- **WHEN** `calculateExerciseVolume` receives sets `[{ weight: 40, reps: 10, isCompleted: true, setType: 'warmup' }, { weight: 60, reps: 10, isCompleted: true, setType: 'normal' }]`
- **THEN** returns `60*10 = 600` (warmup set ignored)

#### Scenario: Exercise with not completed sets excluded
- **WHEN** `calculateExerciseVolume` receives sets `[{ weight: 60, reps: 10, isCompleted: true, setType: 'normal' }, { weight: 70, reps: 5, isCompleted: false, setType: 'normal' }]`
- **THEN** returns `60*10 = 600` (incomplete set ignored)

#### Scenario: Exercise with only warmup sets
- **WHEN** `calculateExerciseVolume` receives sets where all sets have `setType: 'warmup'`
- **THEN** returns `0`

#### Scenario: Exercise with empty sets array
- **WHEN** `calculateExerciseVolume` receives an empty array `[]`
- **THEN** returns `0`

### Requirement: Calculate session volume
The system SHALL provide a pure function `calculateSessionVolume(exercises: WorkoutExerciseWithSets[]): number` that sums `calculateExerciseVolume` for all exercises in the session.

#### Scenario: Session with multiple exercises
- **WHEN** `calculateSessionVolume` receives exercises with volumes `[200, 150, 300]`
- **THEN** returns `650`

#### Scenario: Session with no exercises
- **WHEN** `calculateSessionVolume` receives an empty array `[]`
- **THEN** returns `0`

#### Scenario: Session with one exercise having warmups
- **WHEN** `calculateSessionVolume` receives one exercise with a warmup set and a normal set `[{ weight: 60, reps: 10, isCompleted: true, setType: 'normal' }]` (warmup excluded internally)
- **THEN** returns `600`

### Requirement: Calculate muscle volume
The system SHALL provide a pure function `calculateMuscleVolume(exercises: WorkoutExerciseWithSets[], muscleMap: Map<string, MuscleGroup[]>): Map<string, number>` that groups volume by muscle group. For each exercise, the full exercise volume (excluding warmups and incomplete) SHALL be added to each muscle group associated with that exercise via the muscleMap.

#### Scenario: Muscle volume for single-muscle exercise
- **WHEN** `calculateMuscleVolume` receives an exercise with volume `600` mapped to `[{ id: 'chest', name: 'Chest' }]`
- **THEN** returns a Map with `'chest' → 600`

#### Scenario: Muscle volume for multi-muscle exercise
- **WHEN** `calculateMuscleVolume` receives an exercise with volume `600` mapped to `[{ id: 'chest', name: 'Chest' }, { id: 'triceps', name: 'Triceps' }]`
- **THEN** returns a Map with `'chest' → 600` and `'triceps' → 600`

#### Scenario: Muscle volume aggregates across exercises
- **WHEN** `calculateMuscleVolume` receives two exercises, both targeting chest: exercise A volume `600`, exercise B volume `400`
- **THEN** returns a Map with `'chest' → 1000`

#### Scenario: Exercise not found in muscleMap
- **WHEN** `calculateMuscleVolume` receives an exercise whose `exerciseId` is not in the muscleMap
- **THEN** skips that exercise (no volume added for it)

#### Scenario: Empty exercises array
- **WHEN** `calculateMuscleVolume` receives an empty array
- **THEN** returns an empty Map

### Requirement: Calculate weekly volume
The system SHALL provide a pure function `calculateWeeklyVolume(sessions: FullSession[]): { weekStart: string, volume: number }[]` that groups session volumes by ISO week (YYYY-Www). Sessions without `startedAt` or `endedAt` SHALL be skipped. The result SHALL be sorted by `weekStart` ascending.

#### Scenario: Sessions grouped into weeks
- **WHEN** `calculateWeeklyVolume` receives two sessions in the same ISO week with volumes `500` and `300`
- **THEN** returns `[{ weekStart: '<ISO-week-string>', volume: 800 }]`

#### Scenario: Sessions in different weeks
- **WHEN** `calculateWeeklyVolume` receives one session in week `2025-W01` (volume `500`) and one in week `2025-W02` (volume `300`)
- **THEN** returns `[{ weekStart: '2025-W01', volume: 500 }, { weekStart: '2025-W02', volume: 300 }]` sorted ascending

#### Scenario: Sessions at year boundary
- **WHEN** `calculateWeeklyVolume` receives one session in week `2024-W52` and another in `2025-W01`
- **THEN** returns weeks sorted correctly across year boundary

#### Scenario: Session without dates
- **WHEN** `calculateWeeklyVolume` receives a session where `startedAt` is null or undefined
- **THEN** skips that session

#### Scenario: Empty sessions array
- **WHEN** `calculateWeeklyVolume` receives an empty array
- **THEN** returns an empty array

