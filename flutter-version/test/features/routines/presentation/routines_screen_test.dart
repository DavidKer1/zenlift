import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_list.dart';
import 'package:zenlift/features/routines/presentation/routines_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  testWidgets('renders routine cards with counts and opens a routine', (
    tester,
  ) async {
    RoutineWithCounts? openedRoutine;

    await tester.pumpRoutinesScreen(
      initialState: RoutineListState(
        routines: [_routine('push', 'Push', dayCount: 3, exerciseCount: 15)],
      ),
      onOpenRoutine: (routine) async => openedRoutine = routine,
    );

    expect(find.text('Push'), findsOneWidget);
    expect(find.text('3 días • 15 ejercicios'), findsOneWidget);

    await tester.tap(find.text('Push'));
    await tester.pump();

    expect(openedRoutine?.routine.id, 'push');
  });

  testWidgets('shows empty state and create actions', (tester) async {
    var createCount = 0;

    await tester.pumpRoutinesScreen(
      initialState: RoutineListState.empty,
      onCreateRoutine: () async => createCount += 1,
    );

    expect(find.byKey(const Key('routines-empty-state')), findsOneWidget);
    expect(find.text('No tienes rutinas aún'), findsOneWidget);
    expect(find.byKey(const Key('routines-create-button')), findsOneWidget);

    await tester.tap(find.byKey(const Key('routines-empty-create-button')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('routines-create-button')));
    await tester.pump();

    expect(createCount, 2);
  });

  testWidgets('archives a routine and supports undo from snackbar', (
    tester,
  ) async {
    final routine = _routine('push', 'Push');
    var archived = false;
    var undone = false;

    await tester.pumpRoutinesScreen(
      initialState: RoutineListState(routines: [routine]),
      onArchiveRoutine: (state, archivedRoutine) async {
        archived = true;
        return state.copyWith(
          routines: const <RoutineWithCounts>[],
          archivedRoutine: archivedRoutine,
        );
      },
      onUndoArchive: (state) async {
        undone = true;
        return state.copyWith(routines: [routine], clearArchivedRoutine: true);
      },
    );

    await tester.tap(find.byKey(const Key('routine-archive-push')));
    await tester.pump();

    expect(archived, isTrue);
    expect(find.text('Push archived.'), findsOneWidget);

    tester.widget<SnackBarAction>(find.byType(SnackBarAction)).onPressed();
    await tester.pump();

    expect(undone, isTrue);
  });

  testWidgets('shows templates only when fewer than two routines exist', (
    tester,
  ) async {
    await tester.pumpWidget(const SizedBox.shrink());

    await tester.pumpRoutinesScreen(
      initialState: RoutineListState(routines: [_routine('push', 'Push')]),
    );

    expect(
      find.byKey(const Key('routines-suggested-templates')),
      findsOneWidget,
    );
    expect(find.text('PPL'), findsOneWidget);

    await tester.pumpRoutinesScreen(
      initialState: RoutineListState(
        routines: [_routine('push', 'Push'), _routine('pull', 'Pull')],
      ),
    );

    expect(find.byKey(const Key('routines-suggested-templates')), findsNothing);
  });

  testWidgets('template tap delegates selected template', (tester) async {
    RoutineTemplateSummary? selectedTemplate;

    await tester.pumpRoutinesScreen(
      initialState: RoutineListState.empty,
      onOpenTemplate: (template) async => selectedTemplate = template,
    );

    await tester.tap(find.byKey(const Key('routine-template-upperLower')));
    await tester.pump();

    expect(selectedTemplate?.kind, RoutineTemplateKind.upperLower);
  });
}

RoutineWithCounts _routine(
  String id,
  String name, {
  int dayCount = 1,
  int exerciseCount = 5,
}) {
  return RoutineWithCounts(
    routine: RoutineEntity(
      id: id,
      name: name,
      description: null,
      goal: null,
      isArchived: false,
      sortOrder: 0,
      createdAt: null,
      updatedAt: null,
    ),
    dayCount: dayCount,
    exerciseCount: exerciseCount,
  );
}

extension on WidgetTester {
  Future<void> pumpRoutinesScreen({
    RoutineListState? initialState,
    Future<RoutineListState> Function()? loadRoutines,
    Future<RoutineListState> Function(
      RoutineListState state,
      RoutineWithCounts routine,
    )?
    onArchiveRoutine,
    Future<RoutineListState> Function(RoutineListState state)? onUndoArchive,
    Future<void> Function(RoutineWithCounts routine)? onOpenRoutine,
    Future<void> Function()? onCreateRoutine,
    Future<void> Function(RoutineTemplateSummary template)? onOpenTemplate,
  }) {
    return pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: RoutinesScreen(
          key: UniqueKey(),
          initialState: initialState,
          loadRoutines: loadRoutines ?? () async => RoutineListState.empty,
          onArchiveRoutine:
              onArchiveRoutine ??
              (state, routine) async => state.copyWith(
                routines: state.routines
                    .where((item) => item.routine.id != routine.routine.id)
                    .toList(),
                archivedRoutine: routine,
              ),
          onUndoArchive:
              onUndoArchive ??
              (state) async => state.copyWith(clearArchivedRoutine: true),
          onOpenRoutine: onOpenRoutine ?? (_) async {},
          onCreateRoutine: onCreateRoutine ?? () async {},
          onOpenTemplate: onOpenTemplate ?? (_) async {},
        ),
      ),
    );
  }
}
