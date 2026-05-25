## 1. Core Volume Functions

- [x] 1.1 Implement `calculateSetVolume(weight: number, reps: number): number` — returns `weight * reps`, returns 0 if either is 0
- [x] 1.2 Implement `getISOWeek(date: Date): { year: number, week: number }` — helper to extract ISO week number from a Date
- [x] 1.3 Implement `formatISOWeek(year: number, week: number): string` — helper to format as `"YYYY-Www"` (zero-padded week)
- [x] 1.4 Implement `calculateExerciseVolume(sets: SetLog[]): number` — sums set volumes where `isCompleted === true && setType !== 'warmup'`
- [x] 1.5 Implement `calculateSessionVolume(exercises: WorkoutExerciseWithSets[]): number` — sums `calculateExerciseVolume` across all exercises
- [x] 1.6 Implement `calculateMuscleVolume(exercises: WorkoutExerciseWithSets[], muscleMap: Map<string, MuscleGroup[]>): Map<string, number>` — adds full exercise volume to each associated muscle group
- [x] 1.7 Implement `calculateWeeklyVolume(sessions: FullSession[]): { weekStart: string, volume: number }[]` — groups session volumes by ISO week, sorted ascending

## 2. Unit Tests

- [x] 2.1 Test `calculateSetVolume` — normal set, zero weight, zero reps, both zero, fractional weight
- [x] 2.2 Test `calculateExerciseVolume` — normal sets, warmups excluded, not completed excluded, only warmups, empty array
- [x] 2.3 Test `calculateSessionVolume` — multiple exercises, empty array, exercise with warmups
- [x] 2.4 Test `calculateMuscleVolume` — single muscle, multi-muscle, aggregates across exercises, missing from muscleMap, empty array
- [x] 2.5 Test `calculateWeeklyVolume` — same week aggregation, different weeks, year boundary, null dates, empty array
- [x] 2.6 Test `getISOWeek` — normal date, year start, year end, edge cases

## 3. Verification

- [x] 3.1 Run `npx jest src/domain/calculations/__tests__/volume.test.ts` and confirm 100% coverage on volume.ts
- [x] 3.2 Run `npx tsc --noEmit` (or project typecheck command) to confirm no type errors
