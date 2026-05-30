import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/settings/domain/settings_preferences.dart';
import 'package:zenlift/features/settings/domain/units.dart';
import 'package:zenlift/features/settings/presentation/settings_screen.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  Widget buildSubject({
    Size size = const Size(390, 844),
    SettingsPreferences? initialPreferences,
    SaveSettingsWeightUnit? onWeightUnitSaved,
    SaveSettingsThemeMode? onThemeModeSaved,
    SaveSettingsWeeklyGoal? onWeeklyGoalSaved,
    SettingsDataAction? onExportData,
    SettingsDataAction? onImportData,
    SettingsDataAction? onDeleteData,
  }) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: MediaQuery(
        data: MediaQueryData(size: size),
        child: Scaffold(
          body: SettingsScreen(
            initialPreferences: initialPreferences,
            onWeightUnitSaved: onWeightUnitSaved,
            onThemeModeSaved: onThemeModeSaved,
            onWeeklyGoalSaved: onWeeklyGoalSaved,
            onExportData: onExportData,
            onImportData: onImportData,
            onDeleteData: onDeleteData,
          ),
        ),
      ),
    );
  }

  testWidgets('initial preferences render selected unit theme and goal', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        initialPreferences: SettingsPreferences.defaults().copyWith(
          weightUnit: WeightUnit.lb,
          themeMode: ZenliftThemeMode.system,
          weeklyGoal: 5,
        ),
      ),
    );

    expect(find.text('Settings'), findsOneWidget);
    expect(find.text('5'), findsOneWidget);
    expect(
      tester.getSemantics(find.byKey(const Key('settings-unit-lb'))),
      matchesSemantics(
        label: 'Use pounds',
        isButton: true,
        hasSelectedState: true,
        isSelected: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );
    expect(
      tester.getSemantics(find.byKey(const Key('settings-theme-system'))),
      matchesSemantics(
        label: 'Use system theme',
        isButton: true,
        hasSelectedState: true,
        isSelected: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );
    handle.dispose();
  });

  testWidgets('tapping lb saves and updates selected state', (tester) async {
    final savedUnits = <WeightUnit>[];
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(onWeightUnitSaved: (unit) async => savedUnits.add(unit)),
    );

    await tester.tap(find.byKey(const Key('settings-unit-lb')));
    await tester.pumpAndSettle();

    expect(savedUnits, <WeightUnit>[WeightUnit.lb]);
    expect(
      tester.getSemantics(find.byKey(const Key('settings-unit-lb'))),
      matchesSemantics(
        label: 'Use pounds',
        isButton: true,
        hasSelectedState: true,
        isSelected: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );
    handle.dispose();
  });

  testWidgets('tapping system theme saves and updates selected state', (
    tester,
  ) async {
    final savedModes = <ZenliftThemeMode>[];
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(onThemeModeSaved: (mode) async => savedModes.add(mode)),
    );

    await tester.tap(find.byKey(const Key('settings-theme-system')));
    await tester.pumpAndSettle();

    expect(savedModes, <ZenliftThemeMode>[ZenliftThemeMode.system]);
    expect(
      tester.getSemantics(find.byKey(const Key('settings-theme-system'))),
      matchesSemantics(
        label: 'Use system theme',
        isButton: true,
        hasSelectedState: true,
        isSelected: true,
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
    final savedGoals = <int>[];
    await tester.pumpWidget(
      buildSubject(
        initialPreferences: SettingsPreferences.defaults().copyWith(
          weeklyGoal: 1,
        ),
        onWeeklyGoalSaved: (goal) async => savedGoals.add(goal),
      ),
    );

    expect(find.text('1'), findsOneWidget);
    await tester.tap(find.byKey(const Key('settings-weekly-goal-decrement')));
    await tester.pumpAndSettle();
    expect(savedGoals, isEmpty);

    for (var index = 0; index < 6; index += 1) {
      await tester.tap(find.byKey(const Key('settings-weekly-goal-increment')));
      await tester.pumpAndSettle();
    }

    expect(savedGoals, <int>[2, 3, 4, 5, 6, 7]);
    expect(find.text('7'), findsOneWidget);
    final countBeforeBoundaryTap = savedGoals.length;
    await tester.tap(find.byKey(const Key('settings-weekly-goal-increment')));
    await tester.pumpAndSettle();
    expect(savedGoals.length, countBeforeBoundaryTap);
  });

  testWidgets('in-flight preference save prevents overlapping saves', (
    tester,
  ) async {
    final lbSave = Completer<void>();
    final savedUnits = <WeightUnit>[];

    await tester.pumpWidget(
      buildSubject(
        initialPreferences: SettingsPreferences.defaults().copyWith(
          weightUnit: WeightUnit.kg,
        ),
        onWeightUnitSaved: (unit) {
          savedUnits.add(unit);
          return lbSave.future;
        },
      ),
    );

    await tester.tap(find.byKey(const Key('settings-unit-lb')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('settings-unit-kg')));
    await tester.pump();

    expect(savedUnits, <WeightUnit>[WeightUnit.lb]);

    lbSave.complete();
    await tester.pumpAndSettle();

    final handle = tester.ensureSemantics();
    expect(
      tester.getSemantics(find.byKey(const Key('settings-unit-lb'))),
      matchesSemantics(
        label: 'Use pounds',
        isButton: true,
        hasSelectedState: true,
        isSelected: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );
    handle.dispose();
  });

  testWidgets('data action buttons call callbacks when provided', (
    tester,
  ) async {
    final actions = <String>[];
    await tester.pumpWidget(
      buildSubject(
        onExportData: () async => actions.add('export'),
        onImportData: () async => actions.add('import'),
        onDeleteData: () async => actions.add('delete'),
      ),
    );

    await tester.ensureVisible(find.byKey(const Key('settings-export-button')));
    await tester.tap(find.byKey(const Key('settings-export-button')));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.byKey(const Key('settings-import-button')));
    await tester.tap(find.byKey(const Key('settings-import-button')));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.byKey(const Key('settings-delete-button')));
    await tester.tap(find.byKey(const Key('settings-delete-button')));
    await tester.pumpAndSettle();
    expect(actions, <String>['export', 'import']);
    expect(find.text('Confirm delete'), findsOneWidget);

    await tester.tap(find.byKey(const Key('settings-delete-button')));
    await tester.pumpAndSettle();

    expect(actions, <String>['export', 'import', 'delete']);
  });

  testWidgets('data actions are disabled while one action is in flight', (
    tester,
  ) async {
    final exportCompleter = Completer<void>();
    var exportCount = 0;

    await tester.pumpWidget(
      buildSubject(
        onExportData: () {
          exportCount += 1;
          return exportCompleter.future;
        },
        onImportData: () async {},
      ),
    );

    await tester.ensureVisible(find.byKey(const Key('settings-export-button')));
    await tester.tap(find.byKey(const Key('settings-export-button')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('settings-export-button')));
    await tester.pump();

    expect(exportCount, 1);

    exportCompleter.complete();
    await tester.pumpAndSettle();
  });

  testWidgets('data action buttons are disabled when callbacks are absent', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(buildSubject());
    await tester.ensureVisible(find.byKey(const Key('settings-export-button')));
    await tester.pumpAndSettle();

    expect(
      tester.getSemantics(find.byKey(const Key('settings-export-button'))),
      matchesSemantics(
        label: 'Export Zenlift data',
        isButton: true,
        hasEnabledState: true,
        isEnabled: false,
      ),
    );
    handle.dispose();
  });

  testWidgets('small mobile width does not overflow', (tester) async {
    await tester.binding.setSurfaceSize(const Size(260, 700));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(buildSubject(size: const Size(260, 700)));
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(
      find.byKey(const Key('settings-weekly-goal-decrement')),
      findsOneWidget,
    );
    expect(find.byKey(const Key('settings-export-button')), findsOneWidget);
  });

  testWidgets('interactive controls meet accessibility guidelines', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        onExportData: () async {},
        onImportData: () async {},
        onDeleteData: () async {},
      ),
    );

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });
}
