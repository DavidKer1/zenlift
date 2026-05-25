## 1. Implementation

- [x] 1.1 Create `src/domain/services/prDetection.ts` with `DetectedPR` interface and `detectPRs` function
- [x] 1.2 Implement previous-PR lookup: group by exerciseId and type into Map for O(1) access
- [x] 1.3 Implement per-exercise PR detection (max_weight, max_volume, max_reps, estimated_1rm)
- [x] 1.4 Implement session-volume PR detection using `calculateSessionVolume` and `allHistory`
- [x] 1.5 Handle edge cases: empty session, no completed non-warmup sets, estimate1RM returning null

## 2. Tests

- [x] 2.1 Create `src/domain/services/__tests__/prDetection.test.ts`
- [x] 2.2 Test: first workout — all types are PRs with null previousBest
- [x] 2.3 Test: max_weight PR detected when new weight exceeds previous best
- [x] 2.4 Test: tie on weight — no max_weight PR emitted
- [x] 2.5 Test: max_volume PR with correct improvement calculations
- [x] 2.6 Test: max_reps PR detected from single set
- [x] 2.7 Test: estimated_1rm PR detected and skipped when null
- [x] 2.8 Test: max_session_volume PR across historical sessions
- [x] 2.9 Test: empty session returns empty array
- [x] 2.10 Test: warmup-only exercise is skipped
- [x] 2.11 Test: multiple exercises produce independent PRs
- [x] 2.12 Test: improvement and improvementPercent calculations (including 2-decimal rounding)

## 3. Integration

- [x] 3.1 Run typecheck and lint on new files
- [x] 3.2 Run test suite and verify all tests pass
