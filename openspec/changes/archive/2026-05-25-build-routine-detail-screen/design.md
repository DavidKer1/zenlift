## Context

Design reference compliance: implementation MUST review `DESIGN.md` and the relevant `tmp/design/screens/routine_editor-html.html` / `tmp/design/screens/routines_list-html.html` references before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

Zenlift is a local-first Expo React Native app using expo-sqlite for structured data and Expo Router for file-based navigation. The `RoutineRepo` is fully implemented with `getFullRoutine(id)`, `duplicate(id, name)`, `archive(id)`, `delete(id)`, `update(id, updates)`, `createExercise(dayId, data)`, `deleteExercise(id)`, and `reorderExercises(dayId, ids)`. The `WorkoutRepo` provides `createSession()` and `addExercise()` for starting workouts. Domain entities (`FullRoutine`, `FullRoutineDay`, `RoutineExerciseWithExercise`, `Exercise`) and theme tokens are already available.

The routine detail screen is a P0 core screen that receives a routine ID via Expo Router dynamic route `app/routine/[id].tsx`, loads the full routine tree, and exposes all actions from the Notion ticket: view days/exercises, edit name, duplicate, archive, delete, reorder exercises, add exercises, and start a workout from a day.

## Goals / Non-Goals

**Goals:**
- Render a routine detail screen at `app/routine/[id].tsx` with header, day sections, and exercise rows.
- Support all listed actions: edit name, duplicate, archive, delete (with confirmation), add day, reorder exercises, add exercises, and start workout from a day.
- Keep the screen component thin: delegate data fetching to repositories and domain logic to services.
- Use existing `RoutineRepo` and `WorkoutRepo` methods; no new repository methods needed.
- Match existing code conventions: `StyleSheet.create`, `ThemedText`, `ThemedView`, `useZenliftTheme`, and Expo Router patterns.

**Non-Goals:**
- Exercise reordering via drag-and-drop gesture (complex for v1); use move-up/move-down buttons instead.
- Inline editing of exercise targets (deferred to future edit-exercise screen).
- Adding new days from the detail screen (deferred; user creates days in routine form).
- Routine reordering at this screen level (handled by routine list screen).

## Decisions

### Component decomposition

The screen breaks down into presentational components:

- `RoutineHeader`: Displays routine name (tappable to edit inline), description, goal. Action bar with edit name, duplicate, archive, delete buttons.
- `DaySection`: Collapsible section per day. Shows day name and exercise count. Contains the list of `ExerciseRow` components and the `StartWorkoutButton`.
- `ExerciseRow`: Displays exercise name, primary muscle dot (colored via `muscleColors`), target sets x reps range, rest time. Has a remove button and optional up/down reorder buttons.
- `StartWorkoutButton`: Calls `WorkoutRepo.createSession()` with `routineId` and `routineDayId`, then `WorkoutRepo.addExercise()` for each exercise in the day.

**Rationale**: Follows the project pattern of keeping screens thin and composing presentational components. No new global state; data flows from repository to screen to props.

### Data loading strategy

Use a `useEffect` + `useState` pattern for loading routine data, consistent with the existing codebase patterns (no TanStack Query). Load via `RoutineRepo.getFullRoutine(id)` on mount and when `id` param changes. Handle loading and error states.

**Alternative considered**: Zustand store for routine detail. Rejected because the data is specific to this screen, not shared globally, and the existing codebase uses simple local state for per-screen data.

### Navigation

Use Expo Router's `useLocalSearchParams` to read `id` from the route (`app/routine/[id].tsx`). Navigate back with `router.back()`. Navigate to exercise library for adding exercises. Navigate to active workout screen after starting a workout.

### Reordering exercises

Use two-button approach (move-up/move-down) in `ExerciseRow`. The screen maintains a local copy of the exercises array, applies optimistic UI updates, and commits via `RoutineRepo.reorderExercises(dayId, exerciseIds)`.

**Rationale**: Drag-and-drop with `react-native` gestures adds complexity and dependency weight. Two-button reorder is simpler, accessible, and sufficient for v1.

### Inline name editing

Tap the routine name in `RoutineHeader` to show a `TextInput` overlay. On blur/submit, call `RoutineRepo.update(id, { name })`. Use local state for the editing mode and optimistic update.

### Duplicate routine

Call `RoutineRepo.duplicate(id, "Copy of <name>")`. Show success feedback and refresh. The duplicated routine gets new UUIDs for all entities. No navigation needed; user stays on current routine.

### Delete and archive

- **Archive**: Call `RoutineRepo.archive(id)`, then navigate back to routines list. No confirmation needed per the archiving pattern (non-destructive).
- **Delete**: Show `Alert.alert` confirmation dialog. On confirm, call `RoutineRepo.delete(id)` and navigate back. Cascade deletion is handled by SQLite foreign keys.

### Start workout

When user taps Start on a day:
1. Call `WorkoutRepo.createSession({ name: routine.name, routineId, routineDayId: day.id })`.
2. For each `RoutineExerciseWithExercise` in the day, call `WorkoutRepo.addExercise(sessionId, exercise.exercise.id)`.
3. Navigate to `/workout/active` with the session ID.

**Rationale**: Creates a brand-new session seeded from the routine configuration. Routine data is never mutated by workouts (per data model principle).

## Risks / Trade-offs

- [Risk] User navigates away before data saves → Mitigation: Repository operations are async and idempotent. Reorder and delete operations use transactions.
- [Risk] Large routines (>20 exercises) may cause scroll performance issues → Mitigation: Use `FlashList` for the exercise list with `estimatedItemSize`. Each `ExerciseRow` wrapped in `React.memo`.
- [Risk] User starts workout while one is already active → Mitigation: Check for active session via `WorkoutRepo.getActiveSession()` before creating a new one. Alert user to cancel or continue.
