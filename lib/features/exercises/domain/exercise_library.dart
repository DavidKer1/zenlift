import 'exercise.dart';

class ExerciseLibraryState {
  const ExerciseLibraryState({
    required this.exercises,
    required this.muscleGroups,
    this.errorMessage,
  });

  final List<ExerciseLibraryItem> exercises;
  final List<MuscleGroupEntity> muscleGroups;
  final String? errorMessage;

  bool get hasError => errorMessage != null;
  bool get isEmpty => exercises.isEmpty;

  static const empty = ExerciseLibraryState(
    exercises: <ExerciseLibraryItem>[],
    muscleGroups: <MuscleGroupEntity>[],
  );
}

class ExerciseLibraryItem {
  const ExerciseLibraryItem({
    required this.exercise,
    required this.primaryMuscle,
  });

  final ExerciseEntity exercise;
  final MuscleGroupEntity? primaryMuscle;
}
