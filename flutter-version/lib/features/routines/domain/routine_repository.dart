import '../../../core/optional_field.dart';
import 'routine.dart';

class CreateRoutineData {
  const CreateRoutineData({
    this.id,
    required this.name,
    this.description,
    this.goal,
  });

  final String? id;
  final String name;
  final String? description;
  final String? goal;
}

class UpdateRoutineData {
  const UpdateRoutineData({
    this.name,
    this.description,
    this.goal,
    this.sortOrder,
  });

  final String? name;
  final OptionalField<String?>? description;
  final OptionalField<String?>? goal;
  final int? sortOrder;

  bool get isEmpty =>
      name == null && description == null && goal == null && sortOrder == null;
}

class CreateRoutineDayData {
  const CreateRoutineDayData({this.id, required this.name, this.dayOfWeek});

  final String? id;
  final String name;
  final int? dayOfWeek;
}

class UpdateRoutineDayData {
  const UpdateRoutineDayData({this.name, this.dayOfWeek, this.sortOrder});

  final String? name;
  final OptionalField<int?>? dayOfWeek;
  final int? sortOrder;

  bool get isEmpty => name == null && dayOfWeek == null && sortOrder == null;
}

class CreateRoutineExerciseData {
  const CreateRoutineExerciseData({
    this.id,
    required this.exerciseId,
    this.targetSets,
    this.targetRepsMin,
    this.targetRepsMax,
    this.notes,
  });

  final String? id;
  final String exerciseId;
  final int? targetSets;
  final int? targetRepsMin;
  final int? targetRepsMax;
  final String? notes;
}

class UpdateRoutineExerciseData {
  const UpdateRoutineExerciseData({
    this.exerciseId,
    this.targetSets,
    this.targetRepsMin,
    this.targetRepsMax,
    this.notes,
    this.sortOrder,
  });

  final String? exerciseId;
  final OptionalField<int?>? targetSets;
  final OptionalField<int?>? targetRepsMin;
  final OptionalField<int?>? targetRepsMax;
  final OptionalField<String?>? notes;
  final int? sortOrder;

  bool get isEmpty =>
      exerciseId == null &&
      targetSets == null &&
      targetRepsMin == null &&
      targetRepsMax == null &&
      notes == null &&
      sortOrder == null;
}

class RoutineDraft {
  const RoutineDraft({
    this.id,
    required this.name,
    this.description,
    this.goal,
    required this.days,
  });

  final String? id;
  final String name;
  final String? description;
  final String? goal;
  final List<RoutineDayDraft> days;
}

class RoutineDayDraft {
  const RoutineDayDraft({
    this.id,
    required this.name,
    this.dayOfWeek,
    required this.exercises,
  });

  final String? id;
  final String name;
  final int? dayOfWeek;
  final List<RoutineExerciseDraft> exercises;
}

class RoutineExerciseDraft {
  const RoutineExerciseDraft({
    this.id,
    required this.exerciseId,
    this.targetSets,
    this.targetRepsMin,
    this.targetRepsMax,
    this.notes,
  });

  final String? id;
  final String exerciseId;
  final int? targetSets;
  final int? targetRepsMin;
  final int? targetRepsMax;
  final String? notes;
}

abstract interface class RoutineRepository {
  Future<List<RoutineEntity>> getAll({bool includeArchived = false});
  Future<List<RoutineWithCounts>> getAllWithDayCount({
    bool includeArchived = false,
  });
  Future<RoutineEntity?> getById(String id);
  Future<FullRoutine?> getFullRoutine(String id);
  Future<RoutineEntity> create(CreateRoutineData data);
  Future<void> update(String id, UpdateRoutineData updates);
  Future<void> archive(String id);
  Future<void> unarchive(String id);
  Future<void> delete(String id);
  Future<FullRoutine> duplicate(String id, String newName);
  Future<List<RoutineDayEntity>> getDays(String routineId);
  Future<RoutineDayEntity> createDay(
    String routineId,
    CreateRoutineDayData data,
  );
  Future<void> updateDay(String id, UpdateRoutineDayData updates);
  Future<void> deleteDay(String id);
  Future<void> reorderDays(String routineId, List<String> dayIds);
  Future<List<RoutineExerciseWithExercise>> getExercises(String dayId);
  Future<RoutineExerciseEntity> createExercise(
    String dayId,
    CreateRoutineExerciseData data,
  );
  Future<void> updateExercise(String id, UpdateRoutineExerciseData updates);
  Future<void> deleteExercise(String id);
  Future<void> reorderExercises(String dayId, List<String> exerciseIds);
  Future<FullRoutine> saveDraft(RoutineDraft draft);
}
