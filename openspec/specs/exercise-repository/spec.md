# exercise-repository Specification

## Purpose
TBD - created by archiving change exercise-repository. Update Purpose after archive.
## Requirements
### Requirement: ExerciseRepo constructor accepts database instance
The ExerciseRepo class SHALL accept a database instance via its constructor parameter.

#### Scenario: Database injected at construction
- **WHEN** ExerciseRepo is instantiated with `new ExerciseRepo(db)`
- **THEN** the instance stores the database reference for all subsequent queries

### Requirement: getAll returns all exercises ordered by name
The ExerciseRepo SHALL provide a `getAll` method that returns all exercise rows ordered alphabetically by name.

#### Scenario: Retrieve all exercises
- **WHEN** `getAll()` is called
- **THEN** the method executes `SELECT * FROM exercises ORDER BY name` with no parameters
- **THEN** the result set is returned as an array of exercise objects

### Requirement: getById returns a single exercise
The ExerciseRepo SHALL provide a `getById` method that returns a single exercise by its UUID text ID.

#### Scenario: Exercise found
- **WHEN** `getById(id)` is called with a valid exercise ID
- **THEN** the method executes `SELECT * FROM exercises WHERE id = ?` with the ID parameter
- **THEN** returns the matching exercise row or null if not found

### Requirement: getByMuscle filters exercises by muscle group with JOIN
The ExerciseRepo SHALL provide a `getByMuscle` method that returns all exercises associated with a given muscle group via the exercise_muscles junction table.

#### Scenario: Exercises for a muscle group
- **WHEN** `getByMuscle(muscleGroupId)` is called
- **THEN** the method executes `SELECT DISTINCT e.* FROM exercises e JOIN exercise_muscles em ON e.id = em.exerciseId WHERE em.muscleGroupId = ?`
- **THEN** returns exercises that have the specified muscle group as primary or secondary

### Requirement: getByCategory filters exercises by category
The ExerciseRepo SHALL provide a `getByCategory` method that returns exercises matching a given category value.

#### Scenario: Filter by category
- **WHEN** `getByCategory(category)` is called
- **THEN** the method executes `SELECT * FROM exercises WHERE category = ?` with the category parameter
- **THEN** returns matching exercises ordered by name

### Requirement: getByEquipment filters exercises by equipment
The ExerciseRepo SHALL provide a `getByEquipment` method that returns exercises matching a given equipment value.

#### Scenario: Filter by equipment
- **WHEN** `getByEquipment(equipment)` is called
- **THEN** the method executes `SELECT * FROM exercises WHERE equipment = ?` with the equipment parameter
- **THEN** returns matching exercises ordered by name

### Requirement: search performs case-insensitive name search
The ExerciseRepo SHALL provide a `search` method that performs case-insensitive substring matching on exercise names.

#### Scenario: Case-insensitive search
- **WHEN** `search(query)` is called with a search term
- **THEN** the method executes `SELECT * FROM exercises WHERE name LIKE '%' || ? || '%' COLLATE NOCASE` with the query parameter
- **THEN** returns exercises whose name contains the query regardless of case
- **THEN** the query parameter is passed as a bound value, never interpolated

### Requirement: getFavorites returns favorited exercises
The ExerciseRepo SHALL provide a `getFavorites` method that returns all exercises where `isFavorite = 1`.

#### Scenario: Retrieve favorites
- **WHEN** `getFavorites()` is called
- **THEN** the method executes `SELECT * FROM exercises WHERE isFavorite = 1 ORDER BY name`
- **THEN** returns only favorited exercises

### Requirement: create inserts exercise and muscle associations in a transaction
The ExerciseRepo SHALL provide a `create` method that inserts a new exercise row and its muscle-group associations within a single database transaction.

#### Scenario: Successful creation with muscles
- **WHEN** `create(data, muscleIds)` is called with exercise fields and a list of `{ muscleGroupId, role }` objects
- **THEN** the method opens a transaction
- **THEN** inserts a row into `exercises` with the provided data (id, name, equipment, category, notes, createdAt, updatedAt)
- **THEN** inserts a row into `exercise_muscles` for each muscle entry with a generated UUID
- **THEN** commits the transaction
- **THEN** returns the newly created exercise

#### Scenario: Transaction rollback on failure
- **WHEN** any INSERT within the transaction fails
- **THEN** the entire transaction is rolled back
- **THEN** no partial data (exercise without muscles) is persisted

### Requirement: update modifies existing exercise fields
The ExerciseRepo SHALL provide an `update` method that modifies specific fields of an existing exercise.

#### Scenario: Update exercise fields
- **WHEN** `update(id, updates)` is called with an exercise ID and a partial updates object
- **THEN** the method builds a parametrized UPDATE query with only the provided fields
- **THEN** sets `updatedAt` to the current timestamp
- **THEN** returns the updated exercise

### Requirement: delete removes exercise with CASCADE cleanup
The ExerciseRepo SHALL provide a `delete` method that removes an exercise row, relying on CASCADE to clean up associated exercise_muscles rows.

#### Scenario: Delete exercise
- **WHEN** `delete(id)` is called with an exercise ID
- **THEN** the method executes `DELETE FROM exercises WHERE id = ?` with the ID parameter
- **THEN** associated exercise_muscles rows are removed by CASCADE

### Requirement: getMuscles returns muscle groups for an exercise
The ExerciseRepo SHALL provide a `getMuscles` method that returns all muscle-group rows associated with a given exercise.

#### Scenario: Get muscles for exercise
- **WHEN** `getMuscles(exerciseId)` is called
- **THEN** the method executes `SELECT mg.* FROM muscle_groups mg JOIN exercise_muscles em ON mg.id = em.muscleGroupId WHERE em.exerciseId = ?`
- **THEN** returns the muscle group rows (with role available from the JOIN if needed)

### Requirement: toggleFavorite flips the isFavorite flag
The ExerciseRepo SHALL provide a `toggleFavorite` method that flips the `isFavorite` boolean on an exercise and returns the updated row.

#### Scenario: Toggle favorite on
- **WHEN** `toggleFavorite(id)` is called for a non-favorited exercise
- **THEN** the method executes `UPDATE exercises SET isFavorite = NOT isFavorite WHERE id = ?`
- **THEN** returns the updated exercise with `isFavorite = 1`

### Requirement: addMuscle inserts a muscle association
The ExerciseRepo SHALL provide an `addMuscle` method that inserts a row into the exercise_muscles junction table.

#### Scenario: Add muscle to exercise
- **WHEN** `addMuscle(exerciseId, muscleGroupId, role)` is called
- **THEN** the method executes `INSERT INTO exercise_muscles (id, exerciseId, muscleGroupId, role) VALUES (?, ?, ?, ?)` with a new UUID and the provided parameters

### Requirement: removeMuscle deletes a muscle association
The ExerciseRepo SHALL provide a `removeMuscle` method that removes a row from the exercise_muscles junction table.

#### Scenario: Remove muscle from exercise
- **WHEN** `removeMuscle(exerciseId, muscleGroupId)` is called
- **THEN** the method executes `DELETE FROM exercise_muscles WHERE exerciseId = ? AND muscleGroupId = ?` with the provided parameters

### Requirement: MuscleGroupRepo provides read-only access
The MuscleGroupRepo class SHALL provide read-only methods for querying muscle groups.

#### Scenario: Get all muscle groups
- **WHEN** `MuscleGroupRepo.getAll()` is called
- **THEN** the method executes `SELECT * FROM muscle_groups ORDER BY name`
- **THEN** returns all muscle group rows

#### Scenario: Get muscle group by ID
- **WHEN** `MuscleGroupRepo.getById(id)` is called
- **THEN** the method executes `SELECT * FROM muscle_groups WHERE id = ?`
- **THEN** returns the matching muscle group or null

### Requirement: All queries SHALL be parametrized
Every SQL query in both repositories SHALL use bound parameters (`?` placeholders) and SHALL NOT use string interpolation or template-based query construction for values.

#### Scenario: No string interpolation in queries
- **WHEN** any repository method constructs a SQL query
- **THEN** all user-provided or variable values are passed as bound parameters
- **THEN** no values are concatenated into the SQL string

