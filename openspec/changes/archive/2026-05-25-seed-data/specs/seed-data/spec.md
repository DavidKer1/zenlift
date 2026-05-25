## ADDED Requirements

### Requirement: Seed muscle groups on first launch

The system SHALL insert exactly 13 muscle groups with predefined colors into the `muscle_groups` table when no data exists. Each muscle group SHALL have a deterministic UUID, a unique English name, a Spanish display name, and a distinct hex color.

#### Scenario: First app launch with empty database

- **WHEN** the app launches for the first time and `muscle_groups` table is empty
- **THEN** 13 muscle groups are inserted with names: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Abs, Quads, Hamstrings, Glutes, Calves, Full Body, Cardio
- **AND** each has a distinct color: Chest=#EF4444, Back=#3B82F6, Shoulders=#F59E0B, Biceps=#8B5CF6, Triceps=#EC4899, Forearms=#14B8A6, Abs=#F97316, Quads=#22C55E, Hamstrings=#6366F1, Glutes=#A855F7, Calves=#84CC16, Full Body=#6B7280, Cardio=#0EA5E9

#### Scenario: Re-launch with existing muscle groups

- **WHEN** the app launches and `muscle_groups` already has rows
- **THEN** no new muscle groups are inserted (INSERT OR IGNORE)
- **AND** no data is modified or deleted

### Requirement: Seed exercises on first launch

The system SHALL insert approximately 25 essential exercises with `isCustom=0` into the `exercises` table when no data exists. Each exercise SHALL have a name, equipment type, and category matching the primary muscle group name.

#### Scenario: Exercises seeded after muscle groups

- **WHEN** seed exercises are inserted after muscle groups
- **THEN** at least 25 exercises are inserted with `isCustom=0` and `isFavorite=0`
- **AND** each exercise has a non-empty name, equipment, and category field
- **AND** the following exercises are included: Bench Press (Chest, Barbell), Incline Bench Press (Chest, Barbell), Dumbbell Fly (Chest, Dumbbell), Cable Crossover (Chest, Cable), Pull Up (Back, Bodyweight), Barbell Row (Back, Barbell), Lat Pulldown (Back, Cable), Deadlift (Full Body, Barbell), Squat (Quads, Barbell), Leg Press (Quads, Machine), Romanian Deadlift (Hamstrings, Barbell), Leg Curl (Hamstrings, Machine), Leg Extension (Quads, Machine), Shoulder Press (Shoulders, Dumbbell), Lateral Raise (Shoulders, Dumbbell), Face Pull (Shoulders, Cable), Barbell Curl (Biceps, Barbell), Hammer Curl (Biceps, Dumbbell), Tricep Pushdown (Triceps, Cable), Overhead Tricep Extension (Triceps, Dumbbell), Calf Raise (Calves, Machine), Hip Thrust (Glutes, Barbell), Plank (Abs, Bodyweight), Hanging Leg Raise (Abs, Bodyweight), Farmers Walk (Forearms, Dumbbell)

#### Scenario: Re-launch with existing exercises

- **WHEN** the app launches and `exercises` already has rows
- **THEN** no new seed exercises are inserted
- **AND** existing exercises remain unchanged

### Requirement: Seed exercise-muscle relationships

The system SHALL insert at least one `primary` exercise-muscle relationship for each seed exercise. Some exercises MAY also have `secondary` muscle relationships.

#### Scenario: Each exercise has a primary muscle

- **WHEN** seed data is inserted
- **THEN** every seed exercise has at least one `exercise_muscles` record with `role='primary'`
- **AND** the following primary and secondary mappings exist:
  - Bench Press -> primary: Chest
  - Incline Bench Press -> primary: Chest, secondary: Shoulders
  - Dumbbell Fly -> primary: Chest
  - Cable Crossover -> primary: Chest
  - Pull Up -> primary: Back, secondary: Biceps
  - Barbell Row -> primary: Back, secondary: Biceps
  - Lat Pulldown -> primary: Back
  - Deadlift -> primary: Back, secondary: Hamstrings and Glutes
  - Squat -> primary: Quads, secondary: Glutes
  - Leg Press -> primary: Quads, secondary: Glutes
  - Romanian Deadlift -> primary: Hamstrings, secondary: Glutes
  - Leg Curl -> primary: Hamstrings
  - Leg Extension -> primary: Quads
  - Shoulder Press -> primary: Shoulders, secondary: Triceps
  - Lateral Raise -> primary: Shoulders
  - Face Pull -> primary: Shoulders
  - Barbell Curl -> primary: Biceps
  - Hammer Curl -> primary: Biceps, secondary: Forearms
  - Tricep Pushdown -> primary: Triceps
  - Overhead Tricep Extension -> primary: Triceps
  - Calf Raise -> primary: Calves
  - Hip Thrust -> primary: Glutes, secondary: Hamstrings
  - Plank -> primary: Abs
  - Hanging Leg Raise -> primary: Abs
  - Farmers Walk -> primary: Forearms, secondary: Full Body

### Requirement: Idempotent seeding with INSERT OR IGNORE

The system SHALL use INSERT OR IGNORE for all seed data inserts so that the seeding process can run multiple times without errors or duplicate records.

#### Scenario: Seed runs twice

- **WHEN** `seedDatabase()` is called twice on the same database
- **THEN** the second call produces no errors
- **AND** the row count for `muscle_groups` remains 13
- **AND** the row count for `exercises` remains approximately 25
- **AND** no duplicate `exercise_muscles` records are created

### Requirement: seedIfEmpty guards against unnecessary seeding

The system SHALL provide a `seedIfEmpty(db)` function that checks whether `muscle_groups` has any rows before calling `seedDatabase(db)`.

#### Scenario: Database is empty

- **WHEN** `seedIfEmpty()` is called and `muscle_groups` has 0 rows
- **THEN** `seedDatabase()` is invoked and seed data is inserted

#### Scenario: Database already has data

- **WHEN** `seedIfEmpty()` is called and `muscle_groups` has at least 1 row
- **THEN** `seedDatabase()` is NOT invoked
- **AND** the function returns without modifying data

### Requirement: Seed data loaded from JSON with hardcoded fallback

The system SHALL attempt to load seed data from `assets/exercise.json` first. If the file is unavailable or malformed, the system SHALL fall back to hardcoded data arrays embedded in the module.

#### Scenario: JSON file exists and is valid

- **WHEN** `seedDatabase()` is called and `assets/exercise.json` is available and valid
- **THEN** seed data is loaded from the JSON file
- **AND** muscle groups, exercises, and exercise-muscle relationships are inserted from JSON

#### Scenario: JSON file does not exist

- **WHEN** `seedDatabase()` is called and `assets/exercise.json` is not available
- **THEN** the system falls back to hardcoded seed data
- **AND** the same 13 muscle groups and 25 exercises are inserted

#### Scenario: JSON file is malformed

- **WHEN** `seedDatabase()` is called and `assets/exercise.json` cannot be parsed
- **THEN** the system falls back to hardcoded seed data
- **AND** an error is logged for debugging
- **AND** seeding completes successfully with hardcoded data

### Requirement: All inserts run in a single transaction

The system SHALL execute all INSERT statements (muscle_groups, exercises, exercise_muscles) within a single database transaction.

#### Scenario: Transaction commits successfully

- **WHEN** all inserts succeed
- **THEN** the transaction is committed
- **AND** all seed data is persisted atomically

#### Scenario: An insert fails mid-transaction

- **WHEN** any insert fails during seeding
- **THEN** the transaction is rolled back
- **AND** no partial seed data remains in the database
- **AND** the error is propagated to the caller
