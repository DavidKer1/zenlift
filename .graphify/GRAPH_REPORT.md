# Graph Report - src  (2026-05-25)

## Corpus Check
- Corpus is ~43,495 words - fits in a single context window. You may not need a graph.

## Summary
- 726 nodes · 952 edges · 54 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output


## Input Scope
- Requested: auto
- Resolved: committed (source: cli)
- Included files: 88 · Candidates: 105
- Excluded: 0 untracked · 0 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.
## God Nodes (most connected - your core abstractions)
1. `WorkoutRepo` - 33 edges
2. `RoutineRepo` - 22 edges
3. `ExerciseRepo` - 16 edges
4. `seedDatabase()` - 6 edges
5. `readSettingsSnapshot()` - 5 edges
6. `roundTwoDecimals()` - 5 edges
7. `calculateWeeklyVolume()` - 4 edges
8. `exportZenliftData()` - 4 edges
9. `MuscleGroupRepo` - 4 edges
10. `generateSeedId()` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Exercise Detail & Charts"
Cohesion: 0.05
Nodes (26): ProgressChartProps, styles, BestPerformanceCard(), BestPerformanceCardProps, formatKg(), styles, AllSets, categoryLabels (+18 more)

### Community 1 - "Home Screen & Date Utils"
Cohesion: 0.05
Nodes (25): EMPTY_WEEK, formatDate(), formatDuration(), mapLastWorkout(), mapSessionFallback(), styles, CurrentRoutineCardData, CurrentRoutineCardProps (+17 more)

### Community 2 - "Routine Repository Tests"
Cohesion: 0.05
Nodes (31): active, archived, call, created, day1, day2, dayIds, dayInserts (+23 more)

### Community 3 - "Exercise Repository & CRUD"
Cohesion: 0.06
Nodes (15): CreateExerciseData, ExerciseRepo, MuscleEntry, UpdateExerciseData, created, data, { db }, exercise (+7 more)

### Community 4 - "Workout Repository"
Cohesion: 0.07
Nodes (1): WorkoutRepo

### Community 5 - "Domain Entities & Types"
Cohesion: 0.07
Nodes (27): AppSettings, Equipment, Exercise, ExerciseCategory, ExerciseMuscle, ExerciseWithMuscles, FullRoutine, FullRoutineDay (+19 more)

### Community 6 - "Seed Data Tests"
Cohesion: 0.08
Nodes (24): a, allInserts, b, beginIdx, colors, commitIdx, { db, execCalls }, { db, runCalls } (+16 more)

### Community 7 - "Import/Export & Action UI"
Cohesion: 0.1
Nodes (12): ActionButtonProps, formatRestTime(), InfoRowProps, SectionProps, SegmentedControlProps, SettingRowProps, SettingsScreen(), StepperButtonProps (+4 more)

### Community 8 - "Exercise Form & Categories"
Cohesion: 0.1
Nodes (12): CATEGORY_VALUES, EQUIPMENT_VALUES, ExerciseFormData, ExerciseFormModal(), ExerciseFormModalProps, exerciseFormSchema, ExerciseMuscleRoleRow, getChangedExerciseFields() (+4 more)

### Community 9 - "Routine Repository"
Cohesion: 0.11
Nodes (1): RoutineRepo

### Community 10 - "Volume Calculation Services"
Cohesion: 0.12
Nodes (15): calculateExerciseVolume(), calculateMuscleVolume(), calculateSessionVolume(), calculateWeeklyVolume(), formatISOWeek(), getISOWeek(), exercises, makeExercise() (+7 more)

### Community 11 - "Data Portability"
Cohesion: 0.12
Nodes (16): createExportFilename(), DatabaseRow, DELETE_TABLES, EXPORT_TABLES, exportZenliftData(), getAppMetadata(), IMPORT_TABLES, ImportPickResult (+8 more)

### Community 12 - "App Navigation & Layout"
Cohesion: 0.12
Nodes (9): onboardingStorage, AnimatedSplashOverlay(), glowKeyframe, keyframe, logoKeyframe, styles, styles, TabItem (+1 more)

### Community 13 - "PR Detection Tests"
Cohesion: 0.12
Nodes (13): ex1, ex2, exA, exB, exercise, histExercise, histSession, makeExercise() (+5 more)

### Community 14 - "Fallback & Seed Data"
Cohesion: 0.2
Nodes (14): FALLBACK_EXERCISES, FALLBACK_MUSCLE_GROUPS, generateSeedId(), JsonExercise, JsonExerciseMuscle, JsonMuscleGroup, loadSeedData(), normalizeCategory() (+6 more)

### Community 15 - "Routine Form Validation"
Cohesion: 0.14
Nodes (11): dayFormSchema, DayFormValues, exerciseFormSchema, ExerciseFormValues, optionalNonNegativeInt, optionalPositiveInt, routineFormSchema, RoutineFormValues (+3 more)

### Community 16 - "Settings & Preferences"
Cohesion: 0.2
Nodes (10): clamp(), getSettingsValue(), isThemeMode(), isWeightUnit(), readInteger(), readSettingsSnapshot(), SETTINGS_KEY_SET, SettingsSnapshot (+2 more)

### Community 17 - "Exercise Library Screen"
Cohesion: 0.15
Nodes (7): EquipmentOption, equipmentOptions, ExerciseListItem, flashListSizingProps, PrimaryMuscleRow, Repositories, styles

### Community 18 - "Onboarding Flow"
Cohesion: 0.17
Nodes (5): OnboardingScreenProps, STEPS, storage, styles, { width: SCREEN_WIDTH }

### Community 19 - "UI Helpers"
Cohesion: 0.17
Nodes (7): HintRowProps, styles, styles, Colors, Fonts, Spacing, ThemeColor

### Community 20 - "Theme System"
Cohesion: 0.2
Nodes (5): getStoredThemeMode(), isThemeMode(), themeStorage, ZenliftThemeContext, ZenliftThemeContextValue

### Community 21 - "Unit Conversion"
Cohesion: 0.29
Nodes (7): convertWeight(), formatWeight(), formatWeightShort(), kgToLb(), lbToKg(), roundTwoDecimals(), WeightUnit

### Community 22 - "Routine Detail Screen"
Cohesion: 0.2
Nodes (5): MuscleColorRow, styles, goalLabels, RoutineHeaderProps, styles

### Community 23 - "Routines List Screen"
Cohesion: 0.2
Nodes (5): RoutineFlashList, RoutineListProps, styles, EmptyStateProps, styles

### Community 24 - "Muscle Group Repository"
Cohesion: 0.2
Nodes (4): MuscleGroupRepo, { db }, expected, repo

### Community 25 - "Routine Data Mapping"
Cohesion: 0.2
Nodes (8): DayData, DayUpdates, ExerciseData, ExerciseUpdates, RoutineData, RoutineJoinRow, RoutineUpdates, RoutineWithCounts

### Community 26 - "Theme Tokens"
Cohesion: 0.2
Nodes (8): fontFamilies, radius, spacing, ThemeColor, ThemeColorScheme, ThemeMode, zenliftColors, ZenliftThemeTokens

### Community 27 - "Workout Day UI"
Cohesion: 0.22
Nodes (4): DaySectionProps, styles, StartWorkoutButtonProps, styles

### Community 28 - "Exercise Configurator"
Cohesion: 0.25
Nodes (5): ExerciseConfiguration, ExerciseConfiguratorProps, parseInteger(), parseOptionalInteger(), styles

### Community 29 - "Exercise Picker"
Cohesion: 0.22
Nodes (6): categoryLabels, equipmentIconLabels, equipmentLabels, ExercisePickerProps, ExercisePickerSelection, styles

### Community 30 - "Themed Components"
Cohesion: 0.25
Nodes (3): styles, ThemedTextProps, styles

### Community 31 - "Exercise Card UI"
Cohesion: 0.28
Nodes (8): equipmentLabels, ExerciseCard, ExerciseCardComponent(), ExerciseCardExercise, ExerciseCardProps, getEquipmentIcon(), getMuscleColor(), styles

### Community 32 - "ID Generation & Crypto"
Cohesion: 0.22
Nodes (5): fallbackId, fallbackSample, id, originalCryptoDescriptor, sample

### Community 33 - "Create Routine Flow"
Cohesion: 0.29
Nodes (2): insertRoutineChildren(), insertRoutineExercise()

### Community 34 - "Day Editor"
Cohesion: 0.29
Nodes (5): ConfiguratorState, DayEditorProps, formatExerciseSummary(), formatReps(), styles

### Community 35 - "Exercise Row & Muscle Dot"
Cohesion: 0.25
Nodes (6): ExerciseRow, ExerciseRowProps, styles, MuscleDot, MuscleDotProps, styles

### Community 36 - "Database Connection"
Cohesion: 0.33
Nodes (3): closeDatabase(), resetDatabaseInstance(), styles

### Community 37 - "Animations"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 38 - "PR List Display"
Cohesion: 0.29
Nodes (3): ExercisePRListProps, prTypeLabels, styles

### Community 39 - "Routine Form UI"
Cohesion: 0.33
Nodes (5): collectValidationMessages(), goalLabels, RoutineForm(), RoutineFormProps, styles

### Community 40 - "Routine Templates"
Cohesion: 0.29
Nodes (4): styles, SuggestedRoutineTemplate, SuggestedTemplatesProps, templates

### Community 41 - "Database Schema & Migrations"
Cohesion: 0.33
Nodes (5): SchemaEntityTypes, getCurrentVersion(), Migration, MIGRATIONS, runMigrations()

### Community 42 - "PR & ID Utilities"
Cohesion: 0.43
Nodes (5): PersonalRecordWithExerciseName, createFallbackId(), fillFallbackBytes(), generateId(), getRandomBytes()

### Community 43 - "History Screen"
Cohesion: 0.33
Nodes (2): styles, ThemedViewProps

### Community 44 - "Routine Card"
Cohesion: 0.4
Nodes (3): RoutineCard, RoutineCardProps, styles

### Community 45 - "1RM Calculation Tests"
Cohesion: 0.4
Nodes (3): history, result, sets

### Community 46 - "PR Detection Service"
Cohesion: 0.6
Nodes (4): calculateImprovement(), DetectedPR, detectPRs(), getQualifyingSets()

### Community 47 - "Form Data Mapping"
Cohesion: 0.5
Nodes (2): mapFullRoutineToFormValues(), normalizeGoal()

### Community 48 - "Settings Constants"
Cohesion: 0.4
Nodes (4): DEFAULT_REST_RANGE, SETTINGS_KEYS, WEEKLY_GOAL_RANGE, WeightUnit

### Community 49 - "1RM Estimation"
Cohesion: 0.83
Nodes (3): estimate1RM(), estimate1RMFromSets(), getBestEstimated1RM()

### Community 50 - "FAB Component"
Cohesion: 0.5
Nodes (2): FABProps, styles

### Community 51 - "Filter Chip"
Cohesion: 0.5
Nodes (2): FilterChipProps, styles

### Community 52 - "Search Bar"
Cohesion: 0.5
Nodes (2): SearchBarProps, styles

### Community 53 - "External Link"
Cohesion: 0.67
Nodes (1): Props

## Knowledge Gaps
- **339 isolated node(s):** `onboardingStorage`, `SetRow`, `equipmentLabels`, `equipmentIcons`, `categoryLabels` (+334 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Workout Repository`** (1 nodes): `WorkoutRepo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Routine Repository`** (1 nodes): `RoutineRepo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Create Routine Flow`** (2 nodes): `insertRoutineChildren()`, `insertRoutineExercise()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `History Screen`** (2 nodes): `styles`, `ThemedViewProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Form Data Mapping`** (2 nodes): `mapFullRoutineToFormValues()`, `normalizeGoal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FAB Component`** (2 nodes): `FABProps`, `styles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Filter Chip`** (2 nodes): `FilterChipProps`, `styles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Search Bar`** (2 nodes): `SearchBarProps`, `styles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `External Link`** (1 nodes): `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WorkoutRepo` connect `Workout Repository` to `PR & ID Utilities`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `RoutineRepo` connect `Routine Repository` to `Routine Data Mapping`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `onboardingStorage`, `SetRow`, `equipmentLabels` to the rest of the system?**
  _339 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Exercise Detail & Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Home Screen & Date Utils` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Routine Repository Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Exercise Repository & CRUD` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._