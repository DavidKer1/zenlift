import '../../workout/domain/entities/workout_repository_entities.dart';
import 'exercise.dart';

class ExerciseDetailState {
  const ExerciseDetailState({
    required this.exercise,
    required this.muscles,
    required this.bestPerformance,
    required this.history,
    required this.personalRecords,
    this.errorMessage,
  });

  final ExerciseEntity? exercise;
  final List<MuscleGroupEntity> muscles;
  final ExerciseBestPerformance bestPerformance;
  final List<ExerciseHistoryItem> history;
  final List<PersonalRecordEntity> personalRecords;
  final String? errorMessage;

  bool get hasExercise => exercise != null;
  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;

  static const empty = ExerciseDetailState(
    exercise: null,
    muscles: <MuscleGroupEntity>[],
    bestPerformance: ExerciseBestPerformance.empty,
    history: <ExerciseHistoryItem>[],
    personalRecords: <PersonalRecordEntity>[],
  );
}

class ExerciseBestPerformance {
  const ExerciseBestPerformance({
    required this.maxWeight,
    required this.bestEstimatedOneRepMax,
    required this.maxVolume,
  });

  final double maxWeight;
  final double bestEstimatedOneRepMax;
  final double maxVolume;

  static const empty = ExerciseBestPerformance(
    maxWeight: 0,
    bestEstimatedOneRepMax: 0,
    maxVolume: 0,
  );
}

class ExerciseHistoryItem {
  const ExerciseHistoryItem({
    required this.startedAt,
    required this.weight,
    required this.reps,
    required this.volume,
  });

  final DateTime startedAt;
  final double weight;
  final int reps;
  final double volume;
}
