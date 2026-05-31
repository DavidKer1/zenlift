import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/core/date/zenlift_clock.dart';
import 'package:zenlift/core/optional_field.dart';
import 'package:zenlift/core/uuid/id_generator.dart';
import 'package:zenlift/features/workout/data/drift_workout_repository.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/domain/workout_repository.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  late AppDatabase database;
  late DriftWorkoutRepository repository;

  Future<int> countRows(String tableName) async {
    final row = await database
        .customSelect('SELECT COUNT(*) AS count FROM $tableName')
        .getSingle();
    return row.read<int>('count');
  }

  setUp(() async {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    repository = DriftWorkoutRepository(
      database,
      SequenceIdGenerator([
        'session-new',
        'workout-exercise-new',
        'set-new-1',
        'set-new-2',
        'personal-record-new',
        'routine-day-exercise-1',
        'routine-day-exercise-2',
      ]),
      FixedZenliftClock(DateTime.utc(2026, 5, 30, 13)),
    );

    await database
        .into(database.muscleGroups)
        .insert(
          MuscleGroupsCompanion.insert(
            id: 'muscle-chest',
            name: 'Chest',
            displayNameEs: 'Pecho',
            color: '#FFFFFF',
          ),
        );
    await database
        .into(database.exercises)
        .insert(
          ExercisesCompanion.insert(
            id: 'exercise-bench',
            name: 'Bench Press',
            equipment: 'Barbell',
            category: 'Chest',
          ),
        );
    await database
        .into(database.exercises)
        .insert(
          ExercisesCompanion.insert(
            id: 'exercise-row',
            name: 'Barbell Row',
            equipment: 'Barbell',
            category: 'Back',
          ),
        );
    await database
        .into(database.routines)
        .insert(RoutinesCompanion.insert(id: 'routine-a', name: 'Push'));
    await database
        .into(database.routineDays)
        .insert(
          RoutineDaysCompanion.insert(
            id: 'routine-day-a',
            routineId: 'routine-a',
            name: 'Chest Day',
          ),
        );
    await database
        .into(database.routineExercises)
        .insert(
          RoutineExercisesCompanion.insert(
            id: 'routine-exercise-a',
            routineDayId: 'routine-day-a',
            exerciseId: 'exercise-bench',
            sortOrder: const Value(0),
          ),
        );
    await database
        .into(database.routineExercises)
        .insert(
          RoutineExercisesCompanion.insert(
            id: 'routine-exercise-b',
            routineDayId: 'routine-day-a',
            exerciseId: 'exercise-row',
            sortOrder: const Value(1),
          ),
        );
  });

  tearDown(() async {
    await database.close();
  });

  test('creates completes cancels and queries workout sessions', () async {
    final session = await repository.createSession(
      const CreateWorkoutSessionData(
        name: 'Push',
        routineId: 'routine-a',
        routineDayId: 'routine-day-a',
      ),
    );

    expect(session.id, 'session-new');
    expect(session.status, WorkoutStatus.active);
    expect((await repository.getActiveSession())?.id, 'session-new');

    await repository.completeSession(session.id);

    final completed = await repository.getSession(session.id);
    expect(completed?.status, WorkoutStatus.completed);
    expect(completed?.durationSeconds, 0);
    expect((await repository.getHistory()).single.id, session.id);
    expect(
      (await repository.getHistoryByRoutine('routine-a')).single.id,
      session.id,
    );

    await repository.cancelSession(session.id);
    expect(
      (await repository.getSession(session.id))?.status,
      WorkoutStatus.cancelled,
    );
  });

  test('adds exercises and sets, then returns full session tree', () async {
    final session = await repository.createSession(
      const CreateWorkoutSessionData(
        routineId: 'routine-a',
        routineDayId: 'routine-day-a',
      ),
    );
    final workoutExercise = await repository.addExercise(
      session.id,
      'exercise-bench',
    );
    final firstSet = await repository.addSet(
      workoutExercise.id,
      const AddSetData(weight: 100, reps: 5, notes: 'Good'),
    );
    await repository.completeSet(firstSet.id);
    await repository.addSet(
      workoutExercise.id,
      const AddSetData(weight: 105, reps: 3, setType: SetType.amrap),
    );
    await repository.updateSet(
      firstSet.id,
      const UpdateSetData(
        weight: 102.5,
        notes: OptionalField<String?>('Better'),
      ),
    );

    final full = await repository.getFullSession(session.id);

    expect(full?.routine?.name, 'Push');
    expect(full?.routineDay?.name, 'Chest Day');
    expect(full?.exercises.single.exercise.name, 'Bench Press');
    expect(full?.exercises.single.sets.map((set) => set.setNumber), <int>[
      1,
      2,
    ]);
    expect(full?.exercises.single.sets.first.isCompleted, isTrue);
    expect(full?.exercises.single.sets.first.weight, 102.5);
    expect(
      (await repository.getSets(workoutExercise.id)).last.setType,
      SetType.amrap,
    );
  });

  test(
    'copies routine day exercises into a session ordered by routine sort',
    () async {
      final session = await repository.createSession(
        const CreateWorkoutSessionData(),
      );

      final created = await repository.addRoutineDayExercisesToSession(
        session.id,
        'routine-day-a',
      );

      expect(created.map((exercise) => exercise.id), <String>[
        'workout-exercise-new',
        'set-new-1',
      ]);
      expect(created.map((exercise) => exercise.sortOrder), <int>[0, 1]);
    },
  );

  test(
    'previous performance, last set, PRs and cascades work on SQLite',
    () async {
      final session = await repository.createSession(
        const CreateWorkoutSessionData(),
      );
      final workoutExercise = await repository.addExercise(
        session.id,
        'exercise-bench',
      );
      final set = await repository.addSet(
        workoutExercise.id,
        const AddSetData(weight: 120, reps: 3),
      );
      await repository.completeSet(set.id);
      await repository.completeSession(session.id);
      final pr = await repository.addPR(
        AddPersonalRecordData(
          exerciseId: 'exercise-bench',
          workoutSessionId: session.id,
          type: PersonalRecordType.maxWeight,
          value: 120,
          weight: 120,
          reps: 3,
        ),
      );

      expect(
        (await repository.getPreviousPerformance(
          'exercise-bench',
        )).single.weight,
        120,
      );
      expect(
        (await repository.getLastWorkoutExerciseData('exercise-bench'))?.reps,
        3,
      );
      expect(
        (await repository.getPRsByExercise('exercise-bench')).single.id,
        pr.id,
      );
      expect((await repository.getPRsBySession(session.id)).single.id, pr.id);
      expect((await repository.getLatestPRs()).single.id, pr.id);

      await repository.deleteSession(session.id);

      expect(await countRows('workout_sessions'), 0);
      expect(await countRows('workout_exercises'), 0);
      expect(await countRows('set_logs'), 0);
    },
  );

  test(
    'removeExercise and deleteSet cascade or remove expected rows',
    () async {
      final session = await repository.createSession(
        const CreateWorkoutSessionData(),
      );
      final workoutExercise = await repository.addExercise(
        session.id,
        'exercise-bench',
      );
      final set = await repository.addSet(
        workoutExercise.id,
        const AddSetData(weight: 1, reps: 1),
      );

      await repository.deleteSet(set.id);
      expect(await countRows('set_logs'), 0);

      await repository.addSet(
        workoutExercise.id,
        const AddSetData(weight: 1, reps: 1),
      );
      await repository.removeExercise(workoutExercise.id);
      expect(await countRows('workout_exercises'), 0);
      expect(await countRows('set_logs'), 0);
    },
  );
}
