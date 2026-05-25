## Context

The Active Workout screen is the most performance-critical view in Zenlift. Users need to log sets in under 3 seconds with guaranteed persistence. Currently there is no centralized workout state management -- screens would need to independently query SQLite, handle session recovery, and manage the rest timer. This store centralizes all active-session state as the single source of truth. The project has no existing Zustand stores; this is the first one.

The codebase already provides all necessary dependencies: `WorkoutRepo` (workout-repository spec) with full CRUD for sessions/exercises/sets/PRs, `detectPRs` (pr-detection spec) for PR calculation, domain entity types (domain-entities spec), MMKV settings pattern (settings-storage spec) for namespace-based key-value persistence, and expo-haptics for tactile feedback.

## Goals / Non-Goals

**Goals:**
- Single Zustand store for active workout session state (session, exercises, timer, resting flag)
- Every mutation persists to SQLite immediately and updates local state atomically
- Session recovery from MMKV-persisted sessionId on app restart
- Rest timer with MMKV persistence so timer survives app backgrounding
- PR detection on workout completion via existing `detectPRs` service
- Haptic feedback on set completion
- Validation: at least 1 completed set before finishing
- Store is agnostic to UI -- no React components imported, pure state + actions

**Non-Goals:**
- Real-time sync or cloud backup (offline-first, local only)
- Warmup set grouping or superset tracking (future feature)
- Rest timer push notifications
- Undo/redo support for set operations (use deleteSet for corrections)
- Plate calculator integration
- Exercise search (handled by existing exercise-library)
- Routine auto-loading based on day of week (caller decides what to pass to `startWorkout`)

## Decisions

**1. Zustand without persist middleware**
State is reconstructed from SQLite + MMKV on app launch. Zustand's built-in persist middleware serializes to AsyncStorage/MMKV, but our state is normalized across SQLite tables and MMKV, making a single serialized blob fragile and redundant. The `recoverSession` action reads `getFullSession` from SQLite and reconstructs the store shape. Rationale: SQLite is the source of truth; duplicating it in a persist blob risks inconsistency.

**2. MMKV for sessionId and timer (not exercises/sets)**
Only two small primitives need survival beyond the Zustand store lifecycle: the active session ID (for recovery) and the timer target end timestamp (for timer survival across backgrounding). Full workout data lives in SQLite and is reconstructed on demand. Rationale: keeps MMKV usage minimal, follows the existing settings-storage pattern for namespace isolation.

**3. MMKV keys follow existing convention**
`zenlift.workout.session_id` and `zenlift.workout.timer_target` match the `zenlift.settings.*` namespace pattern established in settings-storage. Rationale: consistency with the project's existing MMKV conventions.

**4. Every action persists then updates local state**
Actions like `addSet`, `completeSet`, `updateSet`, `deleteSet` write to SQLite first, then update the Zustand state with the result. If SQLite fails, the error propagates and local state is unchanged. Rationale: prevents data loss by never keeping unwritten data in memory. This is the opposite of optimistic update -- we optimize for correctness over perceived speed.

**5. Timer is local state first, MMKV second**
`startTimer(seconds)` sets `timerTargetEnd` in Zustand state AND persists to MMKV. On recovery, the presence of a future `timerTargetEnd` in MMKV sets `isResting = true`. Rationale: the timer display reads from MMKV directly (via `getTimerRemaining`), not requiring React re-renders every second.

**6. finishWorkout builds a WorkoutSummary**
After completing the session in SQLite, `finishWorkout` constructs a `WorkoutSummary` object with session info, detected PRs, and duration. This summary is returned to the caller for display on the post-workout screen. Rationale: the summary is a transient read model, not persisted separately -- it derives from persisted data.

**7. Single store file, no slices**
Zustand slices add boilerplate for a single-store codebase. The store is focused on one domain (active workout) and fits in a single file. If future stores are added, the Zustand slicing pattern can be introduced then.

## Risks / Trade-offs

- **[Risk] Session loss on SQLite write failure mid-workout** → Mitigation: every action persists before updating local state. If SQLite fails, the error is thrown and the caller can retry. The session data is never lost from memory on a failed write.
- **[Risk] App crash after completeSet but before timer starts** → Mitigation: the set is already persisted in SQLite (is_completed=1). On recovery, the timer won't be active, but the data is safe.
- **[Risk] Timer drift if device clock changes** → Mitigation: timer uses `Date.now()` for absolute target. If clock shifts significantly, the timer could end early/late. This is an acceptable edge case for a workout timer.
- **[Risk] Multiple active sessions due to race on startWorkout** → Mitigation: `getActiveSession()` returns the single session with status='active'. If one exists, recovery takes priority over creating a new one. The store also checks before creating.
- **[Trade-off] No optimistic updates** → Users won't see UI updates until SQLite confirms the write. In practice, local SQLite writes are sub-5ms, so this is imperceptible.
