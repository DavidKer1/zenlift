import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/home/domain/home_dashboard.dart';
import 'package:zenlift/features/home/presentation/home_screen.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    HomeDashboardState? initialState,
    HomeDashboardLoader? loadDashboard,
    HomeAction? onStartWorkout,
    HomeAction? onQuickWorkout,
    HomeAction? onCreateRoutine,
    HomeRoutineAction? onOpenRoutine,
    HomeRepeatWorkoutAction? onRepeatWorkout,
    DateTime? now,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: Scaffold(
        body: HomeScreen(
          initialState: initialState,
          loadDashboard: loadDashboard ?? () async => HomeDashboardState.empty,
          onStartWorkout: onStartWorkout ?? () async {},
          onQuickWorkout: onQuickWorkout ?? () async {},
          onCreateRoutine: onCreateRoutine ?? () async {},
          onOpenRoutine: onOpenRoutine ?? (_) async {},
          onRepeatWorkout: onRepeatWorkout ?? (_) async {},
          now: now == null ? null : () => now,
        ),
      ),
    );
  }

  testWidgets('renders Home dashboard sections in order', (tester) async {
    await tester.pumpWidget(
      buildSubject(
        initialState: _dashboardState(),
        now: DateTime(2026, 5, 30, 9),
      ),
    );

    expect(find.text('Buenos días'), findsOneWidget);
    expect(find.text('Start Workout'), findsOneWidget);
    expect(find.text('Quick Workout'), findsOneWidget);
    expect(find.text('Workout calendar'), findsOneWidget);
    expect(find.text('Weekly activity'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Current routine'), 500);
    await tester.pumpAndSettle();
    expect(find.text('Current routine'), findsOneWidget);
    expect(find.text('Recent PRs'), findsOneWidget);
    expect(find.text('Strength A'), findsOneWidget);
    expect(find.text('Bench Press'), findsOneWidget);
  });

  testWidgets('Home action buttons call injected callbacks', (tester) async {
    var startCalls = 0;
    var quickCalls = 0;
    var repeatCalls = 0;
    var openedRoutineId = '';

    await tester.pumpWidget(
      buildSubject(
        initialState: _dashboardState(),
        onStartWorkout: () async => startCalls += 1,
        onQuickWorkout: () async => quickCalls += 1,
        onOpenRoutine: (routine) async => openedRoutineId = routine.id,
        onRepeatWorkout: (workout) async => repeatCalls += 1,
      ),
    );

    await tester.tap(find.byKey(const Key('home-start-workout-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('home-quick-workout-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('home-repeat-workout-button')));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.byKey(const Key('home-open-routine-button')),
      500,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('home-open-routine-button')));
    await tester.pumpAndSettle();

    expect(startCalls, 1);
    expect(quickCalls, 1);
    expect(repeatCalls, 1);
    expect(openedRoutineId, 'routine-1');
  });

  testWidgets('renders designed empty states', (tester) async {
    var createCalls = 0;

    await tester.pumpWidget(
      buildSubject(
        initialState: HomeDashboardState.empty,
        onCreateRoutine: () async => createCalls += 1,
        now: DateTime(2026, 5, 30, 22),
      ),
    );

    expect(find.text('Buenas noches'), findsOneWidget);
    expect(find.text('No workouts completed yet'), findsOneWidget);
    expect(find.text('No activity this week'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('No routine set'), 500);
    await tester.pumpAndSettle();
    expect(find.text('No routine set'), findsOneWidget);
    expect(find.text('No personal records yet'), findsOneWidget);

    await tester.tap(find.byKey(const Key('home-create-routine-button')));
    await tester.pumpAndSettle();
    expect(createCalls, 1);
  });
}

HomeDashboardState _dashboardState() {
  return HomeDashboardState(
    calendar: HomeCalendarSummary(
      activityDates: <DateTime>[DateTime(2026, 5, 25), DateTime(2026, 5, 27)],
      latestWorkout: HomeLatestWorkout(
        sessionId: 'session-1',
        title: 'Push day',
        frequencyCount: 2,
        frequencyKind: HomeWorkoutFrequencyKind.matchingRoutineContext,
        routineId: 'routine-1',
        routineDayId: 'day-1',
        startedAt: DateTime(2026, 5, 27),
      ),
    ),
    weeklyActivity: const HomeWeeklyActivity(
      activeDays: <bool>[true, false, true, false, false, false, false],
      workoutCount: 2,
    ),
    currentRoutine: const HomeRoutineSummary(
      id: 'routine-1',
      name: 'Strength A',
      dayCount: 4,
      exerciseCount: 18,
    ),
    recentPersonalRecords: <HomePersonalRecordSummary>[
      HomePersonalRecordSummary(
        id: 'pr-1',
        exerciseName: 'Bench Press',
        type: PersonalRecordType.maxWeight,
        value: 100,
        weight: 100,
        reps: 1,
        achievedAt: DateTime(2026, 5, 27),
      ),
    ],
  );
}
