import 'exercise.dart';

enum ExerciseFormMode { create, edit }

const exerciseEquipmentOptions = <ExerciseOption>[
  ExerciseOption(value: 'barbell', label: 'Barra'),
  ExerciseOption(value: 'dumbbell', label: 'Mancuernas'),
  ExerciseOption(value: 'machine', label: 'Máquina'),
  ExerciseOption(value: 'cable', label: 'Cable'),
  ExerciseOption(value: 'bodyweight', label: 'Peso corporal'),
  ExerciseOption(value: 'kettlebell', label: 'Kettlebell'),
  ExerciseOption(value: 'smith_machine', label: 'Smith'),
  ExerciseOption(value: 'ez_bar', label: 'Barra Z'),
  ExerciseOption(value: 'cardio_machine', label: 'Cardio'),
];

const exerciseCategoryOptions = <ExerciseOption>[
  ExerciseOption(value: 'strength', label: 'Fuerza'),
  ExerciseOption(value: 'cardio', label: 'Cardio'),
  ExerciseOption(value: 'mobility', label: 'Movilidad'),
  ExerciseOption(value: 'core', label: 'Core'),
];

class ExerciseOption {
  const ExerciseOption({required this.value, required this.label});

  final String value;
  final String label;
}

class ExerciseDraft {
  const ExerciseDraft({
    this.id,
    required this.name,
    required this.primaryMuscleGroupId,
    required this.equipment,
    required this.category,
    this.secondaryMuscleGroupIds = const <String>[],
    this.notes,
  });

  final String? id;
  final String name;
  final String primaryMuscleGroupId;
  final String equipment;
  final String category;
  final List<String> secondaryMuscleGroupIds;
  final String? notes;

  ExerciseDraft copyWith({
    String? name,
    String? primaryMuscleGroupId,
    String? equipment,
    String? category,
    List<String>? secondaryMuscleGroupIds,
    String? notes,
  }) {
    return ExerciseDraft(
      id: id,
      name: name ?? this.name,
      primaryMuscleGroupId: primaryMuscleGroupId ?? this.primaryMuscleGroupId,
      equipment: equipment ?? this.equipment,
      category: category ?? this.category,
      secondaryMuscleGroupIds:
          secondaryMuscleGroupIds ?? this.secondaryMuscleGroupIds,
      notes: notes ?? this.notes,
    );
  }

  ExerciseDraft copyWithNotes(String? value) {
    return ExerciseDraft(
      id: id,
      name: name,
      primaryMuscleGroupId: primaryMuscleGroupId,
      equipment: equipment,
      category: category,
      secondaryMuscleGroupIds: secondaryMuscleGroupIds,
      notes: value,
    );
  }
}

class ExerciseFormState {
  const ExerciseFormState({
    required this.mode,
    required this.draft,
    required this.muscleGroups,
    this.errorMessage,
  });

  final ExerciseFormMode mode;
  final ExerciseDraft draft;
  final List<MuscleGroupEntity> muscleGroups;
  final String? errorMessage;

  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;

  static const createEmpty = ExerciseFormState(
    mode: ExerciseFormMode.create,
    draft: ExerciseDraft(
      name: '',
      primaryMuscleGroupId: '',
      equipment: '',
      category: '',
    ),
    muscleGroups: <MuscleGroupEntity>[],
  );
}

class ExerciseFormValidationResult {
  const ExerciseFormValidationResult(this.messages);

  final List<String> messages;
  bool get isValid => messages.isEmpty;
}
