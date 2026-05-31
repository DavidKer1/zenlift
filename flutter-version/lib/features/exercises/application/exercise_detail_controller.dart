import '../../workout/domain/calculations/one_rep_max.dart';
import '../../workout/domain/calculations/volume.dart';
import '../../workout/domain/entities/workout_repository_entities.dart';
import '../../workout/domain/workout_repository.dart';
import '../domain/exercise_detail.dart';
import '../domain/exercise_repository.dart';

class ExerciseDetailController {
  const ExerciseDetailController({
    required this.exerciseRepository,
    required this.workoutRepository,
  });

  final ExerciseRepository exerciseRepository;
  final WorkoutRepository workoutRepository;

  Future<ExerciseDetailState> load(String exerciseId) async {
    try {
      final exercise = await exerciseRepository.getById(exerciseId);
      if (exercise == null) {
        return const ExerciseDetailState(
          exercise: null,
          muscles: [],
          bestPerformance: ExerciseBestPerformance.empty,
          history: [],
          personalRecords: [],
          errorMessage: 'Exercise not found.',
        );
      }

      final muscles = await exerciseRepository.getMuscles(exerciseId);
      final previousSets = await workoutRepository.getPreviousPerformance(
        exerciseId,
        limit: 1000,
      );
      final personalRecords = await workoutRepository.getPRsByExercise(
        exerciseId,
      );

      return ExerciseDetailState(
        exercise: exercise,
        muscles: muscles,
        bestPerformance: _bestPerformance(previousSets),
        history: _history(previousSets),
        personalRecords: personalRecords,
      );
    } catch (error) {
      return const ExerciseDetailState(
        exercise: null,
        muscles: [],
        bestPerformance: ExerciseBestPerformance.empty,
        history: [],
        personalRecords: [],
        errorMessage: 'Could not load exercise.',
      );
    }
  }

  Future<void> delete(String exerciseId) =>
      exerciseRepository.delete(exerciseId);

  ExerciseBestPerformance _bestPerformance(List<PreviousPerformance> sets) {
    var maxWeight = 0.0;
    var bestOneRepMax = 0.0;
    var maxVolume = 0.0;
    for (final set in sets.where((set) => set.setType != SetType.warmup)) {
      final volume = calculateSetVolume(weight: set.weight, reps: set.reps);
      maxWeight = set.weight > maxWeight ? set.weight : maxWeight;
      final estimated = estimateOneRepMax(weight: set.weight, reps: set.reps);
      bestOneRepMax = estimated > bestOneRepMax ? estimated : bestOneRepMax;
      maxVolume = volume > maxVolume ? volume : maxVolume;
    }
    return ExerciseBestPerformance(
      maxWeight: maxWeight,
      bestEstimatedOneRepMax: bestOneRepMax,
      maxVolume: maxVolume,
    );
  }

  List<ExerciseHistoryItem> _history(List<PreviousPerformance> sets) {
    return sets.take(5).map((set) {
      return ExerciseHistoryItem(
        startedAt: set.startedAt,
        weight: set.weight,
        reps: set.reps,
        volume: calculateSetVolume(weight: set.weight, reps: set.reps),
      );
    }).toList();
  }
}
