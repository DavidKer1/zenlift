import '../../../storage/drift/app_database.dart' as drift_db;
import '../domain/exercise.dart';

ExerciseEntity exerciseFromRow(drift_db.Exercise row) {
  return ExerciseEntity(
    id: row.id,
    name: row.name,
    equipment: row.equipment,
    category: row.category,
    isCustom: row.isCustom,
    isFavorite: row.isFavorite,
    notes: row.notes,
    createdAt: _parseDate(row.createdAt),
    updatedAt: _parseDate(row.updatedAt),
  );
}

MuscleGroupEntity muscleGroupFromRow(drift_db.MuscleGroup row) {
  return MuscleGroupEntity(
    id: row.id,
    name: row.name,
    displayNameEs: row.displayNameEs,
    color: row.color,
  );
}

ExerciseMuscleEntity exerciseMuscleFromRow(drift_db.ExerciseMuscle row) {
  return ExerciseMuscleEntity(
    id: row.id,
    exerciseId: row.exerciseId,
    muscleGroupId: row.muscleGroupId,
    role: MuscleRole.fromStorage(row.role),
  );
}

String? dateToStorage(DateTime? value) => value?.toUtc().toIso8601String();

DateTime? _parseDate(String? value) {
  if (value == null) {
    return null;
  }
  return DateTime.parse(value).toUtc();
}
