## 1. Domain Service: Exercise Stats

- [ ] 1.1 Create `src/domain/services/exerciseStats.ts` with `getBestMetrics(sets: SetLog[]): { maxWeight: number; best1RM: number; bestVolume: number }` — computes max weight, best estimated 1RM (via Epley from domain/calculations), and max session volume from qualifying sets (excludes warmup, incomplete)
- [ ] 1.2 Add `getSessionHistory(sessionsData: Array<{ sessionId: string; date: string; sets: SetLog[] }>): Array<{ sessionId: string; date: string; setCount: number; volume: number }>` — groups sets by session and computes set count + total volume per session
- [ ] 1.3 Add `getProgressData(sessionHistory: ReturnType<typeof getSessionHistory>, metric: 'volume' | 'estimated1rm'): Array<{ x: string; y: number }>` — transforms session history into VictoryLine-compatible data points for charting
- [ ] 1.4 Add unit tests for `getBestMetrics`, `getSessionHistory`, and `getProgressData` in `src/domain/services/__tests__/exerciseStats.test.ts`

## 2. UI Components

- [ ] 2.1 Create `src/components/ui/MuscleBadge.tsx` — pill-shaped badge with muscle group name and color from `src/theme/muscleColors.ts`, 48px min touch target, accessibilityLabel, accepts `muscleName: MuscleGroupName` and `isPrimary?: boolean` props
- [ ] 2.2 Create `src/components/exercise/BestPerformanceCard.tsx` — card with 3 metric cells (Max Weight, Best 1RM, Best Volume), each showing label, value with unit, using colors.primary for accent. Accepts `{ maxWeight, best1RM, bestVolume }` props
- [ ] 2.3 Create `src/components/exercise/RecentHistoryList.tsx` — renders a list of recent session uses, each item showing date, set count, and volume. Accepts `sessions: SessionHistoryItem[]` prop. Handles empty state with "Sin historial de uso"
- [ ] 2.4 Create `src/components/exercise/ExercisePRList.tsx` — renders all PRs grouped by type with PR type label, value, date, and optional weight/reps. Accepts `prs: PersonalRecord[]` prop. Handles empty state with "Sin records personales"
- [ ] 2.5 Create `src/components/charts/ProgressChart.tsx` — VictoryChart wrapper with VictoryLine, VictoryAxis (x: date labels, y: volume/1RM), VictoryTheme.material, data prop. Handles empty data with fallback message "Sin datos para mostrar". Minimum height 200px

## 3. Exercise Detail Screen

- [ ] 3.1 Create `src/app/exercise/[id].tsx` with `useLocalSearchParams` to read exercise ID, SafeAreaView wrapper, ScrollView layout
- [ ] 3.2 Implement data loading: fetch exercise via `ExerciseRepo.getById(id)`, muscles via `ExerciseRepo.getMuscles(id)`, exercise sets history via custom query or `WorkoutRepo.getPreviousPerformance()` grouped by session, PRs via `WorkoutRepo.getPRsByExercise(id)`
- [ ] 3.3 Implement header section: exercise name (large title), equipment icon, category label, horizontal row of MuscleBadge components using loaded muscles with colors from `muscleColors`
- [ ] 3.4 Render BestPerformanceCard with data from `exerciseStats.getBestMetrics()` using exercise sets
- [ ] 3.5 Render RecentHistoryList with data from `exerciseStats.getSessionHistory()` showing last 5 sessions
- [ ] 3.6 Render ProgressChart with data from `exerciseStats.getProgressData()` for last 10 sessions
- [ ] 3.7 Render ExercisePRList with PRs from `WorkoutRepo.getPRsByExercise()`
- [ ] 3.8 Add loading state (ActivityIndicator) while data fetches, error state if exercise not found, and empty/placeholder states for each section with no data
- [ ] 3.9 Add ScrollView with `contentContainerStyle` padding and proper spacing between sections

## 4. Edit/Delete Actions (Custom Exercises Only)

- [ ] 4.1 Conditionally render Edit and Delete action buttons only when `exercise.is_custom === 1` — place in header right or as bottom action bar
- [ ] 4.2 Wire Edit button to navigate to exercise edit form (`exercise/edit/[id]`) using Expo Router `router.push()`
- [ ] 4.3 Wire Delete button: show confirmation Alert, on confirm call `ExerciseRepo.delete(id)`, navigate back on success, show error Alert on failure

## 5. Quick Workout Integration

- [ ] 5.1 Add "Iniciar entrenamiento rápido" button (primary CTA) at bottom of screen or as floating action
- [ ] 5.2 On tap, check for active session via `WorkoutRepo.getActiveSession()`. If none exists, create session via `WorkoutRepo.createSession()`, add exercise via `WorkoutRepo.addExercise()`, navigate to active workout
- [ ] 5.3 If active session exists, show Alert with options: "Añadir a sesión actual" (adds exercise to existing session) or "Nueva sesión" (creates new session)

## 6. Verification

- [ ] 6.1 Run TypeScript typecheck (`npx tsc --noEmit`) and fix any errors
- [ ] 6.2 Run `npm test` and verify all existing tests pass plus new exerciseStats tests
- [ ] 6.3 Test exercise detail screen: navigate with valid ID, verify header + muscle badges render with correct colors
- [ ] 6.4 Test Best Performance card with exercise that has prior data (verify max weight, 1RM, volume values match seed data)
- [ ] 6.5 Test Recent History showing last 5 sessions correctly
- [ ] 6.6 Test Progress Chart rendering VictoryLine with data points
- [ ] 6.7 Test PRs list displaying all PR types
- [ ] 6.8 Test Edit/Delete visibility: visible for custom exercise, hidden for seed exercise
- [ ] 6.9 Test Quick Workout: creates session + exercise, navigates to active workout
- [ ] 6.10 Test empty states: exercise with no prior sessions shows placeholder data and "Sin historial/Sin datos/Sin records" messages
- [ ] 6.11 Test edge case: exercise not found renders error state with back navigation
