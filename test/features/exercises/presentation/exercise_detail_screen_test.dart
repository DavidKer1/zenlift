import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_detail.dart';
import 'package:zenlift/features/exercises/presentation/exercise_detail_screen.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  testWidgets('renders exercise detail sections and custom actions', (
    tester,
  ) async {
    await tester.pumpExerciseDetailScreen(initialState: _state(isCustom: true));

    expect(find.text('Bench Press'), findsOneWidget);
    expect(find.text('Barbell • Chest'), findsOneWidget);
    expect(find.text('Pecho primary'), findsOneWidget);
    expect(find.text('Best Performance'), findsOneWidget);
    expect(find.text('100.0 kg'), findsWidgets);
    expect(
      find.byKey(const Key('exercise-detail-edit-button')),
      findsOneWidget,
    );
    expect(
      find.byKey(const Key('exercise-detail-delete-button')),
      findsOneWidget,
    );
  });

  testWidgets('seed exercises hide edit and delete', (tester) async {
    await tester.pumpExerciseDetailScreen(initialState: _state());

    expect(find.byKey(const Key('exercise-detail-edit-button')), findsNothing);
    expect(
      find.byKey(const Key('exercise-detail-delete-button')),
      findsNothing,
    );
  });

  testWidgets('quick workout and edit callbacks are injected', (tester) async {
    var quickWorkout = false;
    var edit = false;

    await tester.pumpExerciseDetailScreen(
      initialState: _state(isCustom: true),
      onQuickWorkout: (_) async => quickWorkout = true,
      onEditExercise: (_) async => edit = true,
    );

    await tester.tap(find.byKey(const Key('exercise-detail-quick-workout')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('exercise-detail-edit-button')));
    await tester.pump();

    expect(quickWorkout, isTrue);
    expect(edit, isTrue);
  });

  testWidgets('missing exercise shows back action', (tester) async {
    var wentBack = false;

    await tester.pumpExerciseDetailScreen(
      initialState: ExerciseDetailState.empty,
      onBack: () async => wentBack = true,
    );

    await tester.tap(find.byKey(const Key('exercise-detail-back-button')));
    await tester.pump();

    expect(wentBack, isTrue);
  });
}

ExerciseDetailState _state({bool isCustom = false}) {
  return ExerciseDetailState(
    exercise: ExerciseEntity(
      id: 'bench',
      name: 'Bench Press',
      equipment: 'Barbell',
      category: 'Chest',
      isCustom: isCustom,
      isFavorite: false,
      notes: null,
      createdAt: null,
      updatedAt: null,
    ),
    muscles: const [
      MuscleGroupEntity(
        id: 'chest',
        name: 'chest',
        displayNameEs: 'Pecho',
        color: '#ffcc00',
      ),
    ],
    bestPerformance: const ExerciseBestPerformance(
      maxWeight: 100,
      bestEstimatedOneRepMax: 133.33,
      maxVolume: 1000,
    ),
    history: [
      ExerciseHistoryItem(
        startedAt: DateTime.utc(2026, 5, 30),
        weight: 100,
        reps: 10,
        volume: 1000,
      ),
    ],
    personalRecords: [
      PersonalRecordEntity(
        id: 'pr',
        exerciseId: 'bench',
        workoutSessionId: 'session',
        type: PersonalRecordType.maxWeight,
        value: 100,
        weight: 100,
        reps: 10,
        achievedAt: DateTime.utc(2026, 5, 30),
      ),
    ],
  );
}

extension on WidgetTester {
  Future<void> pumpExerciseDetailScreen({
    ExerciseDetailState? initialState,
    ExerciseDetailLoader? loadExercise,
    ExerciseAction? onQuickWorkout,
    ExerciseAction? onEditExercise,
    ExerciseAction? onDeleteExercise,
    Future<void> Function()? onBack,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: ExerciseDetailScreen(
          exerciseId: 'bench',
          initialState: initialState,
          loadExercise: loadExercise ?? (_) async => _state(),
          onQuickWorkout: onQuickWorkout ?? (_) async {},
          onEditExercise: onEditExercise ?? (_) async {},
          onDeleteExercise: onDeleteExercise ?? (_) async {},
          onBack: onBack ?? () async {},
        ),
      ),
    );
  }
}
