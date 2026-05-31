import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/storage/drift/app_database.dart';
import 'package:zenlift/storage/seed/exercise_seed_data.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

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

  Future<int> countRows(String tableName) async {
    final row = await database
        .customSelect('SELECT COUNT(*) AS count FROM $tableName')
        .getSingle();
    return row.read<int>('count');
  }

  test(
    'seedDatabase inserts JSON-backed muscle groups exercises and muscles',
    () async {
      await seedDatabase(database, now: DateTime.utc(2026, 5, 30, 12));

      expect(await countRows('muscle_groups'), 13);
      expect(await countRows('exercises'), 25);
      expect(await countRows('exercise_muscles'), 37);

      final bench = await (database.select(
        database.exercises,
      )..where((table) => table.name.equals('Bench Press'))).getSingle();
      expect(bench.equipment, 'Barbell');
      expect(bench.category, 'Chest');
      expect(bench.isCustom, isFalse);
      expect(bench.isFavorite, isFalse);
    },
  );

  test(
    'seedDatabase is idempotent and gives every exercise one primary',
    () async {
      await seedDatabase(database);
      await seedDatabase(database);

      expect(await countRows('muscle_groups'), 13);
      expect(await countRows('exercises'), 25);
      expect(await countRows('exercise_muscles'), 37);

      final rows = await database.customSelect('''
SELECT e.id, COUNT(em.id) AS primary_count
FROM exercises e
LEFT JOIN exercise_muscles em
  ON e.id = em.exercise_id AND em.role = 'primary'
GROUP BY e.id
''').get();

      expect(rows, hasLength(25));
      expect(rows.map((row) => row.read<int>('primary_count')).toSet(), {1});
    },
  );

  test('seedIfEmpty skips seeding when muscle groups already exist', () async {
    await database
        .into(database.muscleGroups)
        .insert(
          MuscleGroupsCompanion.insert(
            id: 'manual-muscle',
            name: 'Manual',
            displayNameEs: 'Manual',
            color: '#FFFFFF',
          ),
        );

    await seedIfEmpty(database);

    expect(await countRows('muscle_groups'), 1);
    expect(await countRows('exercises'), 0);
  });

  test(
    'seedDatabase rolls back all seed rows when a relation is invalid',
    () async {
      final brokenSeed = ExerciseSeedData(
        version: 1,
        muscleGroups: fallbackExerciseSeedData.muscleGroups.take(1).toList(),
        exercises: [
          SeedExercise(
            id: 'exercise-broken',
            name: 'Broken',
            equipment: 'Barbell',
            category: 'Chest',
            muscles: const [
              SeedExerciseMuscle(
                muscleGroupId: 'missing-muscle',
                role: 'primary',
              ),
            ],
          ),
        ],
      );

      await expectLater(
        seedDatabase(database, seedData: brokenSeed),
        throwsA(isA<SqliteException>()),
      );

      expect(await countRows('muscle_groups'), 0);
      expect(await countRows('exercises'), 0);
      expect(await countRows('exercise_muscles'), 0);
    },
  );

  test('generateSeedId is deterministic and matches seeded relationship IDs', () {
    expect(
      generateSeedId('em', 'Bench Press:a1b2c3d4-0001-4000-8000-000000000001'),
      'cfae574e-c0e2-40e3-80e4-000008cec0e5',
    );
  });
}
