## Context

Zenlift is a local-first Expo React Native app using expo-sqlite and Expo Router. Currently, starting a workout involves two disparate paths:

1. **Routine detail**: `StartWorkoutButton.tsx` at `src/components/routine/StartWorkoutButton.tsx` directly calls `WorkoutRepo.createSession()`, adds exercises via `WorkoutRepo.addExercise()`, and navigates to `/workout/${session.id}`.
2. **Home screen**: `StartWorkoutButton.tsx` at `src/components/home/StartWorkoutButton.tsx` simply navigates to `/routines` — there is no direct workout start from Home.

This is Phase 4, Task 28. It depends on Task 27 (`ActiveWorkoutStore` at `src/features/workout/stores/activeWorkoutStore.ts`) which is NOT YET BUILT but whose interface is specified: `startWorkout(routineId?, routineDayId?)` and `recoverSession()`. The `WorkoutRepo` methods `getActiveSession()` and `cancelSession()` already exist at `src/storage/repositories/workoutRepo.ts`.

## Goals / Non-Goals

**Goals:**
- Create a single, centralized `StartWorkoutFlow` module that all workout-start UI paths call.
- Check for existing active sessions and prompt the user before starting a new one.
- Support both routine-based starts (pre-populated exercises) and Quick/empty starts.
- Refactor `StartWorkoutButton.tsx` (routine detail) to use the new flow.
- Add a "Quick Workout" button to the Home screen.

**Non-Goals:**
- Building `ActiveWorkoutStore` itself (that is Task 27). This change assumes its interface.
- Changing the active workout screen (`/workout/active`) itself.
- Handling session recovery beyond what `activeWorkoutStore.recoverSession()` provides.

## Decisions

### StartWorkoutFlow as a pure function

`StartWorkoutFlow` is implemented as an exported async function `startWorkoutFlow(opts: { routineId?: string; routineDayId?: string })` rather than a class or React hook. It takes the router as a parameter or imports it directly via `expo-router`.

**Rationale**: The flow is stateless — check, prompt, delegate. A function is the simplest abstraction. No need for React context or class instances. Components only import and call the function on press.

**Alternative considered**: Custom hook `useStartWorkout()`. Rejected because the flow is not reactive — it's a one-shot action triggered by a button press. Hooks add unnecessary complexity (dependency arrays, re-render concerns).

### ActiveSession check and Alert prompt

When `WorkoutRepo.getActiveSession()` returns a session, an `Alert.alert` is shown with:
- **"Continuar"** (default): call `activeWorkoutStore.recoverSession()`, navigate to `/workout/active`.
- **"Nueva sesión"** (destructive/cancel style): call `activeWorkoutStore.cancelWorkout()`, then proceed to `activeWorkoutStore.startWorkout(routineId, routineDayId)`, navigate to `/workout/active`.

**Rationale**: Matches the acceptance criteria ("Alerta si sesión activa"). Uses React Native's built-in `Alert` API (no extra dependency). The "Continuar" path recovers the session via the store; the "Nueva" path cancels and starts fresh.

### ActiveWorkoutStore interface contract

The following methods are assumed to exist on `activeWorkoutStore` (a Zustand store):

```ts
interface ActiveWorkoutStore {
  startWorkout(routineId?: string, routineDayId?: string): Promise<void>;
  cancelWorkout(): Promise<void>;
  recoverSession(): Promise<void>;
}
```

- `startWorkout(routineId?, routineDayId?)`: Creates a new active session. If `routineId` and `routineDayId` are provided, loads exercises from the routine day. Returns a promise that resolves when the session is ready.
- `cancelWorkout()`: Cancels the current active session via `WorkoutRepo.cancelSession()` and clears store state.
- `recoverSession()`: Rehydrates the store from the existing active session in the database.

**Dependency note**: This store does not exist yet (Task 27). The `StartWorkoutFlow` module will import from `@/features/workout/stores/activeWorkoutStore` assuming this interface. Implementation of `StartWorkoutFlow` should handle the case where the import resolves (even if the store is a stub during development).

### Navigation strategy

After `startWorkout()` resolves, the router navigates to `/workout/active`. This is a singleton route — the active workout screen reads from `activeWorkoutStore`, not from route params.

**Rationale**: The previous code navigated to `/workout/${session.id}` with a dynamic param. The new flow uses the store as the source of truth, enabling the /workout/active singleton pattern. This is simpler and avoids stale session IDs in URLs.

**Alternative considered**: Keep `/workout/${session.id}`. Rejected because the active workout should always be at a known route for deep linking and recovery.

### Home screen Quick Workout button

The `StartWorkoutButton` component already accepts `label` and `variant` props. We reuse it for the Quick Workout button:

```tsx
<StartWorkoutButton label="Start Workout" variant="primary" />
// existing behavior: navigates to /routines

<StartWorkoutButton label="Quick Workout" variant="secondary" />
// new behavior: calls StartWorkoutFlow, navigates to /workout/active
```

The component `onPress` is changed from hardcoded `router.push('/routines')` to accept an optional `onPress` callback. When `onPress` is provided, it is called instead of the default navigation. When not provided, the default behavior (navigate to /routines) is preserved.

**Rationale**: Minimal API change to the existing component. Backward-compatible — existing usages without `onPress` continue to navigate to /routines.

### Refactoring routine StartWorkoutButton

The routine detail `StartWorkoutButton` (at `src/components/routine/StartWorkoutButton.tsx`) currently:
1. Creates a `WorkoutRepo` instance
2. Checks `getActiveSession()` and shows an Alert
3. Calls `createSession()` then `addExercise()` for each exercise
4. Navigates to `/workout/${session.id}`

After refactoring:
1. Calls `startWorkoutFlow({ routineId, routineDayId })`
2. Removes all `WorkoutRepo` usage, `Alert` logic, and manual exercise looping

The component becomes a thin wrapper: button press → `startWorkoutFlow(...)`.

## Risks / Trade-offs

- [Risk] `ActiveWorkoutStore` (Task 27) is not built yet → Mitigation: Document the interface contract clearly. `StartWorkoutFlow` will import from the store path and fail gracefully (try/catch with error alert) until the store is implemented. Mark the tasks so Task 27's tasks are referenced as a prerequisite.
- [Risk] Navigation to `/workout/active` assumes a singleton route → Mitigation: Verify the route exists and renders based on store state, not URL params.
- [Risk] User navigates away during async session creation → Mitigation: The store's `startWorkout()` handles this internally; the flow only navigates on success.
- [Trade-off] Removing `/workout/${session.id}` dynamic route → The existing route may already exist or be planned. If `/workout/[id].tsx` exists, it should be replaced or augmented with `/workout/active.tsx` reading from the store.
