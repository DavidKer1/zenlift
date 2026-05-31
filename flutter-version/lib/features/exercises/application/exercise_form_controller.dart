import '../domain/exercise.dart';
import '../domain/exercise_form.dart';
import '../domain/exercise_repository.dart';

class ExerciseFormValidationException implements Exception {
  const ExerciseFormValidationException(this.messages);

  final List<String> messages;
}

class ExerciseFormController {
  const ExerciseFormController({
    required this.exerciseRepository,
    required this.muscleGroupRepository,
  });

  final ExerciseRepository exerciseRepository;
  final MuscleGroupRepository muscleGroupRepository;

  Future<ExerciseFormState> loadCreate() async {
    try {
      return ExerciseFormState(
        mode: ExerciseFormMode.create,
        draft: ExerciseFormState.createEmpty.draft,
        muscleGroups: await muscleGroupRepository.getAll(),
      );
    } catch (error) {
      return ExerciseFormState(
        mode: ExerciseFormMode.create,
        draft: ExerciseFormState.createEmpty.draft,
        muscleGroups: <MuscleGroupEntity>[],
        errorMessage: 'Could not load exercise form.',
      );
    }
  }

  Future<ExerciseFormState> loadEdit(String exerciseId) async {
    try {
      final muscles = await muscleGroupRepository.getAll();
      final exercise = await exerciseRepository.getById(exerciseId);
      if (exercise == null) {
        return ExerciseFormState(
          mode: ExerciseFormMode.edit,
          draft: ExerciseDraft(
            id: exerciseId,
            name: '',
            primaryMuscleGroupId: '',
            equipment: '',
            category: '',
          ),
          muscleGroups: muscles,
          errorMessage: 'Exercise not found.',
        );
      }

      final entries = await exerciseRepository.getMuscleEntries(exerciseId);
      final primary = entries
          .where((entry) => entry.role == MuscleRole.primary)
          .map((entry) => entry.muscleGroupId)
          .firstOrNull;
      final secondary = entries
          .where((entry) => entry.role == MuscleRole.secondary)
          .map((entry) => entry.muscleGroupId)
          .toList();

      return ExerciseFormState(
        mode: ExerciseFormMode.edit,
        draft: ExerciseDraft(
          id: exercise.id,
          name: exercise.name,
          primaryMuscleGroupId: primary ?? '',
          equipment: exercise.equipment,
          category: exercise.category,
          secondaryMuscleGroupIds: secondary,
          notes: exercise.notes,
        ),
        muscleGroups: muscles,
      );
    } catch (error) {
      return ExerciseFormState(
        mode: ExerciseFormMode.edit,
        draft: ExerciseDraft(
          id: exerciseId,
          name: '',
          primaryMuscleGroupId: '',
          equipment: '',
          category: '',
        ),
        muscleGroups: const <MuscleGroupEntity>[],
        errorMessage: 'Could not load exercise form.',
      );
    }
  }

  ExerciseFormValidationResult validate(ExerciseDraft draft) {
    final messages = <String>[];
    final name = draft.name.trim();
    if (name.isEmpty) {
      messages.add('El nombre es obligatorio');
    } else if (name.length < 2) {
      messages.add('Mínimo 2 caracteres');
    }
    if (draft.primaryMuscleGroupId.isEmpty) {
      messages.add('Selecciona un músculo principal');
    }
    if (draft.equipment.isEmpty) {
      messages.add('Selecciona el equipamiento');
    }
    if (draft.category.isEmpty) {
      messages.add('Selecciona la categoría');
    }
    return ExerciseFormValidationResult(messages);
  }

  Future<ExerciseEntity> save(ExerciseDraft draft) async {
    final validation = validate(draft);
    if (!validation.isValid) {
      throw ExerciseFormValidationException(validation.messages);
    }

    final normalized = _normalize(draft);
    final matches = await exerciseRepository.search(normalized.name);
    final submitted = normalized.name.toLowerCase();
    final duplicate = matches.any(
      (exercise) =>
          exercise.id != normalized.id &&
          exercise.name.trim().toLowerCase() == submitted,
    );
    if (duplicate) {
      throw const ExerciseFormValidationException([
        'Ya existe un ejercicio con este nombre',
      ]);
    }

    return exerciseRepository.saveDraft(normalized);
  }

  ExerciseDraft _normalize(ExerciseDraft draft) {
    final secondary = draft.secondaryMuscleGroupIds
        .where((id) => id != draft.primaryMuscleGroupId)
        .toSet()
        .toList();
    final notes = draft.notes?.trim() ?? '';
    return ExerciseDraft(
      id: draft.id,
      name: draft.name.trim(),
      primaryMuscleGroupId: draft.primaryMuscleGroupId,
      equipment: draft.equipment,
      category: draft.category,
      secondaryMuscleGroupIds: secondary,
      notes: notes.isEmpty ? null : notes,
    );
  }
}
