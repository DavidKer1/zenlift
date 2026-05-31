import '../../../core/optional_field.dart';
import 'entities/workout_repository_entities.dart';

class CreateWorkoutSessionData {
  const CreateWorkoutSessionData({
    this.id,
    this.name,
    this.routineId,
    this.routineDayId,
  });

  final String? id;
  final String? name;
  final String? routineId;
  final String? routineDayId;
}

class AddSetData {
  const AddSetData({
    required this.weight,
    required this.reps,
    this.setType = SetType.normal,
    this.notes,
  });

  final double weight;
  final int reps;
  final SetType setType;
  final String? notes;
}

class UpdateSetData {
  const UpdateSetData({this.weight, this.reps, this.setType, this.notes});

  final double? weight;
  final int? reps;
  final SetType? setType;
  final OptionalField<String?>? notes;

  bool get isEmpty =>
      weight == null && reps == null && setType == null && notes == null;
}

class AddPersonalRecordData {
  const AddPersonalRecordData({
    required this.exerciseId,
    required this.workoutSessionId,
    required this.type,
    required this.value,
    this.weight,
    this.reps,
  });

  final String exerciseId;
  final String workoutSessionId;
  final PersonalRecordType type;
  final double value;
  final double? weight;
  final int? reps;
}

abstract interface class WorkoutRepository {
  Future<WorkoutSessionEntity> createSession(CreateWorkoutSessionData data);
  Future<WorkoutSessionEntity?> getSession(String id);
  Future<WorkoutSessionEntity?> getActiveSession();
  Future<List<WorkoutSessionEntity>> getHistory({
    int limit = 20,
    int offset = 0,
  });
  Future<List<WorkoutSessionEntity>> getHistoryByRoutine(String routineId);
  Future<FullWorkoutSession?> getFullSession(String id);
  Future<void> completeSession(String id);
  Future<void> cancelSession(String id);
  Future<void> updateSessionNotes(String sessionId, String notes);
  Future<void> deleteSession(String id);
  Future<WorkoutExerciseEntity> addExercise(
    String sessionId,
    String exerciseId,
  );
  Future<List<WorkoutExerciseEntity>> addRoutineDayExercisesToSession(
    String sessionId,
    String routineDayId,
  );
  Future<List<WorkoutExerciseEntity>> getExercises(String sessionId);
  Future<void> removeExercise(String id);
  Future<SetLogEntity> addSet(String workoutExerciseId, AddSetData data);
  Future<void> completeSet(String id);
  Future<void> uncompleteSet(String id);
  Future<void> updateSet(String id, UpdateSetData data);
  Future<void> deleteSet(String id);
  Future<List<SetLogEntity>> getSets(String workoutExerciseId);
  Future<List<PreviousPerformance>> getPreviousPerformance(
    String exerciseId, {
    int limit = 5,
  });
  Future<({double weight, int reps})?> getLastWorkoutExerciseData(
    String exerciseId,
  );
  Future<PersonalRecordEntity> addPR(AddPersonalRecordData data);
  Future<List<PersonalRecordEntity>> getPRsByExercise(String exerciseId);
  Future<List<PersonalRecordEntity>> getPRsBySession(String sessionId);
  Future<List<PersonalRecordEntity>> getLatestPRs({int limit = 10});
}
