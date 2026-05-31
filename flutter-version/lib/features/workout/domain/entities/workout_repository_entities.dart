import '../../../exercises/domain/exercise.dart';
import '../../../routines/domain/routine.dart';

enum WorkoutStatus {
  active('active'),
  completed('completed'),
  cancelled('cancelled');

  const WorkoutStatus(this.value);

  final String value;

  static WorkoutStatus fromStorage(String value) => switch (value) {
    'active' => WorkoutStatus.active,
    'completed' => WorkoutStatus.completed,
    'cancelled' => WorkoutStatus.cancelled,
    _ => throw ArgumentError.value(
      value,
      'value',
      'Unsupported workout status',
    ),
  };
}

enum SetType {
  normal('normal'),
  warmup('warmup'),
  drop('drop'),
  failure('failure'),
  amrap('amrap');

  const SetType(this.value);

  final String value;

  static SetType fromStorage(String value) => switch (value) {
    'normal' => SetType.normal,
    'warmup' => SetType.warmup,
    'drop' => SetType.drop,
    'failure' => SetType.failure,
    'amrap' => SetType.amrap,
    _ => throw ArgumentError.value(value, 'value', 'Unsupported set type'),
  };
}

enum PersonalRecordType {
  maxWeight('max_weight'),
  maxVolume('max_volume'),
  maxReps('max_reps'),
  estimatedOneRepMax('estimated_1rm'),
  maxSessionVolume('max_session_volume');

  const PersonalRecordType(this.value);

  final String value;

  static PersonalRecordType fromStorage(String value) => switch (value) {
    'max_weight' => PersonalRecordType.maxWeight,
    'max_volume' => PersonalRecordType.maxVolume,
    'max_reps' => PersonalRecordType.maxReps,
    'estimated_1rm' => PersonalRecordType.estimatedOneRepMax,
    'max_session_volume' => PersonalRecordType.maxSessionVolume,
    _ => throw ArgumentError.value(
      value,
      'value',
      'Unsupported personal record type',
    ),
  };
}

class WorkoutSessionEntity {
  const WorkoutSessionEntity({
    required this.id,
    required this.routineId,
    required this.routineDayId,
    required this.name,
    required this.startedAt,
    required this.endedAt,
    required this.durationSeconds,
    required this.status,
    required this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String? routineId;
  final String? routineDayId;
  final String? name;
  final DateTime startedAt;
  final DateTime? endedAt;
  final int? durationSeconds;
  final WorkoutStatus status;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;
}

class WorkoutExerciseEntity {
  const WorkoutExerciseEntity({
    required this.id,
    required this.workoutSessionId,
    required this.exerciseId,
    required this.sortOrder,
    required this.notes,
  });

  final String id;
  final String workoutSessionId;
  final String exerciseId;
  final int sortOrder;
  final String? notes;
}

class SetLogEntity {
  const SetLogEntity({
    required this.id,
    required this.workoutExerciseId,
    required this.setNumber,
    required this.weight,
    required this.reps,
    required this.setType,
    required this.isCompleted,
    required this.completedAt,
    required this.notes,
  });

  final String id;
  final String workoutExerciseId;
  final int setNumber;
  final double weight;
  final int reps;
  final SetType setType;
  final bool isCompleted;
  final DateTime? completedAt;
  final String? notes;
}

class PersonalRecordEntity {
  const PersonalRecordEntity({
    required this.id,
    required this.exerciseId,
    required this.workoutSessionId,
    required this.type,
    required this.value,
    required this.weight,
    required this.reps,
    required this.achievedAt,
  });

  final String id;
  final String exerciseId;
  final String workoutSessionId;
  final PersonalRecordType type;
  final double value;
  final double? weight;
  final int? reps;
  final DateTime achievedAt;
}

class WorkoutExerciseWithSets {
  const WorkoutExerciseWithSets({
    required this.workoutExercise,
    required this.exercise,
    required this.sets,
  });

  final WorkoutExerciseEntity workoutExercise;
  final ExerciseEntity exercise;
  final List<SetLogEntity> sets;
}

class FullWorkoutSession {
  const FullWorkoutSession({
    required this.session,
    required this.routine,
    required this.routineDay,
    required this.exercises,
    required this.personalRecords,
  });

  final WorkoutSessionEntity session;
  final RoutineEntity? routine;
  final RoutineDayEntity? routineDay;
  final List<WorkoutExerciseWithSets> exercises;
  final List<PersonalRecordEntity> personalRecords;
}

class PreviousPerformance {
  const PreviousPerformance({
    required this.startedAt,
    required this.weight,
    required this.reps,
    required this.setType,
  });

  final DateTime startedAt;
  final double weight;
  final int reps;
  final SetType setType;
}
