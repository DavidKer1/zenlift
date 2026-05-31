import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:zenlift/app/router.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  test('route catalog includes the mobile route map', () {
    expect(
      ZenliftRoutes.catalog,
      containsAll(<String>[
        ZenliftRoutes.onboarding,
        ZenliftRoutes.home,
        ZenliftRoutes.routines,
        ZenliftRoutes.exerciseLibrary,
        ZenliftRoutes.history,
        ZenliftRoutes.settings,
        ZenliftRoutes.routineDetail,
        ZenliftRoutes.routineCreate,
        ZenliftRoutes.routineEdit,
        ZenliftRoutes.exerciseDetail,
        ZenliftRoutes.activeWorkout,
        ZenliftRoutes.workoutSummary,
      ]),
    );
  });

  testWidgets(
    'initial route renders the Home placeholder inside the tab shell',
    (tester) async {
      await tester.pumpZenliftRoute();

      expect(find.byKey(ZenliftRouteKeys.tabShell), findsOneWidget);
      expect(find.byKey(ZenliftRouteKeys.homeScreen), findsOneWidget);
      expect(selectedTabIndex(tester), 0);
    },
  );

  for (final tabCase in <({String path, Key screenKey, int selectedIndex})>[
    (
      path: ZenliftRoutes.home,
      screenKey: ZenliftRouteKeys.homeScreen,
      selectedIndex: 0,
    ),
    (
      path: ZenliftRoutes.routines,
      screenKey: ZenliftRouteKeys.routinesScreen,
      selectedIndex: 1,
    ),
    (
      path: ZenliftRoutes.exerciseLibrary,
      screenKey: ZenliftRouteKeys.exerciseLibraryScreen,
      selectedIndex: 2,
    ),
    (
      path: ZenliftRoutes.history,
      screenKey: ZenliftRouteKeys.historyScreen,
      selectedIndex: 3,
    ),
    (
      path: ZenliftRoutes.settings,
      screenKey: ZenliftRouteKeys.settingsScreen,
      selectedIndex: 4,
    ),
  ]) {
    testWidgets('${tabCase.path} selects its tab and renders its placeholder', (
      tester,
    ) async {
      await tester.pumpZenliftRoute(initialLocation: tabCase.path);

      expect(find.byKey(ZenliftRouteKeys.tabShell), findsOneWidget);
      expect(find.byKey(tabCase.screenKey), findsOneWidget);
      expect(selectedTabIndex(tester), tabCase.selectedIndex);
    });
  }

  testWidgets('bottom navigation taps switch tab routes inside the shell', (
    tester,
  ) async {
    await tester.pumpZenliftRoute();

    for (final tabCase in <({Key tabKey, Key screenKey, int selectedIndex})>[
      (
        tabKey: ZenliftRouteKeys.routinesTab,
        screenKey: ZenliftRouteKeys.routinesScreen,
        selectedIndex: 1,
      ),
      (
        tabKey: ZenliftRouteKeys.exerciseTab,
        screenKey: ZenliftRouteKeys.exerciseLibraryScreen,
        selectedIndex: 2,
      ),
      (
        tabKey: ZenliftRouteKeys.historyTab,
        screenKey: ZenliftRouteKeys.historyScreen,
        selectedIndex: 3,
      ),
      (
        tabKey: ZenliftRouteKeys.settingsTab,
        screenKey: ZenliftRouteKeys.settingsScreen,
        selectedIndex: 4,
      ),
      (
        tabKey: ZenliftRouteKeys.homeTab,
        screenKey: ZenliftRouteKeys.homeScreen,
        selectedIndex: 0,
      ),
    ]) {
      await tester.tap(find.byKey(tabCase.tabKey));
      await tester.pumpAndSettle();

      expect(find.byKey(ZenliftRouteKeys.tabShell), findsOneWidget);
      expect(find.byKey(tabCase.screenKey), findsOneWidget);
      expect(selectedTabIndex(tester), tabCase.selectedIndex);
    }
  });

  for (final detailCase
      in <({String path, Key screenKey, List<String> expectedTexts})>[
        (
          path: '/routine/strength-a',
          screenKey: ZenliftRouteKeys.routineDetailScreen,
          expectedTexts: <String>['Routine detail', 'strength-a'],
        ),
        (
          path: ZenliftRoutes.routineCreate,
          screenKey: ZenliftRouteKeys.routineCreateScreen,
          expectedTexts: <String>['Create routine'],
        ),
        (
          path: '/routine/edit/strength-a',
          screenKey: ZenliftRouteKeys.routineEditScreen,
          expectedTexts: <String>['Edit routine', 'strength-a'],
        ),
        (
          path: '/exercise/bench-press',
          screenKey: ZenliftRouteKeys.exerciseDetailScreen,
          expectedTexts: <String>['Exercise detail', 'bench-press'],
        ),
        (
          path: ZenliftRoutes.activeWorkout,
          screenKey: ZenliftRouteKeys.activeWorkoutScreen,
          expectedTexts: <String>['Active workout'],
        ),
        (
          path: ZenliftRoutes.workoutSummary,
          screenKey: ZenliftRouteKeys.workoutSummaryScreen,
          expectedTexts: <String>['Workout summary'],
        ),
        (
          path: ZenliftRoutes.onboarding,
          screenKey: ZenliftRouteKeys.onboardingScreen,
          expectedTexts: <String>['Welcome to Zenlift'],
        ),
      ]) {
    testWidgets('${detailCase.path} renders outside the tab shell', (
      tester,
    ) async {
      await tester.pumpZenliftRoute(initialLocation: detailCase.path);

      expect(find.byKey(ZenliftRouteKeys.tabShell), findsNothing);
      expect(find.byKey(detailCase.screenKey), findsOneWidget);
      for (final expectedText in detailCase.expectedTexts) {
        expect(find.text(expectedText), findsOneWidget);
      }
    });
  }

  testWidgets('standalone route pop returns to the previous tab route', (
    tester,
  ) async {
    final router = buildTestRouter(initialLocation: ZenliftRoutes.routines);
    await tester.pumpWidget(
      MaterialApp.router(theme: buildZenliftDarkTheme(), routerConfig: router),
    );

    router.push(ZenliftRoutes.activeWorkout);
    await tester.pumpAndSettle();

    expect(find.byKey(ZenliftRouteKeys.tabShell), findsNothing);
    expect(find.byKey(ZenliftRouteKeys.activeWorkoutScreen), findsOneWidget);

    router.pop();
    await tester.pumpAndSettle();

    expect(find.byKey(ZenliftRouteKeys.tabShell), findsOneWidget);
    expect(find.byKey(ZenliftRouteKeys.routinesScreen), findsOneWidget);
    expect(selectedTabIndex(tester), 1);
  });
}

extension on WidgetTester {
  Future<void> pumpZenliftRoute({String initialLocation = ZenliftRoutes.home}) {
    return pumpWidget(
      MaterialApp.router(
        theme: buildZenliftDarkTheme(),
        routerConfig: buildTestRouter(initialLocation: initialLocation),
      ),
    );
  }
}

GoRouter buildTestRouter({String initialLocation = ZenliftRoutes.home}) {
  return buildZenliftRouter(
    initialLocation: initialLocation,
    activeWorkoutBuilder: (context) => const _ActiveWorkoutRouteStub(
      key: ZenliftRouteKeys.activeWorkoutScreen,
    ),
  );
}

class _ActiveWorkoutRouteStub extends StatelessWidget {
  const _ActiveWorkoutRouteStub({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Active workout')));
  }
}

int selectedTabIndex(WidgetTester tester) {
  return tester
      .widget<NavigationBar>(find.byKey(ZenliftRouteKeys.navigationBar))
      .selectedIndex;
}
