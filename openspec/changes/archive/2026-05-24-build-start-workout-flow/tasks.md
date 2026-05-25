## 1. Dependency Check

- [x] 1.1 Verify Task 27 (`ActiveWorkoutStore`) exists at `src/features/workout/stores/activeWorkoutStore.ts` with `startWorkout(routineId?, routineDayId?)`, `cancelWorkout()`, and `recoverSession()` methods. If not yet built, stub the store with methods that throw descriptive "not implemented" errors so `StartWorkoutFlow` can be coded and verified structurally.

## 2. Create StartWorkoutFlow Module

- [x] 2.1 Create `src/features/workout/StartWorkoutFlow.ts` with exported async function `startWorkoutFlow(opts?: { routineId?: string; routineDayId?: string })`.
- [x] 2.2 Implement active session check: call `WorkoutRepo.getActiveSession()`.
- [x] 2.3 Implement Alert prompt: if active session exists, show Alert with "Continuar" (calls `activeWorkoutStore.recoverSession()` + navigate) and "Nueva sesión" (calls `activeWorkoutStore.cancelWorkout()` then `activeWorkoutStore.startWorkout()` + navigate).
- [x] 2.4 Implement no-active-session path: call `activeWorkoutStore.startWorkout(routineId, routineDayId)` then navigate to `/workout/active`.
- [x] 2.5 Wrap all operations in try/catch with user-facing error alerts and console error logging.
- [x] 2.6 Export the function and any types needed by callers.

## 3. Refactor Routine StartWorkoutButton

- [x] 3.1 Update `src/components/routine/StartWorkoutButton.tsx` to remove direct `WorkoutRepo` imports and `createAndNavigate` helper function.
- [x] 3.2 Replace `handlePress` logic with a call to `startWorkoutFlow({ routineId, routineDayId })`.
- [x] 3.3 Remove `useRouter` import if no longer needed (the flow handles navigation internally via router).
- [x] 3.4 Verify the component still receives `routineId`, `routineDayId` (from `day.id`), and removes unused `day.exercises` iteration.

## 4. Add Quick Workout to Home Screen

- [x] 4.1 Update `src/components/home/StartWorkoutButton.tsx` to accept an optional `onPress` prop. When provided, use it instead of `router.push('/routines')`.
- [x] 4.2 In `src/app/index.tsx`, add a secondary "Quick Workout" `StartWorkoutButton` with `variant="secondary"` and `onPress` calling `startWorkoutFlow({})`.
- [x] 4.3 Place the Quick Workout button below the primary Start Workout button in the scroll order.

## 5. Verification

- [x] 5.1 Typecheck the project: `npx tsc --noEmit`.
- [x] 5.2 Verify the routine detail screen `StartWorkoutButton` still renders correctly and calls the flow.
- [x] 5.3 Verify the Home screen shows both buttons: primary "Start Workout" (→ routines) and secondary "Quick Workout" (→ flow).
- [x] 5.4 Test the active session Alert flow: when a session is active, confirm the prompt appears with both options.
- [x] 5.5 Test with no active session: confirm direct navigation to `/workout/active`.
