import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_editor.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';
import 'package:zenlift/features/routines/presentation/routine_editor_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  testWidgets(
    'create mode renders empty defaults and validates required fields',
    (tester) async {
      await tester.pumpRoutineEditor(
        initialState: RoutineEditorState.createEmpty,
      );

      expect(find.text('Create routine'), findsOneWidget);
      expect(find.text('Crear rutina'), findsOneWidget);

      await tester.tap(find.byKey(const Key('routine-editor-submit')));
      await tester.pump();

      expect(find.text('El nombre es obligatorio'), findsOneWidget);
      expect(find.text('La rutina necesita al menos 1 día'), findsOneWidget);
    },
  );

  testWidgets('adds day, selects exercise, and saves draft', (tester) async {
    RoutineDraft? savedDraft;

    await tester.pumpRoutineEditor(
      initialState: _createState(),
      saveDraft: (draft) async {
        savedDraft = draft;
        return _savedRoutine(draft);
      },
    );

    await tester.enterText(
      find.byKey(const Key('routine-editor-name')),
      'Push',
    );
    await tester.tap(find.byKey(const Key('routine-editor-add-day')));
    await tester.pump();
    await tester.tap(
      find.byKey(const Key('routine-editor-day-0-add-exercise')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byType(ListTile).last);
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.byKey(const Key('routine-editor-submit')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.byKey(const Key('routine-editor-submit')));
    await tester.pump();

    expect(savedDraft?.name, 'Push');
    expect(savedDraft?.days.single.name, 'Día 1');
    expect(savedDraft?.days.single.exercises.single.exerciseId, 'bench');
    expect(savedDraft?.days.single.exercises.single.targetSets, 3);
  });

  testWidgets('edit mode preserves ids and shows loaded fields', (
    tester,
  ) async {
    await tester.pumpRoutineEditor(
      mode: RoutineEditorMode.edit,
      initialState: _editState(),
    );

    expect(find.text('Edit routine'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.byKey(const Key('routine-editor-submit')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Guardar cambios'), findsOneWidget);
    expect(find.text('Bench Press'), findsOneWidget);
    expect(
      tester
          .widget<TextField>(find.byKey(const Key('routine-editor-name')))
          .controller
          ?.text,
      'Push',
    );
  });

  testWidgets('missing edit routine shows back action', (tester) async {
    var wentBack = false;

    await tester.pumpRoutineEditor(
      mode: RoutineEditorMode.edit,
      initialState: const RoutineEditorState(
        mode: RoutineEditorMode.edit,
        draft: RoutineDraft(id: 'missing', name: '', days: []),
        exerciseOptions: [],
        errorMessage: 'Routine not found.',
      ),
      onBackToRoutines: () async => wentBack = true,
    );

    await tester.tap(find.byKey(const Key('routine-editor-back-to-routines')));
    await tester.pump();

    expect(wentBack, isTrue);
  });
}

RoutineEditorState _createState() {
  return RoutineEditorState(
    mode: RoutineEditorMode.create,
    draft: const RoutineDraft(name: '', days: []),
    exerciseOptions: [_exercise()],
  );
}

RoutineEditorState _editState() {
  return RoutineEditorState(
    mode: RoutineEditorMode.edit,
    draft: const RoutineDraft(
      id: 'routine-a',
      name: 'Push',
      description: 'Chest day',
      days: [
        RoutineDayDraft(
          id: 'day-a',
          name: 'Día 1',
          exercises: [
            RoutineExerciseDraft(
              id: 'routine-ex-a',
              exerciseId: 'bench',
              targetSets: 3,
              targetRepsMin: 8,
              targetRepsMax: 12,
            ),
          ],
        ),
      ],
    ),
    exerciseOptions: [_exercise()],
  );
}

ExerciseEntity _exercise() {
  return const ExerciseEntity(
    id: 'bench',
    name: 'Bench Press',
    equipment: 'Barbell',
    category: 'Chest',
    isCustom: false,
    isFavorite: false,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

FullRoutine _savedRoutine(RoutineDraft draft) {
  return FullRoutine(
    routine: RoutineEntity(
      id: draft.id ?? 'routine-created',
      name: draft.name,
      description: draft.description,
      goal: draft.goal,
      isArchived: false,
      sortOrder: 0,
      createdAt: null,
      updatedAt: null,
    ),
    days: const [],
  );
}

extension on WidgetTester {
  Future<void> pumpRoutineEditor({
    RoutineEditorMode mode = RoutineEditorMode.create,
    RoutineEditorState? initialState,
    RoutineEditorLoader? loadEditor,
    RoutineDraftSaver? saveDraft,
    RoutineDraftValidator? validateDraft,
    RoutineSavedAction? onSaved,
    Future<void> Function()? onCancel,
    Future<void> Function()? onBackToRoutines,
  }) {
    final controller = _TestRoutineEditorController();
    return pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: RoutineEditorScreen(
          mode: mode,
          initialState: initialState,
          loadEditor: loadEditor ?? () async => initialState ?? _createState(),
          saveDraft: saveDraft ?? controller.save,
          validateDraft: validateDraft ?? controller.validate,
          onSaved: onSaved ?? (_) async {},
          onCancel: onCancel ?? () async {},
          onBackToRoutines: onBackToRoutines ?? () async {},
        ),
      ),
    );
  }
}

class _TestRoutineEditorController {
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
    }
    return RoutineEditorValidationResult(messages);
  }

  Future<FullRoutine> save(RoutineDraft draft) async => _savedRoutine(draft);
}
