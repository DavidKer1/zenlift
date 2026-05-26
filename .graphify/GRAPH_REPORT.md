# Graph Report - .  (2026-05-26)

## Corpus Check
- Large corpus: 645 files · ~389,863 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1008 nodes · 2019 edges · 42 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 645 · Candidates: 720
- Excluded: 10 untracked · 88878 ignored · 0 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `dfe602a`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `WorkoutRepo` - 38 edges
2. `RoutineRepo` - 23 edges
3. `ExerciseRepo` - 17 edges
4. `seedDatabase()` - 7 edges
5. `readSettingsSnapshot()` - 6 edges
6. `roundTwoDecimals()` - 6 edges
7. `fetchCached()` - 5 edges
8. `calculateWeeklyVolume()` - 5 edges
9. `detectPRs()` - 5 edges
10. `exportZenliftData()` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 30 - "Themed Components"
Cohesion: 0.43
Nodes (7): CACHE_DIRECTORY, fetchCached(), hashUrl(), loadCacheEntry(), saveCacheEntry(), getExpires(), parseMaxAge()

### Community 25 - "Routine Data Mapping"
Cohesion: 0.28
Nodes (6): validateFile(), formatErrors(), args, files, validator, filePath

### Community 40 - "Routine Templates"
Cohesion: 0.67
Nodes (2): { defineConfig }, expoConfig

### Community 26 - "Theme Tokens"
Cohesion: 0.22
Nodes (7): fs, path, readline, root, oldDirs, exampleDirPath, rl

### Community 11 - "Data Portability"
Cohesion: 0.1
Nodes (26): onboardingStorage, RootNavigation(), TabLayout(), styles, OnboardingRoute(), AnimatedSplashOverlay(), keyframe, logoKeyframe (+18 more)

### Community 1 - "Home Screen & Date Utils"
Cohesion: 0.06
Nodes (51): SetRow, equipmentLabels, equipmentIcons, categoryLabels, groupSetsBySession(), AllSets, ExerciseDetailScreen(), styles (+43 more)

### Community 17 - "Exercise Library Screen"
Cohesion: 0.14
Nodes (18): ExerciseListItem, PrimaryMuscleRow, Repositories, EquipmentOption, equipmentOptions, flashListSizingProps, loadPrimaryMuscles(), applyExerciseIntersection() (+10 more)

### Community 2 - "Routine Repository Tests"
Cohesion: 0.05
Nodes (41): HistoryScreen(), styles, HintRowProps, HintRow(), styles, ExerciseConfiguration, ExerciseConfiguratorProps, ExerciseConfigurator() (+33 more)

### Community 0 - "Exercise Detail & Charts"
Cohesion: 0.05
Nodes (53): EMPTY_WEEK, HomeScreen(), mapWeeklyActivity(), getWeekStart(), formatDateOnly(), styles, CurrentRoutineCardData, CurrentRoutineCardProps (+45 more)

### Community 5 - "Domain Entities & Types"
Cohesion: 0.06
Nodes (22): MuscleColorRow, resolvePrimaryMuscleColors(), RoutineDetailScreen(), styles, RoutineCardProps, formatCount(), RoutineCard, styles (+14 more)

### Community 3 - "Exercise Repository & CRUD"
Cohesion: 0.08
Nodes (37): CreateRoutineScreen(), EditRoutineScreen(), styles, DayEditorProps, ConfiguratorState, DayEditor(), SmallActionButton(), formatExerciseSummary() (+29 more)

### Community 16 - "Settings & Preferences"
Cohesion: 0.13
Nodes (17): RoutineListProps, RoutineFlashList, getRoutineRepo(), RoutinesScreen(), styles, EmptyStateProps, EmptyState(), styles (+9 more)

### Community 7 - "Import/Export & Action UI"
Cohesion: 0.09
Nodes (38): THEME_OPTIONS, WEIGHT_UNIT_OPTIONS, formatRestTime(), getErrorMessage(), confirmLargeImport(), SettingsScreen(), SectionProps, SettingsSection() (+30 more)

### Community 27 - "Workout Day UI"
Cohesion: 0.22
Nodes (5): PrevPerfEntry, styles, BottomBarProps, BottomBar, styles

### Community 12 - "App Navigation & Layout"
Cohesion: 0.11
Nodes (26): PR_LABELS, PR_COLORS, formatDuration(), formatVolume(), PreviousComparison, WorkoutSummaryScreen(), styles, makeSet() (+18 more)

### Community 31 - "Exercise Card UI"
Cohesion: 0.43
Nodes (6): AnimatedSplashOverlay(), keyframe, logoKeyframe, glowKeyframe, AnimatedIcon(), styles

### Community 39 - "Routine Form UI"
Cohesion: 0.67
Nodes (2): Props, ExternalLink()

### Community 20 - "Theme System"
Cohesion: 0.22
Nodes (7): DaySectionProps, DaySection(), styles, StartWorkoutButtonProps, StartWorkoutButton(), styles, PersonalRecordWithExerciseName

### Community 24 - "Muscle Group Repository"
Cohesion: 0.36
Nodes (8): ExercisePickerSelection, ExercisePickerProps, equipmentLabels, categoryLabels, equipmentIconLabels, ExercisePicker(), FilterChip(), styles

### Community 18 - "Onboarding Flow"
Cohesion: 0.11
Nodes (16): ExerciseRowProps, ExerciseRow, styles, MuscleDotProps, MuscleDot, styles, SetRowProps, SetRow (+8 more)

### Community 34 - "Day Editor"
Cohesion: 0.32
Nodes (6): PrevPerfEntry, formatTime(), ActiveWorkoutModal(), styles, formatApproxDuration(), finishWorkoutFlow()

### Community 38 - "PR List Display"
Cohesion: 0.4
Nodes (5): WorkoutHeaderProps, formatTime(), WorkoutHeaderComponent(), WorkoutHeader, styles

### Community 23 - "Routines List Screen"
Cohesion: 0.33
Nodes (7): makeSet(), sets, history, result, estimate1RM(), estimate1RMFromSets(), getBestEstimated1RM()

### Community 14 - "Fallback & Seed Data"
Cohesion: 0.13
Nodes (27): MuscleRole, Equipment, ExerciseCategory, SetType, WorkoutStatus, PersonalRecordType, SQLiteBoolean, MuscleGroup (+19 more)

### Community 32 - "ID Generation & Crypto"
Cohesion: 0.43
Nodes (6): makeSet(), makeSession(), result, sets, sessions, history

### Community 19 - "UI Helpers"
Cohesion: 0.2
Nodes (17): makeSet(), makeExercise(), makeWorkoutExerciseWithSets(), makeSession(), makePersonalRecord(), findPR(), sets, exercise (+9 more)

### Community 37 - "Animations"
Cohesion: 0.67
Nodes (4): DetectedPR, calculateImprovement(), getQualifyingSets(), detectPRs()

### Community 10 - "Volume Calculation Services"
Cohesion: 0.1
Nodes (33): EQUIPMENT_VALUES, CATEGORY_VALUES, exerciseFormSchema, ExerciseFormData, resolveExerciseForm, ExerciseFormModalProps, PickerOption, ExerciseMuscleRoleRow (+25 more)

### Community 6 - "Seed Data Tests"
Cohesion: 0.08
Nodes (41): TABLE_COLUMNS, EXPORT_TABLES, IMPORT_TABLES, DELETE_TABLES, TableName, DatabaseRow, rowSchema, zenliftExportSchema (+33 more)

### Community 28 - "Exercise Configurator"
Cohesion: 0.25
Nodes (7): startWorkoutFlow(), mockRouterReplace, mockStoreState, mockDb, mockGetActiveSession, { startWorkoutFlow }, alertSpy

### Community 13 - "PR Detection Tests"
Cohesion: 0.06
Nodes (27): mockDb, mockMMKVStore, makeExercise(), makeWorkoutExerciseWithSets(), session, routineExercise, fullSession, { useActiveWorkoutStore } (+19 more)

### Community 29 - "Exercise Picker"
Cohesion: 0.22
Nodes (5): StartWorkoutParams, ActiveWorkoutState, ActiveWorkoutActions, ActiveWorkoutStore, useActiveWorkoutStore

### Community 35 - "Exercise Row & Muscle Dot"
Cohesion: 0.25
Nodes (1): workoutStorage

### Community 41 - "Database Schema & Migrations"
Cohesion: 0.67
Nodes (1): useColorScheme()

### Community 9 - "Routine Repository"
Cohesion: 0.1
Nodes (36): mockDb(), makeRoutine(), makeDay(), makeExercise(), makeJoinRow(), mock, repo, routine (+28 more)

### Community 4 - "Workout Repository"
Cohesion: 0.06
Nodes (30): makeMockDb(), makeExercise(), makeMuscleGroup(), { db }, repo, exercises, exercise, muscles (+22 more)

### Community 22 - "Routine Detail Screen"
Cohesion: 0.23
Nodes (5): makeMockDb(), { db }, repo, expected, MuscleGroupRepo

### Community 15 - "Routine Form Validation"
Cohesion: 0.14
Nodes (25): makeMockDb(), id, a, b, { db, runCalls, setGetFirstAsync }, muscleInsertCalls, { db, runCalls, execCalls }, muscleInserts (+17 more)

### Community 36 - "Database Connection"
Cohesion: 0.29
Nodes (4): QueryCall, mock, repo, workoutSessionQueries

### Community 33 - "Create Routine Flow"
Cohesion: 0.25
Nodes (7): HomeCalendarActivityDate, HomeCalendarFrequencyKind, HomeCalendarRepeatParams, HomeCalendarLatestWorkout, HomeCalendarSummary, HomeCalendarLatestWorkoutRow, CountRow

### Community 8 - "Exercise Form & Categories"
Cohesion: 0.06
Nodes (2): getHomeCalendarDisplayLabel(), WorkoutRepo

### Community 21 - "Unit Conversion"
Cohesion: 0.33
Nodes (9): assert(), WeightUnit, roundTwoDecimals(), kgToLb(), lbToKg(), convertWeight(), formatWeight(), formatWeightShort() (+1 more)

## Knowledge Gaps
- **111 isolated node(s):** `CACHE_DIRECTORY`, `args`, `files`, `filePath`, `{ defineConfig }` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Routine Templates`** (2 nodes): `{ defineConfig }`, `expoConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Routine Form UI`** (2 nodes): `Props`, `ExternalLink()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exercise Row & Muscle Dot`** (1 nodes): `workoutStorage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Schema & Migrations`** (1 nodes): `useColorScheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exercise Form & Categories`** (2 nodes): `getHomeCalendarDisplayLabel()`, `WorkoutRepo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WorkoutRepo` connect `Exercise Form & Categories` to `Create Routine Flow`, `Theme System`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `CACHE_DIRECTORY`, `args`, `files` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data Portability` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Home Screen & Date Utils` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Exercise Library Screen` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Routine Repository Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Exercise Detail & Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._