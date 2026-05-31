import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_library.dart';
import 'package:zenlift/features/exercises/presentation/exercise_library_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    ExerciseLibraryState? initialState,
    ExerciseLibraryLoader? loadExercises,
    ExerciseFavoriteToggler? onToggleFavorite,
    ExerciseIdAction? onOpenExercise,
    ExerciseAction? onCreateExercise,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: ExerciseLibraryScreen(
        initialState: initialState,
        loadExercises:
            loadExercises ??
            ({query = '', muscleIds = const <String>{}, equipment}) async =>
                ExerciseLibraryState.empty,
        onToggleFavorite: onToggleFavorite ?? (_) async => null,
        onOpenExercise: onOpenExercise ?? (_) async {},
        onCreateExercise: onCreateExercise ?? () async {},
      ),
    );
  }

  testWidgets(
    'renders exercise cards with muscle equipment and favorite state',
    (tester) async {
      await tester.pumpWidget(buildSubject(initialState: _libraryState()));

      expect(find.text('Exercise library'), findsOneWidget);
      expect(find.text('Bench Press'), findsOneWidget);
      expect(find.text('Chest · barbell'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(
        find.byKey(const Key('exercise-library-muscle-chest')),
        findsOneWidget,
      );
    },
  );

  testWidgets('search and filters call the loader', (tester) async {
    var latestQuery = '';
    var latestMuscles = <String>{};
    String? latestEquipment;

    await tester.pumpWidget(
      buildSubject(
        initialState: _libraryState(),
        loadExercises:
            ({query = '', muscleIds = const <String>{}, equipment}) async {
              latestQuery = query;
              latestMuscles = muscleIds;
              latestEquipment = equipment;
              return _libraryState();
            },
      ),
    );

    await tester.enterText(
      find.byKey(const Key('exercise-library-search-field')),
      'bench',
    );
    await tester.pump(const Duration(milliseconds: 350));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('exercise-library-muscle-chest')));
    await tester.pumpAndSettle();
    await tester.tap(
      find.byKey(const Key('exercise-library-equipment-barbell')),
    );
    await tester.pumpAndSettle();

    expect(latestQuery, 'bench');
    expect(latestMuscles, contains('chest'));
    expect(latestEquipment, 'barbell');
  });

  testWidgets('favorite toggle is optimistic and calls callback', (
    tester,
  ) async {
    var toggledId = '';

    await tester.pumpWidget(
      buildSubject(
        initialState: _libraryState(isFavorite: false),
        onToggleFavorite: (id) async {
          toggledId = id;
          return _exercise('bench', isFavorite: true);
        },
      ),
    );

    await tester.tap(find.byKey(const Key('exercise-favorite-bench')));
    await tester.pumpAndSettle();

    expect(toggledId, 'bench');
    expect(find.byIcon(Icons.star), findsOneWidget);
  });

  testWidgets('open and create callbacks are injected', (tester) async {
    var openedId = '';
    var createCalls = 0;

    await tester.pumpWidget(
      buildSubject(
        initialState: _libraryState(),
        onOpenExercise: (id) async => openedId = id,
        onCreateExercise: () async => createCalls += 1,
      ),
    );

    await tester.tap(find.byKey(const Key('exercise-card-bench')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('exercise-library-create-button')));
    await tester.pumpAndSettle();

    expect(openedId, 'bench');
    expect(createCalls, 1);
  });

  testWidgets('empty state stays visible with create action', (tester) async {
    await tester.pumpWidget(
      buildSubject(initialState: ExerciseLibraryState.empty),
    );

    expect(find.text('No se encontraron ejercicios'), findsOneWidget);
    expect(
      find.byKey(const Key('exercise-library-create-button')),
      findsOneWidget,
    );
  });
}

ExerciseLibraryState _libraryState({bool isFavorite = true}) {
  final chest = _muscle('chest', 'Chest');
  return ExerciseLibraryState(
    muscleGroups: <MuscleGroupEntity>[chest],
    exercises: <ExerciseLibraryItem>[
      ExerciseLibraryItem(
        exercise: _exercise('bench', isFavorite: isFavorite),
        primaryMuscle: chest,
      ),
    ],
  );
}

ExerciseEntity _exercise(String id, {required bool isFavorite}) {
  return ExerciseEntity(
    id: id,
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    isCustom: false,
    isFavorite: isFavorite,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

MuscleGroupEntity _muscle(String id, String name) {
  return MuscleGroupEntity(
    id: id,
    name: name.toLowerCase(),
    displayNameEs: name,
    color: '#EF4444',
  );
}
