# Flutter Migration

## Baseline

- Source app baseline: Expo SDK 55 / React Native 0.83.
- Migration target: Flutter stable / Dart 3.
- Flutter temporary folder: `flutter-version/`.
- Source of truth before cutover: existing Expo app, `DESIGN.md`, `docs/*.md`, `openspec/specs`, seed data, assets, and current tests.
- Reason for same repo: easy local reference to Expo implementation, OpenSpec specs, docs, seed data, assets and tests while keeping worker-agent prompts small.
- Architecture rule: every migrated capability uses Clean Architecture by feature: `presentation`, `application`, `domain`, and `data`. Domain code stays pure Dart and persistence rows never leak into UI.
- Cutover rule: Expo app remains runnable until Flutter passes domain, repository, widget, golden, integration and manual-device parity gates; then `flutter-version/` moves to the repo root.

### Environment Snapshot

```text
$ git status --short
 M app.json
 M e2e/playwright/core-loop.spec.ts
 M package.json
 M pnpm-lock.yaml
 M src/app/_layout.tsx
 M src/app/exercise/[id].tsx
 M src/app/exercise/index.tsx
 M src/app/history.tsx
 M src/app/index.tsx
 M src/app/routine/[id].tsx
 M src/app/routine/create.tsx
 M src/app/routine/edit/[id].tsx
 M src/app/routines.tsx
 M src/app/settings.tsx
 M src/app/workout/active.tsx
 M src/app/workout/summary.tsx
 M src/components/app-tabs.tsx
 M src/components/charts/ProgressChart.tsx
 M src/components/exercise/BestPerformanceCard.tsx
 M src/components/exercise/ExercisePRList.tsx
 M src/components/exercise/RecentHistoryList.tsx
 M src/components/home/CurrentRoutineCard.tsx
 M src/components/home/Greeting.tsx
 M src/components/home/RecentPRsCard.tsx
 M src/components/home/StartWorkoutButton.tsx
 M src/components/home/WeeklyActivityCard.tsx
 M src/components/home/WorkoutCalendarWidget.tsx
 M src/components/routine/DayEditor.tsx
 M src/components/routine/DaySection.tsx
 M src/components/routine/EmptyState.tsx
 M src/components/routine/ExerciseConfigurator.tsx
 M src/components/routine/ExercisePicker.tsx
 M src/components/routine/ExerciseRow.tsx
 M src/components/routine/MuscleDot.tsx
 M src/components/routine/RoutineCard.tsx
 M src/components/routine/RoutineForm.tsx
 M src/components/routine/RoutineHeader.tsx
 M src/components/routine/StartWorkoutButton.tsx
 M src/components/routine/SuggestedTemplates.tsx
 M src/components/ui/ExerciseCard.tsx
 M src/components/ui/FAB.tsx
 M src/components/ui/SearchBar.tsx
 M src/components/workout/ActiveWorkoutExpandedSurface.tsx
 M src/components/workout/ActiveWorkoutHeaderContent.tsx
 M src/components/workout/ActiveWorkoutMinimizedHeader.tsx
 M src/components/workout/ActiveWorkoutModal.tsx
 M src/components/workout/BottomBar.tsx
 M src/components/workout/SetRow.tsx
 M src/components/workout/WorkoutExerciseCard.tsx
 M src/components/workout/WorkoutHeader.tsx
 M src/features/exercises/ExerciseFormModal.tsx
 M src/features/onboarding/OnboardingScreen.tsx
 M src/features/routine/routineFormMapping.ts
 M src/features/routine/routineFormSchema.ts
 M src/features/settings/dataPortability.ts
 M src/features/workout/FinishWorkoutFlow.ts
 M src/features/workout/StartWorkoutFlow.ts
 M src/features/workout/__tests__/StartWorkoutFlow.test.ts
 M src/features/workout/stores/__tests__/activeWorkoutStore.test.ts
 M src/features/workout/stores/activeWorkoutStore.ts
 M src/storage/repositories/workoutRepo.ts
 M src/theme/index.ts
?? assets/images/exercises/
?? assets/images/filters/
?? docs/superpowers/
?? openspec/changes/accessible-exercise-filters/
?? openspec/changes/exercise-visual-tab/
?? openspec/changes/i18n-es-en/
?? openspec/changes/remove-active-exercise-collapse/
?? openspec/changes/routines-screen-bottom-navigation/
?? openspec/changes/stabilize-active-workout-set-logging/
?? src/components/app-tabs.config.test.ts
?? src/components/app-tabs.config.ts
?? src/components/exercise/ExerciseFilterButton.tsx
?? src/components/exercise/ExerciseFilterSheet.tsx
?? src/components/workout/__tests__/
?? src/features/exercises/__tests__/
?? src/features/exercises/exerciseFilterOptions.ts
?? src/features/exercises/exerciseVisuals.test.ts
?? src/features/exercises/exerciseVisuals.ts
?? src/i18n/

$ git rev-parse HEAD
970b770d11fa7cc4b1a67b3810317f336f8f5d9b

$ node -p "require('./package.json').dependencies.expo"
~55.0.26

$ node -p "require('./package.json').dependencies['react-native']"
0.83.6
```

## Commands

```bash
cd flutter-version
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

## Parity Gates

- Clean Architecture boundary scans pass for migrated features.
- Core loop works offline: create routine, start workout, log sets, finish session, and view progress.
- Active Workout set logging remains under 3 seconds on Android hardware.
- Completed sets autosave to SQLite and active sessions recover after process death.
- Existing `.zenlift` export/import round-trips without data loss.
- UI matches `DESIGN.md` tokens and approved reference screenshots with reasonable pixel-level parity.
- OpenSpec validates with `openspec validate migrate-app-to-flutter --strict`.
- Domain, repository, widget, golden, integration, and manual-device parity checks pass before cutover.
- Expo app remains runnable until all parity gates pass.
