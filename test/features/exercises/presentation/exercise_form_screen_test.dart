import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_form.dart';
import 'package:zenlift/features/exercises/presentation/exercise_form_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  testWidgets('create mode renders defaults and validation errors', (
    tester,
  ) async {
    await tester.pumpExerciseForm(initialState: _createState());

    expect(find.text('Create exercise'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.byKey(const Key('exercise-form-submit')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Crear ejercicio'), findsOneWidget);

    await tester.tap(find.byKey(const Key('exercise-form-submit')));
    await tester.pump();
    await tester.drag(find.byType(ListView), const Offset(0, 1000));
    await tester.pump();

    expect(find.text('El nombre es obligatorio'), findsOneWidget);
    expect(find.text('Selecciona un músculo principal'), findsOneWidget);
    expect(find.text('Selecciona el equipamiento'), findsOneWidget);
  });

  testWidgets('selects options and saves a custom exercise draft', (
    tester,
  ) async {
    ExerciseDraft? savedDraft;

    await tester.pumpExerciseForm(
      initialState: _createState(),
      saveDraft: (draft) async {
        savedDraft = draft;
        return _exercise(id: 'created', name: draft.name);
      },
    );

    await tester.enterText(find.byKey(const Key('exercise-form-name')), 'Fly');
    await tester.tap(find.byKey(const Key('exercise-form-primary-chest')));
    await tester.tap(find.byKey(const Key('exercise-form-secondary-back')));
    await tester.scrollUntilVisible(
      find.byKey(const Key('exercise-form-equipment-barbell')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.ensureVisible(
      find.byKey(const Key('exercise-form-equipment-barbell')),
    );
    await tester.tap(find.byKey(const Key('exercise-form-equipment-barbell')));
    await tester.scrollUntilVisible(
      find.byKey(const Key('exercise-form-category-strength')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.ensureVisible(
      find.byKey(const Key('exercise-form-category-strength')),
    );
    await tester.tap(find.byKey(const Key('exercise-form-category-strength')));
    await tester.scrollUntilVisible(
      find.byKey(const Key('exercise-form-submit')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.byKey(const Key('exercise-form-submit')));
    await tester.pump();

    expect(savedDraft?.name, 'Fly');
    expect(savedDraft?.primaryMuscleGroupId, 'chest');
    expect(savedDraft?.secondaryMuscleGroupIds, ['back']);
    expect(savedDraft?.equipment, 'barbell');
    expect(savedDraft?.category, 'strength');
  });

  testWidgets('edit mode pre-fills values and removes primary from secondary', (
    tester,
  ) async {
    await tester.pumpExerciseForm(
      mode: ExerciseFormMode.edit,
      initialState: _editState(),
    );

    expect(find.text('Edit exercise'), findsOneWidget);
    expect(
      tester
          .widget<TextField>(find.byKey(const Key('exercise-form-name')))
          .controller
          ?.text,
      'Bench Press',
    );

    await tester.tap(find.byKey(const Key('exercise-form-primary-back')));
    await tester.pump();

    expect(find.byKey(const Key('exercise-form-secondary-back')), findsNothing);
  });

  testWidgets('create mode shows unavailable state when muscles are missing', (
    tester,
  ) async {
    var wentBack = false;

    await tester.pumpExerciseForm(
      initialState: const ExerciseFormState(
        mode: ExerciseFormMode.create,
        draft: ExerciseDraft(
          name: '',
          primaryMuscleGroupId: '',
          equipment: '',
          category: '',
        ),
        muscleGroups: <MuscleGroupEntity>[],
        errorMessage: 'No se pudieron cargar los músculos.',
      ),
      onBackToExercises: () async => wentBack = true,
    );

    expect(find.text('No se pudieron cargar los músculos.'), findsOneWidget);
    expect(find.byKey(const Key('exercise-form-submit')), findsNothing);

    await tester.tap(find.byKey(const Key('exercise-form-back-to-exercises')));
    await tester.pump();

    expect(wentBack, isTrue);
  });

  testWidgets('missing edit exercise shows back action', (tester) async {
    var wentBack = false;

    await tester.pumpExerciseForm(
      mode: ExerciseFormMode.edit,
      initialState: const ExerciseFormState(
        mode: ExerciseFormMode.edit,
        draft: ExerciseDraft(
          id: 'missing',
          name: '',
          primaryMuscleGroupId: '',
          equipment: '',
          category: '',
        ),
        muscleGroups: [],
        errorMessage: 'Exercise not found.',
      ),
      onBackToExercises: () async => wentBack = true,
    );

    await tester.tap(find.byKey(const Key('exercise-form-back-to-exercises')));
    await tester.pump();

    expect(wentBack, isTrue);
  });
}

ExerciseFormState _createState() {
  return ExerciseFormState(
    mode: ExerciseFormMode.create,
    draft: ExerciseFormState.createEmpty.draft,
    muscleGroups: [_muscle('chest', 'Pecho'), _muscle('back', 'Espalda')],
  );
}

ExerciseFormState _editState() {
  return ExerciseFormState(
    mode: ExerciseFormMode.edit,
    draft: const ExerciseDraft(
      id: 'bench',
      name: 'Bench Press',
      primaryMuscleGroupId: 'chest',
      secondaryMuscleGroupIds: ['back'],
      equipment: 'barbell',
      category: 'strength',
      notes: 'Keep shoulders pinned',
    ),
    muscleGroups: [_muscle('chest', 'Pecho'), _muscle('back', 'Espalda')],
  );
}

ExerciseEntity _exercise({required String id, required String name}) {
  return ExerciseEntity(
    id: id,
    name: name,
    equipment: 'barbell',
    category: 'strength',
    isCustom: true,
    isFavorite: false,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

MuscleGroupEntity _muscle(String id, String displayName) {
  return MuscleGroupEntity(
    id: id,
    name: id,
    displayNameEs: displayName,
    color: '#EF4444',
  );
}

extension on WidgetTester {
  Future<void> pumpExerciseForm({
    ExerciseFormMode mode = ExerciseFormMode.create,
    ExerciseFormState? initialState,
    ExerciseFormLoader? loadForm,
    ExerciseDraftSaver? saveDraft,
    ExerciseDraftValidator? validateDraft,
    ExerciseSavedAction? onSaved,
    Future<void> Function()? onCancel,
    Future<void> Function()? onBackToExercises,
  }) {
    view.physicalSize = const Size(800, 1200);
    view.devicePixelRatio = 1;
    addTearDown(() {
      view.resetPhysicalSize();
      view.resetDevicePixelRatio();
    });
    return pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: ExerciseFormScreen(
          mode: mode,
          initialState: initialState,
          loadForm: loadForm ?? () async => initialState ?? _createState(),
          saveDraft:
              saveDraft ??
              (draft) async => _exercise(id: 'saved', name: draft.name),
          validateDraft: validateDraft ?? _validate,
          onSaved: onSaved ?? (_) async {},
          onCancel: onCancel ?? () async {},
          onBackToExercises: onBackToExercises ?? () async {},
        ),
      ),
    );
  }
}

ExerciseFormValidationResult _validate(ExerciseDraft draft) {
  final messages = <String>[];
  if (draft.name.trim().isEmpty) {
    messages.add('El nombre es obligatorio');
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
