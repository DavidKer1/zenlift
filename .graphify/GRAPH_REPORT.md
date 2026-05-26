# Graph Report - .  (2026-05-26)

## Corpus Check
- Large corpus: 651 files · ~391,223 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1025 nodes · 2048 edges · 37 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 651 · Candidates: 729
- Excluded: 8 untracked · 89187 ignored · 0 sensitive · 4 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `1d9f588`
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

### Community 0 - "Exercise Detail & Charts"
Cohesion: 0.05
Nodes (53): EMPTY_WEEK, formatDate(), formatDateOnly(), formatDuration(), getWeekStart(), HomeScreen(), mapLastWorkout(), mapSessionFallback() (+45 more)

### Community 1 - "Home Screen & Date Utils"
Cohesion: 0.06
Nodes (51): ProgressChart(), ProgressChartProps, styles, styles, ThemedText(), ThemedTextProps, BestPerformanceCard(), BestPerformanceCardProps (+43 more)

### Community 2 - "Routine Repository Tests"
Cohesion: 0.05
Nodes (49): estimate1RM(), estimate1RMFromSets(), getBestEstimated1RM(), AppSettings, Equipment, Exercise, ExerciseCategory, ExerciseMuscle (+41 more)

### Community 3 - "Exercise Repository & CRUD"
Cohesion: 0.05
Nodes (29): DayData, DayUpdates, ExerciseData, ExerciseUpdates, mapJoinRow(), RoutineData, RoutineJoinRow, RoutineRepo (+21 more)

### Community 4 - "Workout Repository"
Cohesion: 0.05
Nodes (41): HistoryScreen(), styles, HintRow(), HintRowProps, styles, ThemedView(), ThemedViewProps, styles (+33 more)

### Community 5 - "Domain Entities & Types"
Cohesion: 0.08
Nodes (37): EditRoutineScreen(), styles, CreateRoutineScreen(), ConfiguratorState, DayEditor(), DayEditorProps, formatExerciseSummary(), formatReps() (+29 more)

### Community 6 - "Seed Data Tests"
Cohesion: 0.06
Nodes (30): CreateExerciseData, ExerciseRepo, MuscleEntry, UpdateExerciseData, created, data, { db }, exercise (+22 more)

### Community 7 - "Import/Export & Action UI"
Cohesion: 0.08
Nodes (41): closeDatabase(), getDatabase(), resetDatabaseInstance(), SchemaEntityTypes, getCurrentVersion(), Migration, MIGRATIONS, runMigrations() (+33 more)

### Community 8 - "Exercise Form & Categories"
Cohesion: 0.09
Nodes (38): ActionButton(), ActionButtonProps, confirmLargeImport(), formatRestTime(), getErrorMessage(), InfoRow(), InfoRowProps, SectionProps (+30 more)

### Community 9 - "Routine Repository"
Cohesion: 0.09
Nodes (26): onboardingStorage, RootNavigation(), styles, TabLayout(), OnboardingRoute(), AnimatedIcon(), AnimatedSplashOverlay(), glowKeyframe (+18 more)

### Community 10 - "Volume Calculation Services"
Cohesion: 0.06
Nodes (2): getHomeCalendarDisplayLabel(), WorkoutRepo

### Community 11 - "Data Portability"
Cohesion: 0.1
Nodes (36): active, archived, call, created, day1, day2, dayIds, dayInserts (+28 more)

### Community 12 - "App Navigation & Layout"
Cohesion: 0.1
Nodes (33): buildMuscleEntries(), CATEGORY_VALUES, EQUIPMENT_VALUES, ExerciseFormData, ExerciseFormModal(), ExerciseFormModalProps, exerciseFormSchema, ExerciseMuscleRoleRow (+25 more)

### Community 13 - "PR Detection Tests"
Cohesion: 0.11
Nodes (26): calculateExerciseVolume(), calculateMuscleVolume(), calculateSessionVolume(), calculateSetVolume(), calculateWeeklyVolume(), formatISOWeek(), getISOWeek(), exercises (+18 more)

### Community 14 - "Fallback & Seed Data"
Cohesion: 0.06
Nodes (27): activeSession, before, completedSet, { detectPRs }, ex1, ex2, ex3, exercise (+19 more)

### Community 15 - "Routine Form Validation"
Cohesion: 0.09
Nodes (18): categoryLabels, equipmentIconLabels, equipmentLabels, ExercisePicker(), ExercisePickerProps, ExercisePickerSelection, FilterChip(), styles (+10 more)

### Community 16 - "Settings & Preferences"
Cohesion: 0.14
Nodes (25): a, allInserts, b, beginIdx, colors, commitIdx, { db, execCalls }, { db, runCalls } (+17 more)

### Community 17 - "Exercise Library Screen"
Cohesion: 0.13
Nodes (17): getRoutineRepo(), RoutineFlashList, RoutineListProps, RoutinesScreen(), styles, EmptyState(), EmptyStateProps, styles (+9 more)

### Community 18 - "Onboarding Flow"
Cohesion: 0.14
Nodes (18): applyExerciseIntersection(), EquipmentOption, equipmentOptions, ExerciseLibraryScreen(), ExerciseListItem, flashListSizingProps, ListSeparator(), loadPrimaryMuscles() (+10 more)

### Community 19 - "UI Helpers"
Cohesion: 0.11
Nodes (16): ExerciseRow, ExerciseRowProps, styles, MuscleDot, MuscleDotProps, styles, SetRow, SetRowProps (+8 more)

### Community 20 - "Theme System"
Cohesion: 0.2
Nodes (17): ex1, ex2, exA, exB, exercise, findPR(), histExercise, histSession (+9 more)

### Community 21 - "Unit Conversion"
Cohesion: 0.33
Nodes (9): convertWeight(), formatWeight(), formatWeightShort(), getIncrement(), kgToLb(), lbToKg(), roundTwoDecimals(), assert() (+1 more)

### Community 22 - "Routine Detail Screen"
Cohesion: 0.28
Nodes (6): args, filePath, files, formatErrors(), validateFile(), validator

### Community 23 - "Routines List Screen"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 24 - "Muscle Group Repository"
Cohesion: 0.25
Nodes (7): alertSpy, mockDb, mockGetActiveSession, mockRouterReplace, mockStoreState, { startWorkoutFlow }, startWorkoutFlow()

### Community 25 - "Routine Data Mapping"
Cohesion: 0.22
Nodes (5): ActiveWorkoutActions, ActiveWorkoutState, ActiveWorkoutStore, StartWorkoutParams, useActiveWorkoutStore

### Community 26 - "Theme Tokens"
Cohesion: 0.43
Nodes (7): CACHE_DIRECTORY, fetchCached(), getExpires(), hashUrl(), loadCacheEntry(), parseMaxAge(), saveCacheEntry()

### Community 27 - "Workout Day UI"
Cohesion: 0.43
Nodes (6): AnimatedIcon(), AnimatedSplashOverlay(), glowKeyframe, keyframe, logoKeyframe, styles

### Community 28 - "Exercise Configurator"
Cohesion: 0.25
Nodes (7): CountRow, HomeCalendarActivityDate, HomeCalendarFrequencyKind, HomeCalendarLatestWorkout, HomeCalendarLatestWorkoutRow, HomeCalendarRepeatParams, HomeCalendarSummary

### Community 29 - "Exercise Picker"
Cohesion: 0.25
Nodes (1): workoutStorage

### Community 30 - "Themed Components"
Cohesion: 0.33
Nodes (4): PrevPerfEntry, styles, finishWorkoutFlow(), formatApproxDuration()

### Community 31 - "Exercise Card UI"
Cohesion: 0.67
Nodes (4): calculateImprovement(), DetectedPR, detectPRs(), getQualifyingSets()

### Community 32 - "ID Generation & Crypto"
Cohesion: 0.4
Nodes (5): formatTime(), styles, WorkoutHeader, WorkoutHeaderComponent(), WorkoutHeaderProps

### Community 33 - "Create Routine Flow"
Cohesion: 0.5
Nodes (4): ActiveWorkoutModal(), formatTime(), PrevPerfEntry, styles

### Community 34 - "Day Editor"
Cohesion: 0.67
Nodes (2): ExternalLink(), Props

### Community 35 - "Exercise Row & Muscle Dot"
Cohesion: 0.67
Nodes (2): { defineConfig }, expoConfig

### Community 36 - "Database Connection"
Cohesion: 0.67
Nodes (1): useColorScheme()

## Knowledge Gaps
- **118 isolated node(s):** `CACHE_DIRECTORY`, `args`, `files`, `filePath`, `{ defineConfig }` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Volume Calculation Services`** (2 nodes): `getHomeCalendarDisplayLabel()`, `WorkoutRepo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exercise Picker`** (1 nodes): `workoutStorage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Day Editor`** (2 nodes): `ExternalLink()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Exercise Row & Muscle Dot`** (2 nodes): `{ defineConfig }`, `expoConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Connection`** (1 nodes): `useColorScheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WorkoutRepo` connect `Volume Calculation Services` to `Exercise Configurator`, `Exercise Repository & CRUD`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `CACHE_DIRECTORY`, `args`, `files` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Exercise Detail & Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Home Screen & Date Utils` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Routine Repository Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Exercise Repository & CRUD` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Workout Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._