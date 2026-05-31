import 'package:drift/drift.dart' hide isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/core/date/zenlift_clock.dart';
import 'package:zenlift/core/optional_field.dart';
import 'package:zenlift/core/uuid/id_generator.dart';
import 'package:zenlift/features/routines/data/drift_routine_repository.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  late AppDatabase database;
  late DriftRoutineRepository repository;

  Future<int> countRows(String tableName) async {
    final row = await database
        .customSelect('SELECT COUNT(*) AS count FROM $tableName')
        .getSingle();
    return row.read<int>('count');
  }

  Future<void> insertExercise({
    required String id,
    required String name,
  }) async {
    await database
        .into(database.muscleGroups)
        .insert(
          MuscleGroupsCompanion.insert(
            id: 'muscle-$id',
            name: 'Muscle $id',
            displayNameEs: 'Musculo $id',
            color: '#FFFFFF',
          ),
          mode: InsertMode.insertOrIgnore,
        );
    await database
        .into(database.exercises)
        .insert(
          ExercisesCompanion.insert(
            id: id,
            name: name,
            equipment: 'Barbell',
            category: 'Chest',
          ),
          mode: InsertMode.insertOrIgnore,
        );
  }

  setUp(() async {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    repository = DriftRoutineRepository(
      database,
      SequenceIdGenerator([
        'routine-copy',
        'day-copy-1',
        'day-copy-2',
        'routine-exercise-copy-1',
        'routine-exercise-copy-2',
        'routine-exercise-copy-3',
        'routine-new',
        'day-new',
        'routine-exercise-new',
      ]),
      FixedZenliftClock(DateTime.utc(2026, 5, 30, 12)),
    );

    await insertExercise(id: 'exercise-bench', name: 'Bench Press');
    await insertExercise(id: 'exercise-row', name: 'Barbell Row');

    await database
        .into(database.routines)
        .insert(
          RoutinesCompanion.insert(
            id: 'routine-a',
            name: 'Push',
            description: const Value('Chest and triceps'),
            goal: const Value('Strength'),
            sortOrder: const Value(2),
            createdAt: const Value('2026-01-01T00:00:00.000Z'),
            updatedAt: const Value('2026-01-01T00:00:00.000Z'),
          ),
        );
    await database
        .into(database.routines)
        .insert(
          RoutinesCompanion.insert(
            id: 'routine-archived',
            name: 'Old',
            isArchived: const Value(true),
            sortOrder: const Value(9),
          ),
        );
    await database
        .into(database.routineDays)
        .insert(
          RoutineDaysCompanion.insert(
            id: 'day-a',
            routineId: 'routine-a',
            name: 'Day A',
            dayOfWeek: const Value(1),
            sortOrder: const Value(0),
          ),
        );
    await database
        .into(database.routineDays)
        .insert(
          RoutineDaysCompanion.insert(
            id: 'day-b',
            routineId: 'routine-a',
            name: 'Day B',
            dayOfWeek: const Value(3),
            sortOrder: const Value(1),
          ),
        );
    await database
        .into(database.routineExercises)
        .insert(
          RoutineExercisesCompanion.insert(
            id: 'routine-exercise-a',
            routineDayId: 'day-a',
            exerciseId: 'exercise-bench',
            targetSets: const Value(4),
            targetRepsMin: const Value(8),
            targetRepsMax: const Value(12),
            notes: const Value('Pause reps'),
            sortOrder: const Value(0),
          ),
        );
    await database
        .into(database.routineExercises)
        .insert(
          RoutineExercisesCompanion.insert(
            id: 'routine-exercise-b',
            routineDayId: 'day-a',
            exerciseId: 'exercise-row',
            targetSets: const Value(3),
            targetRepsMin: const Value(6),
            targetRepsMax: const Value(10),
            sortOrder: const Value(1),
          ),
        );
    await database
        .into(database.routineExercises)
        .insert(
          RoutineExercisesCompanion.insert(
            id: 'routine-exercise-c',
            routineDayId: 'day-b',
            exerciseId: 'exercise-row',
            sortOrder: const Value(0),
          ),
        );
  });

  tearDown(() async {
    await database.close();
  });

  test('lists active routines with counts and archive filter', () async {
    final active = await repository.getAll();
    final all = await repository.getAll(includeArchived: true);
    final counts = await repository.getAllWithDayCount();

    expect(active.map((routine) => routine.name), <String>['Push']);
    expect(all.map((routine) => routine.name), <String>['Push', 'Old']);
    expect(counts.single.routine.name, 'Push');
    expect(counts.single.dayCount, 2);
    expect(counts.single.exerciseCount, 3);
  });

  test('getFullRoutine returns nested days and joined exercises', () async {
    final full = await repository.getFullRoutine('routine-a');

    expect(full?.routine.name, 'Push');
    expect(full?.days, hasLength(2));
    expect(full?.days.first.day.name, 'Day A');
    expect(full?.days.first.exercises, hasLength(2));
    expect(full?.days.first.exercises.first.exercise.name, 'Bench Press');
    expect(full?.days.first.exercises.first.routineExercise.targetSets, 4);
    expect(await repository.getFullRoutine('missing'), isNull);
  });

  test(
    'creates and updates routine day and routine exercise records',
    () async {
      final routine = await repository.create(
        const CreateRoutineData(
          id: 'routine-provided',
          name: 'Legs',
          description: 'Lower body',
          goal: 'Hypertrophy',
        ),
      );
      final day = await repository.createDay(
        routine.id,
        const CreateRoutineDayData(id: 'day-provided', name: 'Leg Day'),
      );
      final routineExercise = await repository.createExercise(
        day.id,
        const CreateRoutineExerciseData(
          id: 'routine-exercise-provided',
          exerciseId: 'exercise-row',
          targetSets: 5,
        ),
      );

      await repository.update(
        routine.id,
        const UpdateRoutineData(
          name: 'Legs A',
          description: OptionalField<String?>(null),
        ),
      );
      await repository.updateDay(
        day.id,
        const UpdateRoutineDayData(dayOfWeek: OptionalField<int?>(5)),
      );
      await repository.updateExercise(
        routineExercise.id,
        const UpdateRoutineExerciseData(
          targetRepsMin: OptionalField<int?>(10),
          notes: OptionalField<String?>('Smooth reps'),
        ),
      );

      final updated = await repository.getFullRoutine(routine.id);

      expect(updated?.routine.name, 'Legs A');
      expect(updated?.routine.description, isNull);
      expect(updated?.days.single.day.dayOfWeek, 5);
      expect(
        updated?.days.single.exercises.single.routineExercise.targetRepsMin,
        10,
      );
      expect(
        updated?.days.single.exercises.single.routineExercise.notes,
        'Smooth reps',
      );
    },
  );

  test(
    'archive unarchive and cascade deletes mutate only template tables',
    () async {
      await repository.archive('routine-a');
      expect((await repository.getAll()).map((routine) => routine.id), isEmpty);

      await repository.unarchive('routine-a');
      expect((await repository.getAll()).single.id, 'routine-a');

      await repository.deleteDay('day-b');
      expect(await countRows('routine_exercises'), 2);

      await repository.delete('routine-a');
      expect(await countRows('routines'), 1);
      expect(await countRows('routine_days'), 0);
      expect(await countRows('routine_exercises'), 0);
    },
  );

  test('reorders days and exercises in batches', () async {
    await repository.reorderDays('routine-a', ['day-b', 'day-a']);
    await repository.reorderExercises('day-a', [
      'routine-exercise-b',
      'routine-exercise-a',
    ]);

    expect(
      (await repository.getDays('routine-a')).map((day) => day.id),
      <String>['day-b', 'day-a'],
    );
    expect(
      (await repository.getExercises(
        'day-a',
      )).map((exercise) => exercise.routineExercise.id),
      <String>['routine-exercise-b', 'routine-exercise-a'],
    );
  });

  test('duplicate deep clones the full routine tree with new ids', () async {
    final duplicated = await repository.duplicate('routine-a', 'Push Copy');

    expect(duplicated.routine.id, 'routine-copy');
    expect(duplicated.routine.name, 'Push Copy');
    expect(duplicated.routine.description, 'Chest and triceps');
    expect(duplicated.days.map((day) => day.day.id), <String>[
      'day-copy-1',
      'day-copy-2',
    ]);
    expect(
      duplicated.days.first.exercises.map(
        (exercise) => exercise.routineExercise.id,
      ),
      <String>['routine-exercise-copy-1', 'routine-exercise-copy-2'],
    );
    expect(
      duplicated.days.first.exercises.first.routineExercise.notes,
      'Pause reps',
    );
    expect(duplicated.days.first.exercises.first.exercise.id, 'exercise-bench');
    expect(
      (await repository.getFullRoutine('routine-a'))?.routine.name,
      'Push',
    );
  });

  test('duplicate rolls back when source routine is missing', () async {
    await expectLater(
      repository.duplicate('missing', 'Missing Copy'),
      throwsStateError,
    );

    expect(await repository.getById('routine-copy'), isNull);
  });

  test(
    'saveDraft creates and updates nested routine templates atomically',
    () async {
      final created = await repository.saveDraft(
        const RoutineDraft(
          id: 'routine-draft',
          name: 'Full Body',
          days: [
            RoutineDayDraft(
              id: 'day-draft',
              name: 'Día 1',
              exercises: [
                RoutineExerciseDraft(
                  id: 'routine-exercise-draft',
                  exerciseId: 'exercise-bench',
                  targetSets: 3,
                  targetRepsMin: 8,
                  targetRepsMax: 10,
                ),
              ],
            ),
          ],
        ),
      );

      expect(created.routine.name, 'Full Body');
      expect(created.days.single.day.id, 'day-draft');
      expect(
        created.days.single.exercises.single.routineExercise.targetSets,
        3,
      );

      final updated = await repository.saveDraft(
        const RoutineDraft(
          id: 'routine-draft',
          name: 'Full Body A',
          description: 'Updated template',
          days: [
            RoutineDayDraft(
              id: 'day-draft',
              name: 'Día único',
              exercises: [
                RoutineExerciseDraft(
                  id: 'routine-exercise-draft',
                  exerciseId: 'exercise-row',
                  targetSets: 4,
                ),
              ],
            ),
          ],
        ),
      );

      expect(updated.routine.id, 'routine-draft');
      expect(updated.routine.name, 'Full Body A');
      expect(updated.routine.description, 'Updated template');
      expect(updated.days.single.day.name, 'Día único');
      expect(
        updated.days.single.exercises.single.routineExercise.id,
        'routine-exercise-draft',
      );
      expect(updated.days.single.exercises.single.exercise.id, 'exercise-row');
      expect(
        updated.days.single.exercises.single.routineExercise.targetSets,
        4,
      );
    },
  );
}
