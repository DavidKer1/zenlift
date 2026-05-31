import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/workout/application/active_workout_controller.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/presentation/workout_summary_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    WorkoutSummary? summary,
    WorkoutSummaryAction? onGoHome,
    WorkoutSummaryAction? onGoHistory,
    WorkoutSummaryNotesSaver? onSaveNotes,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: WorkoutSummaryScreen(
        summary: summary,
        onGoHome: onGoHome ?? () async {},
        onGoHistory: onGoHistory ?? () async {},
        onSaveNotes: onSaveNotes,
      ),
    );
  }

  testWidgets('renders completed workout stats and PRs', (tester) async {
    await tester.pumpWidget(buildSubject(summary: _summary()));

    expect(find.text('Workout complete'), findsOneWidget);
    expect(find.text('1h 15m'), findsOneWidget);
    expect(find.text('Push day'), findsOneWidget);
    expect(find.text('4800 kg'), findsOneWidget);
    expect(find.text('3'), findsOneWidget);
    expect(find.text('12'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.byKey(const Key('workout-summary-pr-card')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    expect(find.text('Personal records'), findsOneWidget);
    expect(find.text('Bench Press'), findsOneWidget);
    expect(find.text('Max Weight'), findsOneWidget);
    expect(find.text('100 kg'), findsOneWidget);
  });

  testWidgets('navigation callbacks are injected', (tester) async {
    var homeCalls = 0;
    var historyCalls = 0;

    await tester.pumpWidget(
      buildSubject(
        summary: _summary(),
        onGoHome: () async => homeCalls += 1,
        onGoHistory: () async => historyCalls += 1,
      ),
    );

    await tester.scrollUntilVisible(
      find.byKey(const Key('workout-summary-home-button')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.byKey(const Key('workout-summary-home-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('workout-summary-history-button')));
    await tester.pumpAndSettle();

    expect(homeCalls, 1);
    expect(historyCalls, 1);
  });

  testWidgets('notes are saved through injected callback', (tester) async {
    var savedNotes = '';

    await tester.pumpWidget(
      buildSubject(
        summary: _summary(),
        onSaveNotes: (value) async => savedNotes = value,
      ),
    );

    await tester.scrollUntilVisible(
      find.byKey(const Key('workout-summary-notes-field')),
      500,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.enterText(
      find.byKey(const Key('workout-summary-notes-field')),
      'Felt strong',
    );
    await tester.tap(
      find.byKey(const Key('workout-summary-save-notes-button')),
    );
    await tester.pumpAndSettle();

    expect(savedNotes, 'Felt strong');
    expect(find.text('Notes saved.'), findsOneWidget);
  });

  testWidgets('unavailable state returns home', (tester) async {
    var homeCalls = 0;

    await tester.pumpWidget(buildSubject(onGoHome: () async => homeCalls += 1));

    expect(find.text('Summary unavailable'), findsOneWidget);
    await tester.tap(
      find.byKey(const Key('workout-summary-unavailable-home-button')),
    );
    await tester.pumpAndSettle();

    expect(homeCalls, 1);
  });
}

WorkoutSummary _summary() {
  return WorkoutSummary(
    sessionId: 'session-1',
    routineId: 'routine-1',
    routineDayId: 'day-1',
    name: 'Push day',
    startedAt: DateTime(2026, 5, 30, 9),
    endedAt: DateTime(2026, 5, 30, 10, 15),
    durationSeconds: 4500,
    exerciseCount: 3,
    completedSetCount: 12,
    totalVolume: 4800,
    personalRecordCount: 1,
    personalRecords: const <DetectedPersonalRecord>[
      DetectedPersonalRecord(
        exerciseId: 'bench',
        exerciseName: 'Bench Press',
        type: PersonalRecordType.maxWeight,
        value: 100,
        previousBest: 95,
      ),
    ],
  );
}
