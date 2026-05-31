import '../../../core/optional_field.dart';
import 'exercise.dart';
import 'exercise_form.dart';

class CreateExerciseData {
  const CreateExerciseData({
    this.id,
    required this.name,
    required this.equipment,
    required this.category,
    this.isCustom = false,
    this.isFavorite = false,
    this.notes,
  });

  final String? id;
  final String name;
  final String equipment;
  final String category;
  final bool isCustom;
  final bool isFavorite;
  final String? notes;
}

class UpdateExerciseData {
  const UpdateExerciseData({
    this.name,
    this.equipment,
    this.category,
    this.isCustom,
    this.isFavorite,
    this.notes,
  });

  final String? name;
  final String? equipment;
  final String? category;
  final bool? isCustom;
  final bool? isFavorite;
  final OptionalField<String?>? notes;

  bool get isEmpty =>
      name == null &&
      equipment == null &&
      category == null &&
      isCustom == null &&
      isFavorite == null &&
      notes == null;
}

class MuscleEntry {
  const MuscleEntry({required this.muscleGroupId, required this.role});

  final String muscleGroupId;
  final MuscleRole role;
}

abstract interface class ExerciseRepository {
  Future<List<ExerciseEntity>> getAll();
  Future<ExerciseEntity?> getById(String id);
  Future<List<ExerciseEntity>> getByMuscle(String muscleGroupId);
  Future<List<ExerciseEntity>> getByCategory(String category);
  Future<List<ExerciseEntity>> getByEquipment(String equipment);
  Future<List<ExerciseEntity>> search(String query);
  Future<List<ExerciseEntity>> getFavorites();
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId);
  Future<List<MuscleEntry>> getMuscleEntries(String exerciseId);
  Future<ExerciseEntity> create(
    CreateExerciseData data,
    List<MuscleEntry> muscles,
  );
  Future<ExerciseEntity?> update(String id, UpdateExerciseData updates);
  Future<ExerciseEntity> saveDraft(ExerciseDraft draft);
  Future<void> delete(String id);
  Future<ExerciseEntity?> toggleFavorite(String id);
  Future<void> addMuscle(
    String exerciseId,
    String muscleGroupId,
    MuscleRole role,
  );
  Future<void> removeMuscle(String exerciseId, String muscleGroupId);
}

abstract interface class MuscleGroupRepository {
  Future<List<MuscleGroupEntity>> getAll();
  Future<MuscleGroupEntity?> getById(String id);
}
