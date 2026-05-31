import '../domain/exercise.dart';
import '../domain/exercise_library.dart';
import '../domain/exercise_repository.dart';

class ExerciseLibraryController {
  ExerciseLibraryController({
    required this.exerciseRepository,
    required this.muscleGroupRepository,
  });

  final ExerciseRepository exerciseRepository;
  final MuscleGroupRepository muscleGroupRepository;

  Future<ExerciseLibraryState> load({
    String query = '',
    Set<String> muscleIds = const <String>{},
    String? equipment,
  }) async {
    try {
      final trimmedQuery = query.trim();
      var exercises = trimmedQuery.isEmpty
          ? await exerciseRepository.getAll()
          : await exerciseRepository.search(trimmedQuery);

      if (muscleIds.isNotEmpty) {
        final matches = <String, ExerciseEntity>{};
        for (final muscleId in muscleIds) {
          for (final exercise in await exerciseRepository.getByMuscle(
            muscleId,
          )) {
            matches[exercise.id] = exercise;
          }
        }
        exercises = exercises
            .where((exercise) => matches.containsKey(exercise.id))
            .toList();
      }

      if (equipment != null) {
        final equipmentMatches = {
          for (final exercise in await exerciseRepository.getByEquipment(
            equipment,
          ))
            exercise.id,
        };
        exercises = exercises
            .where((exercise) => equipmentMatches.contains(exercise.id))
            .toList();
      }

      final muscleGroups = await muscleGroupRepository.getAll();
      final items = <ExerciseLibraryItem>[];
      for (final exercise in exercises) {
        final muscles = await exerciseRepository.getMuscles(exercise.id);
        items.add(
          ExerciseLibraryItem(
            exercise: exercise,
            primaryMuscle: muscles.firstOrNull,
          ),
        );
      }

      return ExerciseLibraryState(
        exercises: List<ExerciseLibraryItem>.unmodifiable(items),
        muscleGroups: List<MuscleGroupEntity>.unmodifiable(muscleGroups),
      );
    } catch (error) {
      return const ExerciseLibraryState(
        exercises: <ExerciseLibraryItem>[],
        muscleGroups: <MuscleGroupEntity>[],
        errorMessage: 'Could not load exercises.',
      );
    }
  }

  Future<ExerciseEntity?> toggleFavorite(String exerciseId) {
    return exerciseRepository.toggleFavorite(exerciseId);
  }
}
