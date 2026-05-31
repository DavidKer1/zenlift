import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/history/domain/history_dashboard.dart';
import 'package:zenlift/features/history/presentation/history_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    HistoryDashboardState? initialState,
    HistoryDashboardLoader? loadHistory,
    HistoryAction? onStartWorkout,
    HistoryWorkoutAction? onRepeatWorkout,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: Scaffold(
        body: HistoryScreen(
          initialState: initialState,
          loadHistory: loadHistory ?? () async => HistoryDashboardState.empty,
          onStartWorkout: onStartWorkout ?? () async {},
          onRepeatWorkout: onRepeatWorkout ?? (_) async {},
        ),
      ),
    );
  }

  testWidgets('renders completed workout summaries', (tester) async {
    await tester.pumpWidget(buildSubject(initialState: _historyState()));

    expect(find.text('History'), findsOneWidget);
    expect(find.text('Push day'), findsOneWidget);
    expect(find.textContaining('Upper'), findsOneWidget);
    expect(find.text('1h 15m'), findsOneWidget);
    expect(find.text('2 exercises'), findsOneWidget);
    expect(find.text('5 sets'), findsOneWidget);
    expect(find.text('3200 kg'), findsOneWidget);
    expect(find.text('2 PRs'), findsOneWidget);
  });

  testWidgets('repeat workout uses injected callback', (tester) async {
    var repeatedId = '';

    await tester.pumpWidget(
      buildSubject(
        initialState: _historyState(),
        onRepeatWorkout: (workout) async => repeatedId = workout.sessionId,
      ),
    );

    await tester.tap(find.byKey(const Key('history-repeat-session-1')));
    await tester.pumpAndSettle();

    expect(repeatedId, 'session-1');
  });

  testWidgets('empty state starts workout through injected callback', (
    tester,
  ) async {
    var startCalls = 0;

    await tester.pumpWidget(
      buildSubject(
        initialState: HistoryDashboardState.empty,
        onStartWorkout: () async => startCalls += 1,
      ),
    );

    expect(find.text('No workouts yet'), findsOneWidget);
    await tester.tap(find.byKey(const Key('history-empty-start-button')));
    await tester.pumpAndSettle();

    expect(startCalls, 1);
  });
}

HistoryDashboardState _historyState() {
  return HistoryDashboardState(
    workouts: <HistoryWorkoutSummary>[
      HistoryWorkoutSummary(
        sessionId: 'session-1',
        title: 'Push day',
        startedAt: DateTime(2026, 5, 30, 9),
        durationSeconds: 4500,
        exerciseCount: 2,
        completedSetCount: 5,
        totalVolume: 3200,
        personalRecordCount: 2,
        routineId: 'routine-1',
        routineDayId: 'day-1',
        routineName: 'Strength A',
        routineDayName: 'Upper',
      ),
    ],
  );
}
