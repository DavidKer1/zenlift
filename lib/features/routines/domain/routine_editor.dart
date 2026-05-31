import '../../exercises/domain/exercise.dart';
import 'routine_repository.dart';

enum RoutineEditorMode { create, edit }

class RoutineEditorState {
  const RoutineEditorState({
    required this.mode,
    required this.draft,
    required this.exerciseOptions,
    this.errorMessage,
  });

  final RoutineEditorMode mode;
  final RoutineDraft draft;
  final List<ExerciseEntity> exerciseOptions;
  final String? errorMessage;

  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;

  static const createEmpty = RoutineEditorState(
    mode: RoutineEditorMode.create,
    draft: RoutineDraft(name: '', days: <RoutineDayDraft>[]),
    exerciseOptions: <ExerciseEntity>[],
  );

  RoutineEditorState copyWith({
    RoutineDraft? draft,
    List<ExerciseEntity>? exerciseOptions,
    String? errorMessage,
    bool clearError = false,
  }) {
    return RoutineEditorState(
      mode: mode,
      draft: draft ?? this.draft,
      exerciseOptions: exerciseOptions ?? this.exerciseOptions,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}

class RoutineEditorValidationResult {
  const RoutineEditorValidationResult(this.messages);

  final List<String> messages;

  bool get isValid => messages.isEmpty;
}
