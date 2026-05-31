import '../../../storage/drift/app_database.dart' as drift_db;
import '../domain/entities/workout_repository_entities.dart';

WorkoutSessionEntity workoutSessionFromRow(drift_db.WorkoutSession row) {
  return WorkoutSessionEntity(
    id: row.id,
    routineId: row.routineId,
    routineDayId: row.routineDayId,
    name: row.name,
    startedAt: DateTime.parse(row.startedAt).toUtc(),
    endedAt: _parseDate(row.endedAt),
    durationSeconds: row.durationSeconds,
    status: WorkoutStatus.fromStorage(row.status),
    notes: row.notes,
    createdAt: _parseDate(row.createdAt),
    updatedAt: _parseDate(row.updatedAt),
  );
}

WorkoutExerciseEntity workoutExerciseFromRow(drift_db.WorkoutExercise row) {
  return WorkoutExerciseEntity(
    id: row.id,
    workoutSessionId: row.workoutSessionId,
    exerciseId: row.exerciseId,
    sortOrder: row.sortOrder,
    notes: row.notes,
  );
}

SetLogEntity setLogFromRow(drift_db.SetLog row) {
  return SetLogEntity(
    id: row.id,
    workoutExerciseId: row.workoutExerciseId,
    setNumber: row.setNumber,
    weight: row.weight,
    reps: row.reps,
    setType: SetType.fromStorage(row.setType),
    isCompleted: row.isCompleted,
    completedAt: _parseDate(row.completedAt),
    notes: row.notes,
  );
}

PersonalRecordEntity personalRecordFromRow(drift_db.PersonalRecord row) {
  return PersonalRecordEntity(
    id: row.id,
    exerciseId: row.exerciseId,
    workoutSessionId: row.workoutSessionId,
    type: PersonalRecordType.fromStorage(row.type),
    value: row.value,
    weight: row.weight,
    reps: row.reps,
    achievedAt: DateTime.parse(row.achievedAt).toUtc(),
  );
}

String workoutDateToStorage(DateTime value) => value.toUtc().toIso8601String();

DateTime? _parseDate(String? value) {
  if (value == null) {
    return null;
  }
  return DateTime.parse(value).toUtc();
}
