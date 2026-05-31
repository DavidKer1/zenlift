import 'package:drift/drift.dart';

import 'database_connection.dart';

part 'app_database.g.dart';

const appDatabaseSchemaVersion = 1;

class MuscleGroups extends Table {
  TextColumn get id => text()();
  TextColumn get name => text().unique()();
  TextColumn get displayNameEs => text()();
  TextColumn get color => text()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Exercises extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get equipment => text()();
  TextColumn get category => text()();
  BoolColumn get isCustom => boolean().withDefault(const Constant(false))();
  BoolColumn get isFavorite => boolean().withDefault(const Constant(false))();
  TextColumn get notes => text().nullable()();
  TextColumn get createdAt => text().nullable()();
  TextColumn get updatedAt => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class ExerciseMuscles extends Table {
  TextColumn get id => text()();
  TextColumn get exerciseId =>
      text().references(Exercises, #id, onDelete: KeyAction.cascade)();
  TextColumn get muscleGroupId =>
      text().references(MuscleGroups, #id, onDelete: KeyAction.cascade)();
  TextColumn get role => text()();

  @override
  List<String> get customConstraints => [
    "CHECK (role IN ('primary','secondary'))",
  ];

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Routines extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get description => text().nullable()();
  TextColumn get goal => text().nullable()();
  BoolColumn get isArchived => boolean().withDefault(const Constant(false))();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();
  TextColumn get createdAt => text().nullable()();
  TextColumn get updatedAt => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class RoutineDays extends Table {
  TextColumn get id => text()();
  TextColumn get routineId =>
      text().references(Routines, #id, onDelete: KeyAction.cascade)();
  TextColumn get name => text()();
  IntColumn get dayOfWeek => integer().nullable()();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class RoutineExercises extends Table {
  TextColumn get id => text()();
  TextColumn get routineDayId =>
      text().references(RoutineDays, #id, onDelete: KeyAction.cascade)();
  TextColumn get exerciseId =>
      text().references(Exercises, #id, onDelete: KeyAction.cascade)();
  IntColumn get targetSets => integer().nullable()();
  IntColumn get targetRepsMin => integer().nullable()();
  IntColumn get targetRepsMax => integer().nullable()();
  TextColumn get notes => text().nullable()();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class WorkoutSessions extends Table {
  TextColumn get id => text()();
  TextColumn get routineId => text().nullable().references(
    Routines,
    #id,
    onDelete: KeyAction.cascade,
  )();
  TextColumn get routineDayId => text().nullable().references(
    RoutineDays,
    #id,
    onDelete: KeyAction.cascade,
  )();
  TextColumn get name => text().nullable()();
  TextColumn get startedAt => text()();
  TextColumn get endedAt => text().nullable()();
  IntColumn get durationSeconds => integer().nullable()();
  TextColumn get status => text()();
  TextColumn get notes => text().nullable()();
  TextColumn get createdAt => text().nullable()();
  TextColumn get updatedAt => text().nullable()();

  @override
  List<String> get customConstraints => [
    "CHECK (status IN ('active','completed','cancelled'))",
  ];

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class WorkoutExercises extends Table {
  TextColumn get id => text()();
  TextColumn get workoutSessionId =>
      text().references(WorkoutSessions, #id, onDelete: KeyAction.cascade)();
  TextColumn get exerciseId =>
      text().references(Exercises, #id, onDelete: KeyAction.cascade)();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();
  TextColumn get notes => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class SetLogs extends Table {
  TextColumn get id => text()();
  TextColumn get workoutExerciseId =>
      text().references(WorkoutExercises, #id, onDelete: KeyAction.cascade)();
  IntColumn get setNumber => integer()();
  RealColumn get weight => real()();
  IntColumn get reps => integer()();
  TextColumn get setType => text().withDefault(const Constant('normal'))();
  BoolColumn get isCompleted => boolean().withDefault(const Constant(false))();
  TextColumn get completedAt => text().nullable()();
  TextColumn get notes => text().nullable()();

  @override
  List<String> get customConstraints => [
    "CHECK (set_type IN ('normal','warmup','drop','failure','amrap'))",
  ];

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class PersonalRecords extends Table {
  TextColumn get id => text()();
  TextColumn get exerciseId =>
      text().references(Exercises, #id, onDelete: KeyAction.cascade)();
  TextColumn get workoutSessionId =>
      text().references(WorkoutSessions, #id, onDelete: KeyAction.cascade)();
  TextColumn get type => text()();
  RealColumn get value => real()();
  RealColumn get weight => real().nullable()();
  IntColumn get reps => integer().nullable()();
  TextColumn get achievedAt => text()();

  @override
  List<String> get customConstraints => [
    "CHECK (type IN ('max_weight','max_volume','max_reps','estimated_1rm','max_session_volume'))",
  ];

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class AppSettings extends Table {
  TextColumn get key => text()();
  TextColumn get value => text()();

  @override
  Set<Column<Object>> get primaryKey => {key};
}

class MigrationRecords extends Table {
  @override
  String get tableName => '_migrations';

  IntColumn get version => integer()();
  TextColumn get description => text().nullable()();
  TextColumn get appliedAt => text()();

  @override
  Set<Column<Object>> get primaryKey => {version};
}

@DriftDatabase(
  tables: [
    MuscleGroups,
    Exercises,
    ExerciseMuscles,
    Routines,
    RoutineDays,
    RoutineExercises,
    WorkoutSessions,
    WorkoutExercises,
    SetLogs,
    PersonalRecords,
    AppSettings,
    MigrationRecords,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? executor])
    : super(executor ?? openZenliftDatabaseConnection());

  @override
  int get schemaVersion => appDatabaseSchemaVersion;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (migrator) async {
      await migrator.createAll();
      await _createIndices();
    },
    onUpgrade: (migrator, from, to) async {},
    beforeOpen: (details) async {
      await customStatement('PRAGMA foreign_keys = ON');
      await _enableWalIfSupported();
    },
  );

  Future<void> _createIndices() async {
    for (final statement in _createIndexStatements) {
      await customStatement(statement);
    }
  }

  Future<void> _enableWalIfSupported() async {
    try {
      await customStatement('PRAGMA journal_mode = WAL');
    } on Object {
      // Some SQLite targets, including in-memory databases, may not support WAL.
    }
  }
}

const _createIndexStatements = [
  '''
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_exercise
ON exercise_muscles(exercise_id)
''',
  '''
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_muscle
ON exercise_muscles(muscle_group_id)
''',
  '''
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status
ON workout_sessions(status)
''',
  '''
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started
ON workout_sessions(started_at)
''',
  '''
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session
ON workout_exercises(workout_session_id)
''',
  '''
CREATE INDEX IF NOT EXISTS idx_set_logs_workout_exercise
ON set_logs(workout_exercise_id)
''',
];
