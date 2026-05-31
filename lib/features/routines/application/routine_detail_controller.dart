import '../../exercises/domain/exercise.dart';
import '../../exercises/domain/exercise_repository.dart';
import '../domain/routine.dart';
import '../domain/routine_detail.dart';
import '../domain/routine_repository.dart';

class RoutineDetailController {
  const RoutineDetailController({
    required this.routineRepository,
    required this.exerciseRepository,
  });

  final RoutineRepository routineRepository;
  final ExerciseRepository exerciseRepository;

  Future<RoutineDetailState> load(String routineId) async {
    try {
      final routine = await routineRepository.getFullRoutine(routineId);
      if (routine == null) {
        return const RoutineDetailState(
          routine: null,
          primaryMusclesByExerciseId: <String, MuscleGroupEntity?>{},
          errorMessage: 'Routine not found.',
        );
      }

      return RoutineDetailState(
        routine: routine,
        primaryMusclesByExerciseId: await _loadPrimaryMuscles(routine),
      );
    } catch (error) {
      return const RoutineDetailState(
        routine: null,
        primaryMusclesByExerciseId: <String, MuscleGroupEntity?>{},
        errorMessage: 'Could not load routine.',
      );
    }
  }

  Future<RoutineDetailState> updateName(
    RoutineDetailState current,
    String name,
  ) async {
    final routine = current.routine;
    final trimmed = name.trim();
    if (routine == null || trimmed.isEmpty || trimmed == routine.routine.name) {
      return current;
    }

    final optimisticRoutine = FullRoutine(
      routine: RoutineEntity(
        id: routine.routine.id,
        name: trimmed,
        description: routine.routine.description,
        goal: routine.routine.goal,
        isArchived: routine.routine.isArchived,
        sortOrder: routine.routine.sortOrder,
        createdAt: routine.routine.createdAt,
        updatedAt: routine.routine.updatedAt,
      ),
      days: routine.days,
    );

    try {
      await routineRepository.update(
        routine.routine.id,
        UpdateRoutineData(name: trimmed),
      );
      return current.copyWith(routine: optimisticRoutine, clearError: true);
    } catch (error) {
      return current.copyWith(errorMessage: 'Could not update routine name.');
    }
  }

  Future<RoutineDetailState> duplicate(RoutineDetailState current) async {
    final routine = current.routine;
    if (routine == null) {
      return current;
    }

    try {
      await routineRepository.duplicate(
        routine.routine.id,
        'Copy of ${routine.routine.name}',
      );
      return current.copyWith(clearError: true);
    } catch (error) {
      return current.copyWith(errorMessage: 'Could not duplicate routine.');
    }
  }

  Future<void> archive(String routineId) =>
      routineRepository.archive(routineId);

  Future<void> delete(String routineId) => routineRepository.delete(routineId);

  Future<RoutineDetailState> removeExercise(
    RoutineDetailState current,
    String routineExerciseId,
  ) async {
    final routine = current.routine;
    if (routine == null) {
      return current;
    }

    try {
      await routineRepository.deleteExercise(routineExerciseId);
      return current.copyWith(
        routine: _removeExercise(routine, routineExerciseId),
        clearError: true,
      );
    } catch (error) {
      return current.copyWith(errorMessage: 'Could not remove exercise.');
    }
  }

  Future<RoutineDetailState> moveExercise(
    RoutineDetailState current, {
    required String dayId,
    required String routineExerciseId,
    required int direction,
  }) async {
    final routine = current.routine;
    if (routine == null) {
      return current;
    }

    final day = routine.days.where((item) => item.day.id == dayId).firstOrNull;
    if (day == null) {
      return current;
    }
    final currentIndex = day.exercises.indexWhere(
      (item) => item.routineExercise.id == routineExerciseId,
    );
    final targetIndex = currentIndex + direction;
    if (currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= day.exercises.length) {
      return current;
    }

    final nextExercises = [...day.exercises];
    final moved = nextExercises.removeAt(currentIndex);
    nextExercises.insert(targetIndex, moved);

    try {
      await routineRepository.reorderExercises(
        dayId,
        nextExercises.map((item) => item.routineExercise.id).toList(),
      );
      return current.copyWith(
        routine: _replaceDayExercises(routine, dayId, nextExercises),
        clearError: true,
      );
    } catch (error) {
      return current.copyWith(errorMessage: 'Could not reorder exercises.');
    }
  }

  Future<Map<String, MuscleGroupEntity?>> _loadPrimaryMuscles(
    FullRoutine routine,
  ) async {
    final exerciseIds = {
      for (final day in routine.days)
        for (final exercise in day.exercises) exercise.exercise.id,
    };
    final musclesByExerciseId = <String, MuscleGroupEntity?>{};
    for (final exerciseId in exerciseIds) {
      try {
        final muscles = await exerciseRepository.getMuscles(exerciseId);
        musclesByExerciseId[exerciseId] = muscles.firstOrNull;
      } catch (error) {
        musclesByExerciseId[exerciseId] = null;
      }
    }
    return musclesByExerciseId;
  }

  FullRoutine _removeExercise(FullRoutine routine, String routineExerciseId) {
    return FullRoutine(
      routine: routine.routine,
      days: [
        for (final day in routine.days)
          FullRoutineDay(
            day: day.day,
            exercises: day.exercises
                .where((item) => item.routineExercise.id != routineExerciseId)
                .toList(),
          ),
      ],
    );
  }

  FullRoutine _replaceDayExercises(
    FullRoutine routine,
    String dayId,
    List<RoutineExerciseWithExercise> exercises,
  ) {
    return FullRoutine(
      routine: routine.routine,
      days: [
        for (final day in routine.days)
          if (day.day.id == dayId)
            FullRoutineDay(day: day.day, exercises: exercises)
          else
            day,
      ],
    );
  }
}
