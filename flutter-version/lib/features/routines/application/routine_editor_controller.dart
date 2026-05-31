import '../../exercises/domain/exercise_repository.dart';
import '../domain/routine.dart';
import '../domain/routine_editor.dart';
import '../domain/routine_repository.dart';

class RoutineEditorController {
  const RoutineEditorController({
    required this.routineRepository,
    required this.exerciseRepository,
  });

  final RoutineRepository routineRepository;
  final ExerciseRepository exerciseRepository;

  Future<RoutineEditorState> loadCreate() async {
    return RoutineEditorState(
      mode: RoutineEditorMode.create,
      draft: const RoutineDraft(name: '', days: <RoutineDayDraft>[]),
      exerciseOptions: await exerciseRepository.getAll(),
    );
  }

  Future<RoutineEditorState> loadEdit(String routineId) async {
    final routine = await routineRepository.getFullRoutine(routineId);
    if (routine == null) {
      return RoutineEditorState(
        mode: RoutineEditorMode.edit,
        draft: RoutineDraft(id: routineId, name: '', days: const []),
        exerciseOptions: await exerciseRepository.getAll(),
        errorMessage: 'Routine not found.',
      );
    }
    return RoutineEditorState(
      mode: RoutineEditorMode.edit,
      draft: _draftFromRoutine(routine),
      exerciseOptions: await exerciseRepository.getAll(),
    );
  }

  Future<FullRoutine> save(RoutineDraft draft) async {
    final validation = validate(draft);
    if (!validation.isValid) {
      throw RoutineEditorValidationException(validation.messages);
    }
    return routineRepository.saveDraft(_normalizedDraft(draft));
  }

  RoutineEditorValidationResult validate(RoutineDraft draft) {
    final messages = <String>[];
    if (draft.name.trim().isEmpty) {
      messages.add('El nombre es obligatorio');
    }
    if (draft.days.isEmpty) {
      messages.add('La rutina necesita al menos 1 día');
    }
    for (final day in draft.days) {
      if (day.exercises.isEmpty) {
        messages.add('Cada día necesita al menos 1 ejercicio');
      }
      for (final exercise in day.exercises) {
        final targetSets = exercise.targetSets;
        if (targetSets != null && targetSets < 1) {
          messages.add('Mínimo 1 serie');
        }
      }
    }
    return RoutineEditorValidationResult(messages.toSet().toList());
  }

  RoutineDraft _draftFromRoutine(FullRoutine routine) {
    return RoutineDraft(
      id: routine.routine.id,
      name: routine.routine.name,
      description: routine.routine.description,
      goal: routine.routine.goal,
      days: [
        for (final day in routine.days)
          RoutineDayDraft(
            id: day.day.id,
            name: day.day.name,
            dayOfWeek: day.day.dayOfWeek,
            exercises: [
              for (final exercise in day.exercises)
                RoutineExerciseDraft(
                  id: exercise.routineExercise.id,
                  exerciseId: exercise.routineExercise.exerciseId,
                  targetSets: exercise.routineExercise.targetSets,
                  targetRepsMin: exercise.routineExercise.targetRepsMin,
                  targetRepsMax: exercise.routineExercise.targetRepsMax,
                  notes: exercise.routineExercise.notes,
                ),
            ],
          ),
      ],
    );
  }

  RoutineDraft _normalizedDraft(RoutineDraft draft) {
    return RoutineDraft(
      id: draft.id,
      name: draft.name.trim(),
      description: _nullIfBlank(draft.description),
      goal: _nullIfBlank(draft.goal),
      days: [
        for (final day in draft.days)
          RoutineDayDraft(
            id: day.id,
            name: day.name.trim().isEmpty ? 'Día' : day.name.trim(),
            dayOfWeek: day.dayOfWeek,
            exercises: [
              for (final exercise in day.exercises)
                RoutineExerciseDraft(
                  id: exercise.id,
                  exerciseId: exercise.exerciseId,
                  targetSets: exercise.targetSets,
                  targetRepsMin: exercise.targetRepsMin,
                  targetRepsMax: exercise.targetRepsMax,
                  notes: _nullIfBlank(exercise.notes),
                ),
            ],
          ),
      ],
    );
  }

  String? _nullIfBlank(String? value) {
    final trimmed = value?.trim();
    return trimmed == null || trimmed.isEmpty ? null : trimmed;
  }
}

class RoutineEditorValidationException implements Exception {
  const RoutineEditorValidationException(this.messages);

  final List<String> messages;

  @override
  String toString() => messages.join('\n');
}
