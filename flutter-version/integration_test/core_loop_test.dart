import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:zenlift/core/date/zenlift_clock.dart';
import 'package:zenlift/core/uuid/id_generator.dart';
import 'package:zenlift/features/routines/data/drift_routine_repository.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';
import 'package:zenlift/features/workout/data/drift_workout_repository.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/domain/workout_repository.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('core loop persists routine workout set history and progress', (
    tester,
  ) async {
    final database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    addTearDown(database.close);

    await _seedExercise(database);

    final routineRepository = DriftRoutineRepository(
      database,
      SequenceIdGenerator([
        'routine-core',
        'day-core',
        'routine-exercise-core',
      ]),
      FixedZenliftClock(DateTime.utc(2026, 5, 30, 10)),
    );
    final workoutRepository = DriftWorkoutRepository(
      database,
      SequenceIdGenerator([
        'session-core',
        'workout-exercise-core',
        'set-core',
        'pr-core',
      ]),
      FixedZenliftClock(DateTime.utc(2026, 5, 30, 11)),
    );

    final routine = await routineRepository.saveDraft(
      const RoutineDraft(
        name: 'Push A',
        goal: 'Strength',
        days: [
          RoutineDayDraft(
            name: 'Chest',
            exercises: [
              RoutineExerciseDraft(
                exerciseId: 'exercise-bench',
                targetSets: 3,
                targetRepsMin: 5,
                targetRepsMax: 8,
              ),
            ],
          ),
        ],
      ),
    );

    expect(routine.routine.id, 'routine-core');
    expect(routine.days.single.exercises.single.exercise.name, 'Bench Press');

    final session = await workoutRepository.createSession(
      CreateWorkoutSessionData(
        name: routine.routine.name,
        routineId: routine.routine.id,
        routineDayId: routine.days.single.day.id,
      ),
    );
    expect(session.status, WorkoutStatus.active);
    expect((await workoutRepository.getActiveSession())?.id, session.id);

    final workoutExercises = await workoutRepository
        .addRoutineDayExercisesToSession(
          session.id,
          routine.days.single.day.id,
        );
    expect(workoutExercises.single.exerciseId, 'exercise-bench');

    final set = await workoutRepository.addSet(
      workoutExercises.single.id,
      const AddSetData(weight: 100, reps: 5),
    );
    await workoutRepository.completeSet(set.id);
    await workoutRepository.addPR(
      AddPersonalRecordData(
        exerciseId: 'exercise-bench',
        workoutSessionId: session.id,
        type: PersonalRecordType.maxWeight,
        value: 100,
        weight: 100,
        reps: 5,
      ),
    );
    await workoutRepository.completeSession(session.id);

    final history = await workoutRepository.getHistory();
    final completed = await workoutRepository.getFullSession(session.id);
    final prs = await workoutRepository.getPRsBySession(session.id);
    final previousPerformance = await workoutRepository.getPreviousPerformance(
      'exercise-bench',
    );

    expect(history.single.id, session.id);
    expect(completed?.session.status, WorkoutStatus.completed);
    expect(completed?.exercises.single.sets.single.isCompleted, isTrue);
    expect(prs.single.value, 100);
    expect(previousPerformance.single.weight, 100);
  });
}

Future<void> _seedExercise(AppDatabase database) async {
  await database
      .into(database.muscleGroups)
      .insert(
        MuscleGroupsCompanion.insert(
          id: 'muscle-chest',
          name: 'chest',
          displayNameEs: 'Pecho',
          color: '#EF4444',
        ),
      );
  await database
      .into(database.exercises)
      .insert(
        ExercisesCompanion.insert(
          id: 'exercise-bench',
          name: 'Bench Press',
          equipment: 'Barbell',
          category: 'Strength',
        ),
      );
  await database
      .into(database.exerciseMuscles)
      .insert(
        ExerciseMusclesCompanion.insert(
          id: 'exercise-bench-primary',
          exerciseId: 'exercise-bench',
          muscleGroupId: 'muscle-chest',
          role: 'primary',
        ),
      );
}
