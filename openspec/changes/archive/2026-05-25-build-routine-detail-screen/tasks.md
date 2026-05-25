## 1. Route and screen skeleton

- [ ] 1.1 Create `src/app/routine/[id].tsx` with `useLocalSearchParams` to read the routine ID
- [ ] 1.2 Add loading state (activity indicator while `RoutineRepo.getFullRoutine(id)` resolves)
- [ ] 1.3 Add error/not-found state when routine is null
- [ ] 1.4 Add `SafeAreaView` and scroll container using theme colors

## 2. Routine header component

- [ ] 2.1 Create `src/components/routine/RoutineHeader.tsx` with routine name, description, and goal display
- [ ] 2.2 Implement inline name editing: tap name to show `TextInput`, call `RoutineRepo.update(id, { name })` on blur/submit
- [ ] 2.3 Add action button row: edit name icon, duplicate icon, archive icon, delete icon
- [ ] 2.4 Wire duplicate button to `RoutineRepo.duplicate(id, "Copy of <name>")` with success feedback
- [ ] 2.5 Wire archive button to `RoutineRepo.archive(id)` then `router.back()`
- [ ] 2.6 Wire delete button to `Alert.alert` confirmation, then `RoutineRepo.delete(id)` + `router.back()`

## 3. Day section component

- [ ] 3.1 Create `src/components/routine/DaySection.tsx` accepting `FullRoutineDay` and a refresh callback
- [ ] 3.2 Render day name as a section header with exercise count badge
- [ ] 3.3 Render `ExerciseRow` components for each exercise in the day
- [ ] 3.4 Handle empty day: show "No exercises" message with add-exercise prompt
- [ ] 3.5 Add `StartWorkoutButton` at the bottom of each day section

## 4. Exercise row component

- [ ] 4.1 Create `src/components/routine/ExerciseRow.tsx` accepting `RoutineExerciseWithExercise` and callbacks
- [ ] 4.2 Render exercise name and primary muscle colored dot (fetch from `exercise_muscles` or receive as prop)
- [ ] 4.3 Render target sets x reps range and rest time display
- [ ] 4.4 Add remove exercise button calling `RoutineRepo.deleteExercise(id)` and refreshing the day
- [ ] 4.5 Add move-up / move-down buttons for reordering; disable at boundaries
- [ ] 4.6 Wire reorder buttons: create new id array, call `RoutineRepo.reorderExercises(dayId, ids)`, refresh
- [ ] 4.7 Wrap `ExerciseRow` in `React.memo`

## 5. Start workout from day

- [ ] 5.1 Create `src/components/routine/StartWorkoutButton.tsx`
- [ ] 5.2 On press: check for active session via `WorkoutRepo.getActiveSession()`; if exists, alert user
- [ ] 5.3 Call `WorkoutRepo.createSession({ name, routineId, routineDayId })`
- [ ] 5.4 For each exercise in the day, call `WorkoutRepo.addExercise(sessionId, exercise.exercise.id)`
- [ ] 5.5 Navigate to the active workout screen with the new session ID

## 6. Add exercise to day

- [ ] 6.1 Add an "Add Exercise" button in each `DaySection` (or in the empty state)
- [ ] 6.2 Navigate to exercise library screen for exercise selection
- [ ] 6.3 On return from library with selected exercise ID, call `RoutineRepo.createExercise(dayId, { exerciseId })`
- [ ] 6.4 Refresh the day's exercise list after adding

## 7. Muscle dot and helper utilities

- [ ] 7.1 Create a utility or hook to resolve the primary muscle color for an exercise from `exercise_muscles` table
- [ ] 7.2 Render a small colored circle (12dp) in `ExerciseRow` using `muscleColors`

## 8. Polish and testing

- [ ] 8.1 Add `accessibilityLabel` to action buttons, exercise rows, and inputs
- [ ] 8.2 Verify all accept scenario flows from specs work end-to-end
- [ ] 8.3 Test with empty routine (no days), routine with empty days, and routine with full data
- [ ] 8.4 Test duplicate creates deep copy with new UUIDs
- [ ] 8.5 Test start workout creates session with correct exercises
- [ ] 8.6 Test reorder persists sort_order and reflects correctly on re-render
