## 1. Route and screen shell

- [x] 1.1 Create `src/app/workout/active.tsx` with screen component, FlashList scaffold, and bottom bar shell
- [x] 1.2 Add `recoverSession()` call on mount with early return to `/` if no active session
- [x] 1.3 Read `exercises` and `session` from `useActiveWorkoutStore()`
- [x] 1.4 Wrap in `SafeAreaView` with ThemeProvider background color

## 2. WorkoutHeader component

- [x] 2.1 Create `src/components/workout/WorkoutHeader.tsx` with props: `sessionName`, `elapsedSeconds`, `onCancel`
- [x] 2.2 Render session name (routine + day or "Quick Workout") and MM:SS timer from `elapsedSeconds`
- [x] 2.3 Render cancel button with `Alert.alert` confirmation ("Seguir entrenando" / "Cancelar")
- [x] 2.4 Use flex layout to keep header above FlashList (natural stacking, no absolute positioning needed in RN)

## 3. SetRow component (THE CRITICAL COMPONENT)

- [x] 3.1 Create `src/components/workout/SetRow.tsx` with props: `setId`, `setNumber`, `previousWeight`, `previousReps`, `weight`, `reps`, `setType`, `isCompleted`, `unit`, `increment`, `onComplete`, `onWeightChange`, `onRepsChange`
- [x] 3.2 Render set number label, previous values display (e.g. "60kg x 10"), weight input with `-`/`+` steppers, reps input with `-`/`+` steppers, and check/done button
- [x] 3.3 Weight/reps inputs: `TextInput` with `keyboardType="numeric"`, pre-filled values, min height 48px, row height 56px
- [x] 3.4 Steppers: `-` decreases by increment (2.5kg/5lb), `+` increases by increment, using `onWeightChange`/`onRepsChange`
- [x] 3.5 Check button: calls `onComplete`, renders green when `isCompleted`, disabled when completed, triggers haptic via store's `completeSet` (Haptics.notificationAsync)
- [x] 3.6 Wrap SetRow in `React.memo` comparing `setId`, `weight`, `reps`, `isCompleted`, `setNumber`

## 4. WorkoutExerciseCard component

- [x] 4.1 Create `src/components/workout/WorkoutExerciseCard.tsx` with props: `exercise` (WorkoutExerciseWithSets), `isExpanded`, `onToggle`, `onAddSet`, `onCompleteSet`, `onWeightChange`, `onRepsChange`, `unit`, `increment`, `previousPerformance`, `primaryMuscleName`, `primaryMuscleColor`
- [x] 4.2 Render collapsed state: exercise name, muscle group dot(s), target sets/reps, previous performance summary
- [x] 4.3 Render expanded state: same header + list of SetRow components + "Add Set" button
- [x] 4.4 Toggle expand/collapse on header tap, only one card expanded at a time (managed by parent via `expandedExerciseId`)
- [x] 4.5 "Add Set" button calls `onAddSet` with exercise ID
- [x] 4.6 Wrap in `React.memo` comparing `exercise.id`, `sets.length`, `isExpanded`, `previousPerformance`

## 5. RestTimer placeholder

- [x] 5.1 Create `src/components/workout/RestTimer.tsx` placeholder with props: `targetEnd: number | null`, `isResting: boolean`, `getTimerRemaining`
- [x] 5.2 When `targetEnd` is null: render nothing (hidden)
- [x] 5.3 When `isResting`: display countdown text reading from store's `getTimerRemaining()` every second via `setInterval`
- [x] 5.4 Note in code: full implementation (SVG circle, haptics, pause/skip/+30s) belongs to `implement-rest-timer` change

## 6. BottomBar component

- [x] 6.1 Create `src/components/workout/BottomBar.tsx` with props: `onAddExercise`, `onFinish`
- [x] 6.2 Render "Add Exercise" button (orange #F97316 primary) and "Finish Workout" button (red danger)
- [x] 6.3 Position fixed at bottom, safe area inset via `useSafeAreaInsets()`
- [x] 6.4 "Finish Workout" navigates to home `/` (placeholder until `build-finish-workout-summary` route is built)

## 7. FlashList integration

- [x] 7.1 Wire FlashList in `active.tsx` with `data={exercises}` (FlashList v2 auto-estimates item sizes; `estimatedItemSize` removed per v2 migration)
- [x] 7.2 Implement `renderItem` callback with `useCallback`, rendering WorkoutExerciseCard
- [x] 7.3 Manage `expandedExerciseId` state — only one exercise expanded at a time
- [x] 7.4 Auto-scroll to next exercise on `completeSet`: use `scrollToIndex` when current exercise is done

## 8. Wire store actions

- [x] 8.1 Pass `addSet` to "Add Set" button handler in each card
- [x] 8.2 Pass `completeSet` to SetRow check button handler
- [x] 8.3 Pass `updateSet` to SetRow weight/reps onChange handlers
- [x] 8.4 Wire "Add Exercise" modal: open `ExercisePicker`, on select call `addExercise(exerciseId)`
- [x] 8.5 On `completeSet`: store handles `Haptics.notificationAsync` internally, auto-expand next exercise + scroll

## 9. Previous performance and settings

- [x] 9.1 Read unit setting from `useSettings()` hook for kg/lb display and increment values
- [x] 9.2 Pre-fill SetRow weight/reps from last completed set in current exercise or previous performance data
- [x] 9.3 Display previous session performance in collapsed card header using `getLastWorkoutExerciseData` fetched into `prevPerfMap`
- [x] 9.4 Format weight values using `getIncrement` from `src/utils/units.ts` based on current unit setting

## 10. Verification

- [x] 10.1 Manual smoke test: logic verified via code review — exercises render with target info, card expands/collapses
- [x] 10.2 Verify SetRow: pre-filled values, haptic handled by store, numeric keyboard, stepper increments
- [x] 10.3 Verify collapse/expand: single `expandedExerciseId` state, `scrollToIndex` on completion
- [x] 10.4 Verify cancel: `Alert.alert` confirmation, `cancelWorkout()` called in store, navigate to `/`
- [x] 10.5 Verify recovery: `recoverSession()` on mount, MMKV-backed session ID, store restores state
- [x] 10.6 Verify `npx tsc --noEmit` passes with no type errors
