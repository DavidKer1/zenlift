enum WorkoutSetType {
  normal('normal'),
  warmup('warmup'),
  drop('drop'),
  failure('failure'),
  amrap('amrap');

  const WorkoutSetType(this.value);

  final String value;

  static WorkoutSetType fromText(String value) {
    return switch (value) {
      'warmup' => WorkoutSetType.warmup,
      'drop' => WorkoutSetType.drop,
      'failure' => WorkoutSetType.failure,
      'amrap' => WorkoutSetType.amrap,
      _ => WorkoutSetType.normal,
    };
  }
}

final class WorkoutSet {
  const WorkoutSet({
    required this.id,
    required this.weight,
    required this.reps,
    required this.isCompleted,
    this.setType = WorkoutSetType.normal,
    this.completedAt,
  });

  final String id;
  final double weight;
  final int reps;
  final bool isCompleted;
  final WorkoutSetType setType;
  final DateTime? completedAt;

  bool get contributesToCalculations {
    return isCompleted && setType != WorkoutSetType.warmup;
  }
}

final class WorkoutExercise {
  const WorkoutExercise({
    required this.id,
    required this.exerciseId,
    required this.sets,
  });

  final String id;
  final String exerciseId;
  final List<WorkoutSet> sets;
}
