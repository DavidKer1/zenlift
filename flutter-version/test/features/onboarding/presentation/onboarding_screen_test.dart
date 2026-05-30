import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/onboarding/presentation/onboarding_screen.dart';
import 'package:zenlift/features/settings/domain/settings_preferences.dart';
import 'package:zenlift/features/settings/domain/units.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    Size size = const Size(390, 844),
    SettingsPreferences? initialPreferences,
    SaveWeightUnit? onWeightUnitSaved,
    SaveWeeklyGoal? onWeeklyGoalSaved,
    CompleteOnboarding? onOnboardingCompleted,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: MediaQuery(
        data: MediaQueryData(size: size),
        child: Scaffold(
          body: OnboardingScreen(
            initialPreferences: initialPreferences,
            onWeightUnitSaved: onWeightUnitSaved,
            onWeeklyGoalSaved: onWeeklyGoalSaved,
            onOnboardingCompleted: onOnboardingCompleted,
          ),
        ),
      ),
    );
  }

  testWidgets('initial welcome step renders', (tester) async {
    await tester.pumpWidget(buildSubject());

    expect(find.text('Welcome to Zenlift'), findsOneWidget);
    expect(find.byKey(const Key('onboarding-start-button')), findsOneWidget);
    expect(find.text('Choose units'), findsNothing);
  });

  testWidgets('tapping start advances to unit step', (tester) async {
    await tester.pumpWidget(buildSubject());

    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();

    expect(find.text('Choose units'), findsOneWidget);
    expect(find.byKey(const Key('onboarding-unit-kg')), findsOneWidget);
    expect(find.byKey(const Key('onboarding-unit-lb')), findsOneWidget);
  });

  testWidgets('selecting lb updates selected state', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(buildSubject());

    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-lb')));
    await tester.pumpAndSettle();

    expect(
      tester.getSemantics(find.byKey(const Key('onboarding-unit-lb'))),
      matchesSemantics(
        label: 'Use pounds',
        isButton: true,
        isSelected: true,
        hasSelectedState: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );
    handle.dispose();
  });

  testWidgets('weekly goal clamps at 1 and 7', (tester) async {
    await tester.pumpWidget(
      buildSubject(
        initialPreferences: SettingsPreferences.defaults().copyWith(
          weeklyGoal: 1,
        ),
      ),
    );

    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-next-button')));
    await tester.pumpAndSettle();

    expect(find.text('1'), findsOneWidget);
    await tester.tap(find.byKey(const Key('onboarding-goal-decrement')));
    await tester.pumpAndSettle();
    expect(find.text('1'), findsOneWidget);

    for (var index = 0; index < 8; index += 1) {
      await tester.tap(find.byKey(const Key('onboarding-goal-increment')));
      await tester.pump();
    }

    expect(find.text('7'), findsOneWidget);
    await tester.tap(find.byKey(const Key('onboarding-goal-increment')));
    await tester.pumpAndSettle();
    expect(find.text('7'), findsOneWidget);
  });

  testWidgets('completing saves selected settings in order', (tester) async {
    final calls = <Object>[];
    await tester.pumpWidget(
      buildSubject(
        onWeightUnitSaved: (unit) async => calls.add(unit),
        onWeeklyGoalSaved: (goal) async => calls.add(goal),
        onOnboardingCompleted: () async => calls.add('completed'),
      ),
    );

    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-lb')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-next-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-goal-increment')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-complete-button')));
    await tester.pumpAndSettle();

    expect(calls, <Object>[WeightUnit.lb, 4, 'completed']);
  });

  testWidgets('failed completion shows retryable error without completing', (
    tester,
  ) async {
    var attempts = 0;
    await tester.pumpWidget(
      buildSubject(
        onWeightUnitSaved: (_) {
          attempts += 1;
          throw StateError('disk full');
        },
      ),
    );

    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-next-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-complete-button')));
    await tester.pumpAndSettle();

    expect(attempts, 1);
    expect(find.text('Setup could not be saved. Try again.'), findsOneWidget);
    expect(find.text('You are ready'), findsNothing);

    await tester.tap(find.byKey(const Key('onboarding-complete-button')));
    await tester.pumpAndSettle();

    expect(attempts, 2);
  });

  testWidgets('in-flight completion disables finish and prevents duplicates', (
    tester,
  ) async {
    final saveCompleter = Completer<void>();
    var saveAttempts = 0;

    await tester.pumpWidget(
      buildSubject(
        onWeightUnitSaved: (_) {
          saveAttempts += 1;
          return saveCompleter.future;
        },
      ),
    );

    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-next-button')));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('onboarding-complete-button')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('onboarding-complete-button')));
    await tester.pump();

    expect(saveAttempts, 1);
    expect(find.text('Saving...'), findsOneWidget);

    saveCompleter.complete();
    await tester.pumpAndSettle();

    expect(find.text('You are ready'), findsOneWidget);
  });

  testWidgets('small mobile width does not overflow core controls', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(260, 620));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(buildSubject(size: const Size(260, 620)));
    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-next-button')));
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.byKey(const Key('onboarding-goal-decrement')), findsOneWidget);
    expect(find.byKey(const Key('onboarding-goal-increment')), findsOneWidget);
    expect(find.byKey(const Key('onboarding-complete-button')), findsOneWidget);
  });

  testWidgets('interactive controls meet tap target and label guidelines', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(buildSubject());
    await tester.tap(find.byKey(const Key('onboarding-start-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('onboarding-unit-next-button')));
    await tester.pumpAndSettle();

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });
}
