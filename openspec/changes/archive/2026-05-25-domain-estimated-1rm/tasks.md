## 1. Implementation

- [x] 1.1 Create `src/domain/calculations/oneRM.ts` with `estimate1RM` function (Epley formula with guards for reps=1, reps=0, weight=0, rounded to 2 decimal places)
- [x] 1.2 Add `estimate1RMFromSets` function — filters warmup and incomplete sets, maps to estimate1RM, returns max value or null
- [x] 1.3 Add `getBestEstimated1RM` function — scans history array of arrays, filters by exerciseId, finds best estimated 1RM with weight/reps/date context, returns null if no valid data

## 2. Testing

- [x] 2.1 Create `src/domain/calculations/__tests__/oneRM.test.ts` with tests for `estimate1RM` covering acceptance criteria: (80,6)=96, (100,1)=100, (0,10)=0, plus edge cases
- [x] 2.2 Add tests for `estimate1RMFromSets` — warmups ignored, incomplete sets ignored, mixed sets select max, empty array returns null
- [x] 2.3 Add tests for `getBestEstimated1RM` — best across sessions, warmups excluded, empty history returns null, single session

## 3. Validation

- [x] 3.1 Run `npx jest src/domain/calculations/__tests__/oneRM.test.ts --passWithNoTests` to verify all tests pass
- [x] 3.2 Run typecheck to ensure no type errors
