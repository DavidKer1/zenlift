## Context

When a user finishes a workout, the system must validate completion (≥1 set), confirm the action, execute the finish sequence (calculate duration, detect PRs, persist PRs, mark session complete), and navigate to a summary screen. The `WorkoutSummary` entity already exists in domain entities but has no consumer yet.

El diseño sigue las referencias de `DESIGN.md` (raíz del proyecto) y las pantallas de `tmp/design/`, en particular `workout_summary-html.html`. El color primario es naranja atlético `#F97316` (no azul), y verde `#22C55E` solo para estados completados/éxito. Los colores neutros siguen la paleta `DESIGN.md`: `hairline: #dee1e6`, `muted: #7c828a`, `surface-soft: #f7f7f7`, `canvas: #ffffff`, `ink: #0a0b0d`. La tipografía usa la familia definida en `DESIGN.md` (Coinbase Display/Sans) con pesos modestos (400) y espaciado limpio. Los botones CTA usan `borderRadius: 100px` (pill geometry) según las convenciones de `DESIGN.md`.

The `activeWorkoutStore` (assumed from dependency task 29) exposes a `finishWorkout()` method that orchestrates PR detection, session completion, and returns a `WorkoutSummary`. The Finish button exists on the Active Workout screen (also task 29).

This design covers the flow bridging the Finish button to the summary screen, plus the summary screen itself.

## Goals / Non-Goals

**Goals:**
- Validate at least 1 completed set before allowing finish
- Show confirmation dialog with session preview before completing
- Execute finish via `activeWorkoutStore.finishWorkout()` (duration calc, PR detection, persist, session completion)
- Display summary screen with celebration, volume, sets, PRs, previous-session comparison
- Optional notes saved to `workout_session.notes`
- Navigation to Home or History from summary

**Non-Goals:**
- Implementing `activeWorkoutStore.finishWorkout()` itself (belongs to task 29/30)
- Real-time PR detection during active workout
- Exercise detail drill-down from summary (future)
- "Repeat Workout" button (can be deferred; nice-to-have)
- Sharing summary (future)

## Decisions

### FinishWorkoutFlow as a plain function, not a component

```ts
function finishWorkoutFlow(store: ActiveWorkoutStore, router: Router): void
```

The flow is event-driven (user taps Finish button). It checks `store.exercises` for completed sets, shows `Alert.alert` for confirmation, and on confirm calls `store.finishWorkout()` then `router.push('/workout/summary', { summary: JSON.stringify(summary) })`.

**Rationale:** Keeps the flow logic testable as a pure function with injected dependencies vs. embedding in a component. No React context or hook coupling.

**Alternative considered:** Custom hook `useFinishWorkout()`. Rejected because the flow is a one-shot event, not reactive state.

### Summary data passed via route params

The `WorkoutSummary` object is serialized to JSON and passed as a route param. The summary screen deserializes it. This avoids a second SQLite query when the store already has the data.

**Alternative considered:** Read from SQLite via `WorkoutRepo.getFullSession()`. Rejected because the store's `finishWorkout()` already returns the summary; re-querying adds latency and complexity (the session was just completed in the same transaction).

### Summary screen uses ScrollView, not FlashList

The summary is a single-page view with sections (header, stats, PRs, comparison, notes). It has at most ~20 items. FlashList overhead is unnecessary here.

### PR display grouped by type

PRs are rendered in highlight cards grouped by type (max_weight, max_volume, max_reps, estimated_1rm, max_session_volume). Each card shows: exercise name, type label (e.g., "Max Weight"), new value, previous best, improvement percentage.

**Rationale:** Color-coded by type (orange for weight, blue for volume, purple for reps, etc.) for quick scanning. Exercise-level PRs show exercise name; session-volume PR uses "Sesión" as label.

### Previous session comparison via WorkoutRepo

The summary screen queries the most recent completed session (excluding current) for the same routine via `WorkoutRepo.getHistoryByRoutine(routineId)` or falls back to `getHistory(limit=1)`. It compares: total volume delta, exercise count delta, completed set delta.

**Rationale:** Previous-session data is not available in the store after `finishWorkout()` completes; a lightweight SQLite query handles this in the summary component on mount.

### Notes saved via WorkoutRepo update

The summary screen has a TextInput for optional notes. On blur or when navigating away, it calls `WorkoutRepo.updateSessionNotes(sessionId, notes)`. The `updateSessionNotes` method is a simple `UPDATE workout_sessions SET notes = ? WHERE id = ?` — added to the repository if not present (check existing methods).

## Risks / Trade-offs

- **[Risk] Active Workout Screen (task 29) not yet built** → This change wires the Finish button and consumes `activeWorkoutStore.finishWorkout()`. If the store's `finishWorkout()` method changes signature, the orchestration function must be updated. Mitigation: Document the expected `finishWorkout()` signature in tasks.md and validate after task 29 is complete.
- **[Risk] Route params size limit** → `WorkoutSummary` JSON could be large with many exercises/PRs. Mitigation: Serialize only essential fields; if needed, pass `sessionId` and re-query from SQLite on the summary screen.
- **[Risk] App crash/close before notes saved** → If the user navigates away or closes the app before notes blur, notes are lost. Mitigation: Save notes on TextInput blur and on navigation (use `beforeRemove` listener), or auto-save after 2 seconds of inactivity.
- **[Trade-off] Confirmation dialog vs. slide-to-finish** → A simple `Alert.alert` is less fancy than a swipe-to-finish but simpler to implement and universally understood. Future iteration can add gesture-based confirmation.
