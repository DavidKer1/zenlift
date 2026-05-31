import '../../exercises/domain/exercise.dart';

class RoutineEntity {
  const RoutineEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.goal,
    required this.isArchived,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String name;
  final String? description;
  final String? goal;
  final bool isArchived;
  final int sortOrder;
  final DateTime? createdAt;
  final DateTime? updatedAt;
}

class RoutineWithCounts {
  const RoutineWithCounts({
    required this.routine,
    required this.dayCount,
    required this.exerciseCount,
  });

  final RoutineEntity routine;
  final int dayCount;
  final int exerciseCount;
}

class RoutineDayEntity {
  const RoutineDayEntity({
    required this.id,
    required this.routineId,
    required this.name,
    required this.dayOfWeek,
    required this.sortOrder,
  });

  final String id;
  final String routineId;
  final String name;
  final int? dayOfWeek;
  final int sortOrder;
}

class RoutineExerciseEntity {
  const RoutineExerciseEntity({
    required this.id,
    required this.routineDayId,
    required this.exerciseId,
    required this.targetSets,
    required this.targetRepsMin,
    required this.targetRepsMax,
    required this.notes,
    required this.sortOrder,
  });

  final String id;
  final String routineDayId;
  final String exerciseId;
  final int? targetSets;
  final int? targetRepsMin;
  final int? targetRepsMax;
  final String? notes;
  final int sortOrder;
}

class RoutineExerciseWithExercise {
  const RoutineExerciseWithExercise({
    required this.routineExercise,
    required this.exercise,
  });

  final RoutineExerciseEntity routineExercise;
  final ExerciseEntity exercise;
}

class FullRoutineDay {
  const FullRoutineDay({required this.day, required this.exercises});

  final RoutineDayEntity day;
  final List<RoutineExerciseWithExercise> exercises;
}

class FullRoutine {
  const FullRoutine({required this.routine, required this.days});

  final RoutineEntity routine;
  final List<FullRoutineDay> days;
}
