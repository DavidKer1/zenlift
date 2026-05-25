## 1. Setup and skeleton

- [x] 1.1 Create `src/storage/repositories/workoutRepo.ts` with `WorkoutRepo` class skeleton accepting `db` in constructor
- [x] 1.2 Import domain types (`WorkoutSession`, `WorkoutExercise`, `SetLog`, `PersonalRecord`, `FullWorkoutSession`, `WorkoutExerciseWithSets`, `AppSettings`) and `generateId` from `src/utils/id`
- [x] 1.3 Implement private `generateId()` wrapper calling the shared `generateId()` utility

## 2. Session operations

- [x] 2.1 Implement `createSession(data)` — INSERT workout_sessions with UUID, startedAt, status='active'
- [x] 2.2 Implement `getSession(id)` — SELECT by id
- [x] 2.3 Implement `getActiveSession()` — SELECT WHERE status='active' LIMIT 1
- [x] 2.4 Implement `getHistory(limit?, offset?)` — SELECT completed/cancelled, ordered by startedAt DESC
- [x] 2.5 Implement `getHistoryByDateRange(startDate, endDate)` — SELECT with date filter
- [x] 2.6 Implement `getHistoryByRoutine(routineId)` — SELECT with routineId filter
- [x] 2.7 Implement `getFullSession(id)` — compose session + exercises (each with sets) + PRs into `FullWorkoutSession`
- [x] 2.8 Implement `completeSession(id)` — UPDATE status='completed', endedAt, duration_seconds via julianday
- [x] 2.9 Implement `cancelSession(id)` — UPDATE status='cancelled', endedAt=now
- [x] 2.10 Implement `deleteSession(id)` — DELETE (CASCADE)

## 3. Exercise operations

- [x] 3.1 Implement `addExercise(sessionId, exerciseId)` — INSERT with UUID, next sortOrder
- [x] 3.2 Implement `removeExercise(id)` — DELETE (CASCADE to sets)
- [x] 3.3 Implement `getExercises(sessionId)` — SELECT ordered by sortOrder
- [x] 3.4 Implement `getPreviousPerformance(exerciseId, limit?)` — 3-table JOIN for completed sets from prior sessions
- [x] 3.5 Implement `getLastWorkoutExerciseData(exerciseId)` — LIMIT 1 variant for quick auto-fill

## 4. Set operations

- [x] 4.1 Implement `addSet(workoutExerciseId, data)` — INSERT with UUID, next setNumber, is_completed=0
- [x] 4.2 Implement `completeSet(id)` — UPDATE is_completed=1, completed_at=now
- [x] 4.3 Implement `updateSet(id, data)` — UPDATE weight, reps, set_type, notes
- [x] 4.4 Implement `deleteSet(id)` — DELETE
- [x] 4.5 Implement `getSets(workoutExerciseId)` — SELECT ordered by setNumber

## 5. Personal records

- [x] 5.1 Implement `addPR(data)` — INSERT with UUID, achieved_at=now
- [x] 5.2 Implement `getPRsByExercise(exerciseId)` — SELECT ordered by achieved_at DESC
- [x] 5.3 Implement `getLatestPRs(limit?)` — SELECT ordered by achieved_at DESC LIMIT ?
- [x] 5.4 Implement `getPRsBySession(sessionId)` — SELECT WHERE workoutSessionId=?

## 6. App settings

- [x] 6.1 Implement `getSetting(key)` — SELECT value FROM app_settings WHERE key=?
- [x] 6.2 Implement `setSetting(key, value)` — INSERT OR REPLACE INTO app_settings
- [x] 6.3 Implement `deleteSetting(key)` — DELETE FROM app_settings WHERE key=?

## 7. Error handling

- [x] 7.1 Wrap all database operations in try/catch and re-throw with context (operation name + relevant IDs)
- [x] 7.2 Verify all queries use parametrized values (no string concatenation)

## 8. Verification

- [x] 8.1 Run typecheck: `npx tsc --noEmit`
- [x] 8.2 Verify `WorkoutRepo` exports match the spec (all methods present, correct signatures)
- [x] 8.3 Manual verification: each method handles null/empty results gracefully where applicable
