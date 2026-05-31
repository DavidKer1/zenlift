import 'package:drift/drift.dart' hide isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/core/date/zenlift_clock.dart';
import 'package:zenlift/core/optional_field.dart';
import 'package:zenlift/core/uuid/id_generator.dart';
import 'package:zenlift/features/exercises/data/drift_exercise_repository.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  late AppDatabase database;
  late DriftExerciseRepository repository;
  late DriftMuscleGroupRepository muscleGroupRepository;

  Future<int> countRows(String tableName) async {
    final row = await database
        .customSelect('SELECT COUNT(*) AS count FROM $tableName')
        .getSingle();
    return row.read<int>('count');
  }

  Future<void> insertMuscleGroup({
    required String id,
    required String name,
    required String displayNameEs,
  }) async {
    await database
        .into(database.muscleGroups)
        .insert(
          MuscleGroupsCompanion.insert(
            id: id,
            name: name,
            displayNameEs: displayNameEs,
            color: '#FFFFFF',
          ),
        );
  }

  Future<void> insertExercise({
    required String id,
    required String name,
    required String equipment,
    required String category,
    bool isFavorite = false,
  }) async {
    await database
        .into(database.exercises)
        .insert(
          ExercisesCompanion.insert(
            id: id,
            name: name,
            equipment: equipment,
            category: category,
            isFavorite: Value(isFavorite),
            createdAt: const Value('2026-01-01T00:00:00.000Z'),
            updatedAt: const Value('2026-01-01T00:00:00.000Z'),
          ),
        );
  }

  Future<void> insertExerciseMuscle({
    required String id,
    required String exerciseId,
    required String muscleGroupId,
    required MuscleRole role,
  }) async {
    await database
        .into(database.exerciseMuscles)
        .insert(
          ExerciseMusclesCompanion.insert(
            id: id,
            exerciseId: exerciseId,
            muscleGroupId: muscleGroupId,
            role: role.value,
          ),
        );
  }

  setUp(() async {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    repository = DriftExerciseRepository(
      database,
      SequenceIdGenerator([
        'exercise-new',
        'exercise-new-muscle-1',
        'exercise-new-muscle-2',
        'exercise-extra-muscle',
      ]),
      FixedZenliftClock(DateTime.utc(2026, 5, 30, 12)),
    );
    muscleGroupRepository = DriftMuscleGroupRepository(database);

    await insertMuscleGroup(
      id: 'muscle-chest',
      name: 'Chest',
      displayNameEs: 'Pecho',
    );
    await insertMuscleGroup(
      id: 'muscle-back',
      name: 'Back',
      displayNameEs: 'Espalda',
    );
    await insertExercise(
      id: 'exercise-bench',
      name: 'Bench Press',
      equipment: 'barbell',
      category: 'chest',
    );
    await insertExercise(
      id: 'exercise-row',
      name: 'Barbell Row',
      equipment: 'barbell',
      category: 'back',
      isFavorite: true,
    );
    await insertExercise(
      id: 'exercise-fly',
      name: 'Dumbbell Fly',
      equipment: 'dumbbell',
      category: 'chest',
    );
    await insertExerciseMuscle(
      id: 'em-bench-chest',
      exerciseId: 'exercise-bench',
      muscleGroupId: 'muscle-chest',
      role: MuscleRole.primary,
    );
    await insertExerciseMuscle(
      id: 'em-row-back',
      exerciseId: 'exercise-row',
      muscleGroupId: 'muscle-back',
      role: MuscleRole.primary,
    );
    await insertExerciseMuscle(
      id: 'em-fly-chest',
      exerciseId: 'exercise-fly',
      muscleGroupId: 'muscle-chest',
      role: MuscleRole.primary,
    );
  });

  tearDown(() async {
    await database.close();
  });

  test('getAll returns exercises ordered by name', () async {
    final exercises = await repository.getAll();

    expect(exercises.map((exercise) => exercise.name), <String>[
      'Barbell Row',
      'Bench Press',
      'Dumbbell Fly',
    ]);
  });

  test('getById returns matching exercise or null', () async {
    expect((await repository.getById('exercise-bench'))?.name, 'Bench Press');
    expect(await repository.getById('missing'), isNull);
  });

  test('filters by muscle category equipment search and favorites', () async {
    expect(
      (await repository.getByMuscle(
        'muscle-chest',
      )).map((exercise) => exercise.name),
      <String>['Bench Press', 'Dumbbell Fly'],
    );
    expect(
      (await repository.getByCategory(
        'chest',
      )).map((exercise) => exercise.name),
      <String>['Bench Press', 'Dumbbell Fly'],
    );
    expect(
      (await repository.getByEquipment(
        'dumbbell',
      )).map((exercise) => exercise.name),
      <String>['Dumbbell Fly'],
    );
    expect(
      (await repository.search('BENCH')).map((exercise) => exercise.name),
      <String>['Bench Press'],
    );
    expect(
      (await repository.getFavorites()).map((exercise) => exercise.name),
      <String>['Barbell Row'],
    );
  });

  test('getMuscles and MuscleGroupRepository return domain entities', () async {
    final muscles = await repository.getMuscles('exercise-bench');
    final allGroups = await muscleGroupRepository.getAll();
    final back = await muscleGroupRepository.getById('muscle-back');

    expect(muscles.single.name, 'Chest');
    expect(allGroups.map((group) => group.name), <String>['Back', 'Chest']);
    expect(back?.displayNameEs, 'Espalda');
  });

  test(
    'create inserts exercise and muscle associations in one transaction',
    () async {
      final created = await repository.create(
        const CreateExerciseData(
          id: 'exercise-provided',
          name: 'Incline Bench Press',
          equipment: 'barbell',
          category: 'chest',
          notes: 'Low incline',
        ),
        const [
          MuscleEntry(muscleGroupId: 'muscle-chest', role: MuscleRole.primary),
          MuscleEntry(muscleGroupId: 'muscle-back', role: MuscleRole.secondary),
        ],
      );

      expect(created.id, 'exercise-provided');
      expect(created.createdAt, DateTime.utc(2026, 5, 30, 12));
      expect(await countRows('exercise_muscles'), 5);
      expect(
        (await repository.getMuscles(
          'exercise-provided',
        )).map((group) => group.name),
        <String>['Back', 'Chest'],
      );
    },
  );

  test('create rejects zero or multiple primary muscles', () async {
    await expectLater(
      repository.create(
        const CreateExerciseData(
          name: 'No Primary',
          equipment: 'barbell',
          category: 'chest',
        ),
        const [
          MuscleEntry(
            muscleGroupId: 'muscle-chest',
            role: MuscleRole.secondary,
          ),
        ],
      ),
      throwsStateError,
    );

    await expectLater(
      repository.create(
        const CreateExerciseData(
          name: 'Two Primaries',
          equipment: 'barbell',
          category: 'chest',
        ),
        const [
          MuscleEntry(muscleGroupId: 'muscle-chest', role: MuscleRole.primary),
          MuscleEntry(muscleGroupId: 'muscle-back', role: MuscleRole.primary),
        ],
      ),
      throwsStateError,
    );
  });

  test('create rolls back when a muscle association fails', () async {
    await expectLater(
      repository.create(
        const CreateExerciseData(
          name: 'Broken Exercise',
          equipment: 'barbell',
          category: 'chest',
        ),
        const [
          MuscleEntry(
            muscleGroupId: 'missing-muscle',
            role: MuscleRole.primary,
          ),
        ],
      ),
      throwsA(isA<SqliteException>()),
    );

    expect(await repository.getById('exercise-new'), isNull);
  });

  test('update changes only provided fields and can clear notes', () async {
    final renamed = await repository.update(
      'exercise-bench',
      const UpdateExerciseData(name: 'Flat Bench Press'),
    );
    final cleared = await repository.update(
      'exercise-bench',
      const UpdateExerciseData(notes: OptionalField<String?>(null)),
    );
    final unchanged = await repository.update(
      'exercise-bench',
      const UpdateExerciseData(),
    );

    expect(renamed?.name, 'Flat Bench Press');
    expect(cleared?.notes, isNull);
    expect(unchanged?.name, 'Flat Bench Press');
    expect(unchanged?.updatedAt, DateTime.utc(2026, 5, 30, 12));
  });

  test(
    'toggleFavorite addMuscle removeMuscle and delete mutate safely',
    () async {
      final favorited = await repository.toggleFavorite('exercise-bench');
      await repository.addMuscle(
        'exercise-bench',
        'muscle-back',
        MuscleRole.secondary,
      );
      await repository.removeMuscle('exercise-bench', 'muscle-back');

      expect(favorited?.isFavorite, isTrue);
      expect(
        (await repository.getMuscles(
          'exercise-bench',
        )).map((group) => group.name),
        <String>['Chest'],
      );

      await repository.delete('exercise-bench');

      expect(await repository.getById('exercise-bench'), isNull);
      expect(await countRows('exercise_muscles'), 2);
    },
  );

  test(
    'addMuscle and removeMuscle preserve exactly one primary muscle',
    () async {
      await expectLater(
        repository.addMuscle(
          'exercise-bench',
          'muscle-back',
          MuscleRole.primary,
        ),
        throwsStateError,
      );

      await expectLater(
        repository.removeMuscle('exercise-bench', 'muscle-chest'),
        throwsStateError,
      );
    },
  );
}
