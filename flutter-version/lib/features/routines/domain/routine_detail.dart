import '../../exercises/domain/exercise.dart';
import 'routine.dart';

class RoutineDetailState {
  const RoutineDetailState({
    required this.routine,
    required this.primaryMusclesByExerciseId,
    this.errorMessage,
  });

  final FullRoutine? routine;
  final Map<String, MuscleGroupEntity?> primaryMusclesByExerciseId;
  final String? errorMessage;

  bool get hasRoutine => routine != null;
  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;

  static const empty = RoutineDetailState(
    routine: null,
    primaryMusclesByExerciseId: <String, MuscleGroupEntity?>{},
  );

  RoutineDetailState copyWith({
    FullRoutine? routine,
    Map<String, MuscleGroupEntity?>? primaryMusclesByExerciseId,
    String? errorMessage,
    bool clearError = false,
  }) {
    return RoutineDetailState(
      routine: routine ?? this.routine,
      primaryMusclesByExerciseId:
          primaryMusclesByExerciseId ?? this.primaryMusclesByExerciseId,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}
