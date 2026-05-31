import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_library.dart';
import 'package:zenlift/features/workout/application/active_workout_controller.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/presentation/active_workout_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    ActiveWorkoutState? initialState,
    ActiveWorkoutLoader? loadState,
    ActiveWorkoutAddSet? onAddSet,
    ActiveWorkoutUpdateSet? onUpdateSet,
    ActiveWorkoutToggleSet? onToggleSet,
    ActiveWorkoutExerciseLoader? loadExercises,
    ActiveWorkoutAddExercise? onAddExercise,
    ActiveWorkoutStateFallback? getLatestState,
    ActiveWorkoutFinish? onFinish,
    ActiveWorkoutCancel? onCancel,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: Scaffold(
        body: ActiveWorkoutScreen(
          initialState: initialState,
          loadState: loadState,
          onAddSet: onAddSet,
          onUpdateSet: onUpdateSet,
          onToggleSet: onToggleSet,
          loadExercises: loadExercises,
          onAddExercise: onAddExercise,
          getLatestState: getLatestState,
          onFinish: onFinish,
          onCancel: onCancel,
        ),
      ),
    );
  }

  testWidgets('recovers and renders active workout exercises', (tester) async {
    await tester.pumpWidget(
      buildSubject(
        loadState: () async =>
            _stateWithSets(previousPerformance: (weight: 82.5, reps: 6)),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Push day'), findsOneWidget);
    expect(find.text('Bench Press'), findsOneWidget);
    expect(find.text('1/2 sets completed'), findsOneWidget);
    expect(find.text('Previous: 82.5 x 6'), findsOneWidget);
    expect(
      find.byKey(const Key('active-workout-add-set-workout-exercise-1')),
      findsOneWidget,
    );
  });

  testWidgets('add set callback refreshes visible state', (tester) async {
    var addSetCalls = 0;

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: const <SetLogEntity>[]),
        onAddSet: (workoutExerciseId) async {
          addSetCalls += 1;
          return _stateWithSets(sets: <SetLogEntity>[_set('set-1')]);
        },
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(
      find.byKey(const Key('active-workout-add-set-workout-exercise-1')),
    );
    await tester.pumpAndSettle();

    expect(addSetCalls, 1);
    expect(find.text('0/1 sets completed'), findsOneWidget);
    expect(
      find.byKey(const Key('active-workout-set-weight-set-1')),
      findsOneWidget,
    );
  });

  testWidgets('add exercise picker appends the selected exercise', (
    tester,
  ) async {
    final loadedQueries = <String>[];
    var addedExerciseId = '';

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: const <SetLogEntity>[]),
        loadExercises: ({String query = ''}) async {
          loadedQueries.add(query);
          return _exerciseLibraryState();
        },
        onAddExercise: (exerciseId) async {
          addedExerciseId = exerciseId;
          return _stateWithAdditionalExercise();
        },
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(
      find.byKey(const Key('active-workout-add-exercise-button')),
    );
    await tester.pumpAndSettle();

    expect(find.text('Choose exercise'), findsOneWidget);
    expect(find.text('Incline Dumbbell Press'), findsOneWidget);

    await tester.tap(
      find.byKey(const Key('active-workout-exercise-option-incline-db-press')),
    );
    await tester.pumpAndSettle();

    expect(loadedQueries, <String>['']);
    expect(addedExerciseId, 'incline-db-press');
    expect(find.text('Bench Press'), findsOneWidget);
    expect(find.text('Incline Dumbbell Press'), findsOneWidget);
    expect(find.text('0/0 sets completed'), findsNWidgets(2));
  });

  testWidgets('exercise picker ignores stale search responses', (tester) async {
    final initialLoad = Completer<ExerciseLibraryState>();
    final slowSearch = Completer<ExerciseLibraryState>();
    final fastSearch = Completer<ExerciseLibraryState>();

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: const <SetLogEntity>[]),
        loadExercises: ({String query = ''}) {
          return switch (query) {
            '' => initialLoad.future,
            'slow' => slowSearch.future,
            'fast' => fastSearch.future,
            _ => Future.value(_exerciseLibraryState(name: query)),
          };
        },
        onAddExercise: (_) async => _stateWithSets(),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(
      find.byKey(const Key('active-workout-add-exercise-button')),
    );
    await tester.pump();

    initialLoad.complete(_exerciseLibraryState(name: 'Initial Exercise'));
    await tester.pump();

    await tester.enterText(
      find.byKey(const Key('active-workout-exercise-search-field')),
      'slow',
    );
    await tester.pump(const Duration(milliseconds: 300));

    await tester.enterText(
      find.byKey(const Key('active-workout-exercise-search-field')),
      'fast',
    );
    await tester.pump(const Duration(milliseconds: 300));

    fastSearch.complete(_exerciseLibraryState(name: 'Fast Exercise'));
    await tester.pump();

    expect(find.text('Fast Exercise'), findsOneWidget);

    slowSearch.complete(_exerciseLibraryState(name: 'Slow Exercise'));
    await tester.pump();

    expect(find.text('Fast Exercise'), findsOneWidget);
    expect(find.text('Slow Exercise'), findsNothing);
  });

  testWidgets('editing weight and reps autosaves through callbacks', (
    tester,
  ) async {
    final weightUpdates = <double>[];
    final repUpdates = <int>[];

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: <SetLogEntity>[_set('set-1')]),
        onUpdateSet: (setId, {weight, reps, setType, notes}) async {
          if (weight != null) {
            weightUpdates.add(weight);
          }
          if (reps != null) {
            repUpdates.add(reps);
          }
          return _stateWithSets(
            sets: <SetLogEntity>[
              _set('set-1', weight: weight ?? 60, reps: reps ?? 8),
            ],
          );
        },
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('active-workout-set-weight-set-1')),
      '62.5',
    );
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('active-workout-set-reps-set-1')),
      '9',
    );
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    expect(weightUpdates, <double>[62.5]);
    expect(repUpdates, <int>[9]);
  });

  testWidgets('editing set type and notes autosaves through callbacks', (
    tester,
  ) async {
    final setTypes = <SetType>[];
    final noteValues = <String?>[];

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: <SetLogEntity>[_set('set-1')]),
        onUpdateSet: (setId, {weight, reps, setType, notes}) async {
          if (setType != null) {
            setTypes.add(setType);
          }
          if (notes != null) {
            noteValues.add(notes.value);
          }
          return _stateWithSets(
            sets: <SetLogEntity>[
              _set(
                'set-1',
                setType: setType ?? SetType.normal,
                notes: notes?.value,
              ),
            ],
          );
        },
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('active-workout-set-type-set-1')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Failure').last);
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('active-workout-set-notes-set-1')),
      'Hard last rep',
    );
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pumpAndSettle();

    expect(setTypes, <SetType>[SetType.failure]);
    expect(noteValues, <String?>['Hard last rep']);
  });

  testWidgets('toggling a set updates completed state', (tester) async {
    var toggledSetId = '';

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: <SetLogEntity>[_set('set-1')]),
        onToggleSet: (setId) async {
          toggledSetId = setId;
          return _stateWithSets(
            sets: <SetLogEntity>[_set('set-1', isCompleted: true)],
          );
        },
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('active-workout-set-toggle-set-1')));
    await tester.pumpAndSettle();

    expect(toggledSetId, 'set-1');
    expect(find.text('1/1 sets completed'), findsOneWidget);
  });

  testWidgets('finish displays summary message', (tester) async {
    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(
          sets: <SetLogEntity>[_set('set-1', isCompleted: true)],
        ),
        onFinish: () async => WorkoutSummary(
          sessionId: 'session-1',
          routineId: null,
          routineDayId: null,
          name: 'Push day',
          startedAt: DateTime.utc(2026, 5, 30, 11),
          endedAt: DateTime.utc(2026, 5, 30, 12),
          durationSeconds: 3600,
          exerciseCount: 1,
          completedSetCount: 1,
          totalVolume: 480,
          personalRecordCount: 0,
          personalRecords: const <DetectedPersonalRecord>[],
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('active-workout-finish-button')));
    await tester.pumpAndSettle();

    expect(find.text('Workout saved: 1 sets, 480 volume.'), findsOneWidget);
  });

  testWidgets('empty recovered state shows no active workout message', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildSubject(loadState: () async => ActiveWorkoutState.empty),
    );
    await tester.pumpAndSettle();

    expect(find.text('No active workout'), findsOneWidget);
  });

  testWidgets('pending set write state is surfaced', (tester) async {
    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(
          hasPendingSetWrites: true,
          sets: <SetLogEntity>[_set('set-1')],
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(
      find.text('A completed set is pending save. Zenlift will retry it.'),
      findsOneWidget,
    );
  });

  testWidgets('pending state is surfaced when a set action fails', (
    tester,
  ) async {
    final pendingState = _stateWithSets(
      hasPendingSetWrites: true,
      sets: <SetLogEntity>[_set('set-1')],
    );

    await tester.pumpWidget(
      buildSubject(
        initialState: _stateWithSets(sets: <SetLogEntity>[_set('set-1')]),
        onToggleSet: (setId) async => throw const ActiveWorkoutException(
          'Set save is pending and will retry.',
        ),
        getLatestState: () => pendingState,
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('active-workout-set-toggle-set-1')));
    await tester.pumpAndSettle();

    expect(find.text('Workout changes could not be saved.'), findsOneWidget);
    expect(
      find.text('A completed set is pending save. Zenlift will retry it.'),
      findsOneWidget,
    );
  });
}

ActiveWorkoutState _stateWithSets({
  List<SetLogEntity> sets = const <SetLogEntity>[
    SetLogEntity(
      id: 'set-1',
      workoutExerciseId: 'workout-exercise-1',
      setNumber: 1,
      weight: 60,
      reps: 8,
      setType: SetType.normal,
      isCompleted: true,
      completedAt: null,
      notes: null,
    ),
    SetLogEntity(
      id: 'set-2',
      workoutExerciseId: 'workout-exercise-1',
      setNumber: 2,
      weight: 60,
      reps: 8,
      setType: SetType.normal,
      isCompleted: false,
      completedAt: null,
      notes: null,
    ),
  ],
  ({double weight, int reps})? previousPerformance,
  bool hasPendingSetWrites = false,
}) {
  return ActiveWorkoutState(
    session: WorkoutSessionEntity(
      id: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Push day',
      startedAt: DateTime.now().subtract(const Duration(minutes: 4)),
      endedAt: null,
      durationSeconds: null,
      status: WorkoutStatus.active,
      notes: null,
      createdAt: null,
      updatedAt: null,
    ),
    exercises: <WorkoutExerciseWithSets>[
      WorkoutExerciseWithSets(
        workoutExercise: const WorkoutExerciseEntity(
          id: 'workout-exercise-1',
          workoutSessionId: 'session-1',
          exerciseId: 'bench',
          sortOrder: 1,
          notes: null,
        ),
        exercise: const ExerciseEntity(
          id: 'bench',
          name: 'Bench Press',
          equipment: 'barbell',
          category: 'strength',
          isCustom: false,
          isFavorite: false,
          notes: null,
          createdAt: null,
          updatedAt: null,
        ),
        sets: sets,
      ),
    ],
    previousPerformanceByWorkoutExerciseId: previousPerformance == null
        ? const <String, ({double weight, int reps})>{}
        : <String, ({double weight, int reps})>{
            'workout-exercise-1': previousPerformance,
          },
    hasPendingSetWrites: hasPendingSetWrites,
  );
}

ExerciseLibraryState _exerciseLibraryState({
  String id = 'incline-db-press',
  String name = 'Incline Dumbbell Press',
}) {
  return ExerciseLibraryState(
    exercises: <ExerciseLibraryItem>[
      ExerciseLibraryItem(
        exercise: ExerciseEntity(
          id: id,
          name: name,
          equipment: 'dumbbell',
          category: 'strength',
          isCustom: false,
          isFavorite: false,
          notes: null,
          createdAt: null,
          updatedAt: null,
        ),
        primaryMuscle: MuscleGroupEntity(
          id: 'chest',
          name: 'chest',
          displayNameEs: 'Pecho',
          color: '#cfbcff',
        ),
      ),
    ],
    muscleGroups: <MuscleGroupEntity>[],
  );
}

ActiveWorkoutState _stateWithAdditionalExercise() {
  final current = _stateWithSets(sets: const <SetLogEntity>[]);
  return ActiveWorkoutState(
    session: current.session,
    exercises: <WorkoutExerciseWithSets>[
      ...current.exercises,
      const WorkoutExerciseWithSets(
        workoutExercise: WorkoutExerciseEntity(
          id: 'workout-exercise-2',
          workoutSessionId: 'session-1',
          exerciseId: 'incline-db-press',
          sortOrder: 2,
          notes: null,
        ),
        exercise: ExerciseEntity(
          id: 'incline-db-press',
          name: 'Incline Dumbbell Press',
          equipment: 'dumbbell',
          category: 'strength',
          isCustom: false,
          isFavorite: false,
          notes: null,
          createdAt: null,
          updatedAt: null,
        ),
        sets: <SetLogEntity>[],
      ),
    ],
    previousPerformanceByWorkoutExerciseId:
        current.previousPerformanceByWorkoutExerciseId,
    hasPendingSetWrites: current.hasPendingSetWrites,
    lastError: current.lastError,
  );
}

SetLogEntity _set(
  String id, {
  double weight = 60,
  int reps = 8,
  SetType setType = SetType.normal,
  bool isCompleted = false,
  String? notes,
}) {
  return SetLogEntity(
    id: id,
    workoutExerciseId: 'workout-exercise-1',
    setNumber: 1,
    weight: weight,
    reps: reps,
    setType: setType,
    isCompleted: isCompleted,
    completedAt: isCompleted ? DateTime.utc(2026, 5, 30, 12) : null,
    notes: notes,
  );
}
