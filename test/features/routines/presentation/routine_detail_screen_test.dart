import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_detail.dart';
import 'package:zenlift/features/routines/presentation/routine_detail_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  testWidgets('renders routine header, day sections, and exercise targets', (
    tester,
  ) async {
    await tester.pumpRoutineDetailScreen(initialState: _state());

    expect(find.text('Push'), findsOneWidget);
    expect(find.text('Chest and shoulders'), findsOneWidget);
    expect(find.text('Day A'), findsOneWidget);
    expect(find.text('Bench Press'), findsOneWidget);
    expect(find.text('4 sets • 8-12 reps'), findsWidgets);
  });

  testWidgets('updates routine name through injected callback', (tester) async {
    var requestedName = '';

    await tester.pumpRoutineDetailScreen(
      initialState: _state(),
      onUpdateName: (state, name) async {
        requestedName = name;
        return state.copyWith(
          routine: FullRoutine(
            routine: RoutineEntity(
              id: state.routine!.routine.id,
              name: name,
              description: state.routine!.routine.description,
              goal: state.routine!.routine.goal,
              isArchived: false,
              sortOrder: 0,
              createdAt: null,
              updatedAt: null,
            ),
            days: state.routine!.days,
          ),
        );
      },
    );

    await tester.tap(find.byKey(const Key('routine-detail-name-button')));
    await tester.pump();
    await tester.enterText(
      find.byKey(const Key('routine-detail-name-field')),
      'Push Power',
    );
    await tester.tap(find.byKey(const Key('routine-detail-save-name')));
    await tester.pump();

    expect(requestedName, 'Push Power');
    expect(find.text('Push Power'), findsOneWidget);
  });

  testWidgets(
    'archive, edit, duplicate, start, and add callbacks are injected',
    (tester) async {
      var archived = false;
      var edited = false;
      var duplicated = false;
      var startedDayId = '';
      var addDayId = '';

      await tester.pumpRoutineDetailScreen(
        initialState: _state(),
        onArchiveRoutine: (_) async => archived = true,
        onEditRoutine: (_) async => edited = true,
        onDuplicateRoutine: (state) async {
          duplicated = true;
          return state;
        },
        onStartWorkout: (_, day) async => startedDayId = day.id,
        onAddExercise: (_, day) async => addDayId = day.id,
      );

      await tester.tap(find.byKey(const Key('routine-detail-archive-button')));
      await tester.pump();
      await tester.tap(find.byKey(const Key('routine-detail-edit-button')));
      await tester.pump();
      await tester.tap(
        find.byKey(const Key('routine-detail-duplicate-button')),
      );
      await tester.pump();
      await tester.ensureVisible(
        find.byKey(const Key('routine-day-day-a-start-workout')),
      );
      await tester.pump();
      await tester.tap(
        find.byKey(const Key('routine-day-day-a-start-workout')),
      );
      await tester.pump();
      await tester.ensureVisible(
        find.byKey(const Key('routine-day-day-a-add-exercise')),
      );
      await tester.pump();
      await tester.tap(find.byKey(const Key('routine-day-day-a-add-exercise')));
      await tester.pump();

      expect(archived, isTrue);
      expect(edited, isTrue);
      expect(duplicated, isTrue);
      expect(startedDayId, 'day-a');
      expect(addDayId, 'day-a');
    },
  );

  testWidgets('remove and move exercise callbacks update rendered state', (
    tester,
  ) async {
    await tester.pumpRoutineDetailScreen(
      initialState: _state(),
      onRemoveExercise: (state, id) async => state.copyWith(
        routine: FullRoutine(
          routine: state.routine!.routine,
          days: [
            FullRoutineDay(
              day: state.routine!.days.single.day,
              exercises: state.routine!.days.single.exercises
                  .where((item) => item.routineExercise.id != id)
                  .toList(),
            ),
          ],
        ),
      ),
      onMoveExercise:
          (
            state, {
            required dayId,
            required routineExerciseId,
            required direction,
          }) async {
            final exercises = [
              ...state.routine!.days.single.exercises.reversed,
            ];
            return state.copyWith(
              routine: FullRoutine(
                routine: state.routine!.routine,
                days: [
                  FullRoutineDay(
                    day: state.routine!.days.single.day,
                    exercises: exercises,
                  ),
                ],
              ),
            );
          },
    );

    await tester.tap(
      find.byKey(const Key('routine-exercise-routine-ex-row-up')),
    );
    await tester.pump();
    expect(
      tester.getTopLeft(find.text('Barbell Row')).dy <
          tester.getTopLeft(find.text('Bench Press')).dy,
      isTrue,
    );

    await tester.tap(
      find.byKey(const Key('routine-exercise-routine-ex-bench-remove')),
    );
    await tester.pump();

    expect(find.text('Bench Press'), findsNothing);
  });

  testWidgets('missing routine shows back action', (tester) async {
    var wentBack = false;

    await tester.pumpRoutineDetailScreen(
      initialState: const RoutineDetailState(
        routine: null,
        primaryMusclesByExerciseId: {},
        errorMessage: 'Routine not found.',
      ),
      onBackToRoutines: () async => wentBack = true,
    );

    expect(find.text('Routine not found'), findsOneWidget);
    await tester.tap(find.byKey(const Key('routine-detail-back-to-routines')));
    await tester.pump();

    expect(wentBack, isTrue);
  });
}

RoutineDetailState _state() {
  final routine = _fullRoutine();
  return RoutineDetailState(
    routine: routine,
    primaryMusclesByExerciseId: {
      'bench': const MuscleGroupEntity(
        id: 'chest',
        name: 'chest',
        displayNameEs: 'Pecho',
        color: '#ffcc00',
      ),
    },
  );
}

FullRoutine _fullRoutine() {
  return FullRoutine(
    routine: const RoutineEntity(
      id: 'routine-a',
      name: 'Push',
      description: 'Chest and shoulders',
      goal: null,
      isArchived: false,
      sortOrder: 0,
      createdAt: null,
      updatedAt: null,
    ),
    days: [
      FullRoutineDay(
        day: const RoutineDayEntity(
          id: 'day-a',
          routineId: 'routine-a',
          name: 'Day A',
          dayOfWeek: 1,
          sortOrder: 0,
        ),
        exercises: [
          _routineExercise('routine-ex-bench', 'bench', 'Bench Press'),
          _routineExercise('routine-ex-row', 'row', 'Barbell Row'),
        ],
      ),
    ],
  );
}

RoutineExerciseWithExercise _routineExercise(
  String id,
  String exerciseId,
  String name,
) {
  return RoutineExerciseWithExercise(
    routineExercise: RoutineExerciseEntity(
      id: id,
      routineDayId: 'day-a',
      exerciseId: exerciseId,
      targetSets: 4,
      targetRepsMin: 8,
      targetRepsMax: 12,
      notes: null,
      sortOrder: 0,
    ),
    exercise: ExerciseEntity(
      id: exerciseId,
      name: name,
      equipment: 'Barbell',
      category: 'Strength',
      isCustom: false,
      isFavorite: false,
      notes: null,
      createdAt: null,
      updatedAt: null,
    ),
  );
}

extension on WidgetTester {
  Future<void> pumpRoutineDetailScreen({
    RoutineDetailState? initialState,
    RoutineDetailLoader? loadRoutine,
    RoutineNameUpdater? onUpdateName,
    RoutineDetailStateAction? onDuplicateRoutine,
    FullRoutineAction? onArchiveRoutine,
    FullRoutineAction? onDeleteRoutine,
    RoutineExerciseRemover? onRemoveExercise,
    RoutineExerciseMover? onMoveExercise,
    FullRoutineAction? onEditRoutine,
    RoutineDayAction? onAddExercise,
    RoutineDayAction? onStartWorkout,
    Future<void> Function()? onBackToRoutines,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: RoutineDetailScreen(
          routineId: 'routine-a',
          initialState: initialState,
          loadRoutine: loadRoutine ?? (_) async => _state(),
          onUpdateName: onUpdateName ?? (state, _) async => state,
          onDuplicateRoutine: onDuplicateRoutine ?? (state) async => state,
          onArchiveRoutine: onArchiveRoutine ?? (_) async {},
          onDeleteRoutine: onDeleteRoutine ?? (_) async {},
          onRemoveExercise: onRemoveExercise ?? (state, _) async => state,
          onMoveExercise:
              onMoveExercise ??
              (
                state, {
                required dayId,
                required routineExerciseId,
                required direction,
              }) async => state,
          onEditRoutine: onEditRoutine ?? (_) async {},
          onAddExercise: onAddExercise ?? (_, _) async {},
          onStartWorkout: onStartWorkout ?? (_, _) async {},
          onBackToRoutines: onBackToRoutines ?? () async {},
        ),
      ),
    );
  }
}
