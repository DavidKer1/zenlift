enum MuscleRole {
  primary('primary'),
  secondary('secondary');

  const MuscleRole(this.value);

  final String value;

  static MuscleRole fromStorage(String value) => switch (value) {
    'primary' => MuscleRole.primary,
    'secondary' => MuscleRole.secondary,
    _ => throw ArgumentError.value(value, 'value', 'Unsupported muscle role'),
  };
}

class MuscleGroupEntity {
  const MuscleGroupEntity({
    required this.id,
    required this.name,
    required this.displayNameEs,
    required this.color,
  });

  final String id;
  final String name;
  final String displayNameEs;
  final String color;
}

class ExerciseEntity {
  const ExerciseEntity({
    required this.id,
    required this.name,
    required this.equipment,
    required this.category,
    required this.isCustom,
    required this.isFavorite,
    required this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String name;
  final String equipment;
  final String category;
  final bool isCustom;
  final bool isFavorite;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;
}

class ExerciseMuscleEntity {
  const ExerciseMuscleEntity({
    required this.id,
    required this.exerciseId,
    required this.muscleGroupId,
    required this.role,
  });

  final String id;
  final String exerciseId;
  final String muscleGroupId;
  final MuscleRole role;
}

class ExerciseMuscleWithGroup {
  const ExerciseMuscleWithGroup({
    required this.exerciseMuscle,
    required this.muscleGroup,
  });

  final ExerciseMuscleEntity exerciseMuscle;
  final MuscleGroupEntity muscleGroup;
}

class ExerciseWithMuscles {
  const ExerciseWithMuscles({required this.exercise, required this.muscles});

  final ExerciseEntity exercise;
  final List<ExerciseMuscleWithGroup> muscles;
}
