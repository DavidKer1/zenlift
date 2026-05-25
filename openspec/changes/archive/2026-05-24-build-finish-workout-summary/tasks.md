## 1. FinishWorkoutFlow Orchestration

- [x] 1.1 Create `src/features/workout/FinishWorkoutFlow.ts` with `finishWorkoutFlow(store, router)` function
- [x] 1.2 Implement set validation: count completed non-warmup sets across all exercises; show Alert if 0
- [x] 1.3 Implement confirmation dialog: show Alert with session preview (exercise count, approx duration) and Cancel/Finalizar buttons
- [x] 1.4 Call `activeWorkoutStore.finishWorkout()` on confirm; handle returned `WorkoutSummary`
- [x] 1.5 Navigate to `/workout/summary` with serialized summary data; reset workout screen from navigation stack
- [x] 1.6 Handle errors: catch failures from `finishWorkout()`, show error Alert, prevent navigation

## 2. Summary Screen

- [x] 2.1 Create `src/app/workout/summary.tsx` with route param parsing for `WorkoutSummary`
- [x] 2.2 Build celebration header: duration in human-readable format (hh:mm:ss abbreviated), checkmark icon
- [x] 2.3 Build stats section: total volume (formatted with thousands separator), exercise count, set count
- [x] 2.4 Build PRs section: iterate DetectedPRs, render card per PR with exercise name, type label, value, previous best, improvement %
- [x] 2.5 Handle PR edge cases: first-ever PR (previousBest: null → "Primer récord!"), session-volume PR (exerciseName: "" → "Sesión"), zero PRs → show empty state
- [x] 2.6 Build previous-session comparison: query `WorkoutRepo.getHistoryByRoutine()` or `getHistory(limit=1)`, calculate volume/exercise/set deltas, show delta cards
- [x] 2.7 Build notes input: TextInput with placeholder, save to `workout_session.notes` on blur via `WorkoutRepo.updateSessionNotes` (add method to repo if missing)
- [x] 2.8 Build navigation buttons: "Inicio" → `/`, "Historial" → `/history`, both clear workout stack
- [x] 2.9 Handle missing summary data: show error state with Home button if route params missing

## 3. Wire Finish Button

- [x] 3.1 Modify `src/app/workout/active.tsx`: import `finishWorkoutFlow`, wire Finish button `onPress` to call it with store and router
- [x] 3.2 Ensure Finish button is only enabled/visible when workout has at least 1 exercise (UI guard, separate from validation)

## 4. Integration & Polish

- [x] 4.1 Run typecheck and lint on all new/modified files
- [x] 4.2 Verify navigation: active → summary → home/history flow works end-to-end
- [x] 4.3 Verify notes persist to SQLite after summary navigation
- [x] 4.4 Verify zero-PR sessions display correctly (no PR section or empty state)

---

**Dependencies:** This change depends on `build-active-workout-screen` (task 29) which provides the `activeWorkoutStore.finishWorkout()` method, the store instance, and the Finish button in the active workout screen. If the store interface changes, update `FinishWorkoutFlow.ts` accordingly.
