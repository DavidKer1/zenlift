import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  late AppDatabase database;

  setUp(() {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
  });

  tearDown(() async {
    await database.close();
  });

  Future<List<String>> tableNames() async {
    final rows = await database
        .customSelect(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .get();

    return rows.map((row) => row.read<String>('name')).toList();
  }

  Future<List<String>> columnNames(String tableName) async {
    final rows = await database
        .customSelect('PRAGMA table_info($tableName)')
        .get();
    return rows.map((row) => row.read<String>('name')).toList();
  }

  Future<void> insertCoreWorkoutGraph() async {
    await database.customStatement(
      "INSERT INTO muscle_groups (id, name, display_name_es, color) VALUES ('muscle-1', 'Chest', 'Pecho', '#f43f5e')",
    );
    await database.customStatement(
      "INSERT INTO exercises (id, name, equipment, category) VALUES ('exercise-1', 'Bench Press', 'barbell', 'strength')",
    );
    await database.customStatement(
      "INSERT INTO routines (id, name) VALUES ('routine-1', 'Push')",
    );
    await database.customStatement(
      "INSERT INTO routine_days (id, routine_id, name) VALUES ('day-1', 'routine-1', 'Day 1')",
    );
    await database.customStatement(
      "INSERT INTO workout_sessions (id, routine_id, routine_day_id, name, started_at, status) VALUES ('session-1', 'routine-1', 'day-1', 'Push', '2026-05-30T12:00:00Z', 'active')",
    );
    await database.customStatement(
      "INSERT INTO workout_exercises (id, workout_session_id, exercise_id) VALUES ('workout-exercise-1', 'session-1', 'exercise-1')",
    );
    await database.customStatement(
      "INSERT INTO set_logs (id, workout_exercise_id, set_number, weight, reps, is_completed) VALUES ('set-1', 'workout-exercise-1', 1, 100.0, 5, 1)",
    );
  }

  test('creates the core Zenlift storage tables', () async {
    await expectLater(
      tableNames(),
      completion(
        containsAll(<String>[
          'exercises',
          'muscle_groups',
          'exercise_muscles',
          'routines',
          'routine_days',
          'routine_exercises',
          'workout_sessions',
          'workout_exercises',
          'set_logs',
          'personal_records',
          'app_settings',
          '_migrations',
        ]),
      ),
    );
  });

  test('creates snake_case columns and meta tables', () async {
    await expectLater(
      columnNames('routine_exercises'),
      completion(
        allOf(
          containsAll(<String>[
            'id',
            'routine_day_id',
            'exercise_id',
            'target_sets',
            'target_reps_min',
            'target_reps_max',
            'notes',
            'sort_order',
          ]),
          isNot(contains('rest_seconds')),
        ),
      ),
    );
    await expectLater(
      columnNames('app_settings'),
      completion(containsAll(<String>['key', 'value'])),
    );
    await expectLater(
      columnNames('_migrations'),
      completion(containsAll(<String>['version', 'description', 'applied_at'])),
    );
  });

  test('accepts only supported set_type values', () async {
    await insertCoreWorkoutGraph();

    for (final setType in <String>[
      'normal',
      'warmup',
      'drop',
      'failure',
      'amrap',
    ]) {
      await database.customStatement(
        "INSERT INTO set_logs (id, workout_exercise_id, set_number, weight, reps, set_type) VALUES ('set-$setType', 'workout-exercise-1', 2, 90.0, 8, '$setType')",
      );
    }

    expect(
      database.customStatement(
        "INSERT INTO set_logs (id, workout_exercise_id, set_number, weight, reps, set_type) VALUES ('set-invalid', 'workout-exercise-1', 3, 90.0, 8, 'cluster')",
      ),
      throwsA(isA<SqliteException>()),
    );
  });

  test(
    'cascades workout session deletes through workout exercises and sets',
    () async {
      await insertCoreWorkoutGraph();

      await database.customStatement(
        "DELETE FROM workout_sessions WHERE id = 'session-1'",
      );

      final workoutExercises = await database
          .customSelect('SELECT COUNT(*) AS count FROM workout_exercises')
          .getSingle();
      final setLogs = await database
          .customSelect('SELECT COUNT(*) AS count FROM set_logs')
          .getSingle();

      expect(workoutExercises.read<int>('count'), 0);
      expect(setLogs.read<int>('count'), 0);
    },
  );
}
