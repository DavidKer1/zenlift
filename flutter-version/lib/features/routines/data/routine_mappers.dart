import '../../../storage/drift/app_database.dart' as drift_db;
import '../domain/routine.dart';

RoutineEntity routineFromRow(drift_db.Routine row) {
  return RoutineEntity(
    id: row.id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    isArchived: row.isArchived,
    sortOrder: row.sortOrder,
    createdAt: _parseDate(row.createdAt),
    updatedAt: _parseDate(row.updatedAt),
  );
}

RoutineDayEntity routineDayFromRow(drift_db.RoutineDay row) {
  return RoutineDayEntity(
    id: row.id,
    routineId: row.routineId,
    name: row.name,
    dayOfWeek: row.dayOfWeek,
    sortOrder: row.sortOrder,
  );
}

RoutineExerciseEntity routineExerciseFromRow(drift_db.RoutineExercise row) {
  return RoutineExerciseEntity(
    id: row.id,
    routineDayId: row.routineDayId,
    exerciseId: row.exerciseId,
    targetSets: row.targetSets,
    targetRepsMin: row.targetRepsMin,
    targetRepsMax: row.targetRepsMax,
    notes: row.notes,
    sortOrder: row.sortOrder,
  );
}

String? dateToStorage(DateTime? value) => value?.toUtc().toIso8601String();

DateTime? _parseDate(String? value) {
  if (value == null) {
    return null;
  }
  return DateTime.parse(value).toUtc();
}
