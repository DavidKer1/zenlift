# Flutter Tab State Preservation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve each bottom tab's widget/navigation state when switching tabs.

**Architecture:** Replace the current single-child `ShellRoute` with `StatefulShellRoute.indexedStack`, the `go_router` pattern that keeps one nested `Navigator` per tab branch. Keep the existing `NavigationBar` component, but drive it from `StatefulNavigationShell.currentIndex` and `StatefulNavigationShell.goBranch` instead of recomputing selection from a path string.

**Tech Stack:** Flutter 3.44.0, Dart 3.12.0, go_router 17.2.3, flutter_test.

---

## File Structure

- Modify `test/navigation/router_test.dart`: add a regression test proving a stateful tab widget keeps its local state after leaving and returning to the tab.
- Modify `lib/features/home/presentation/zenlift_tab_shell.dart`: accept `StatefulNavigationShell`, render it as the `Scaffold.body`, and switch tabs with `goBranch`.
- Modify `lib/app/router.dart`: replace the `ShellRoute` with `StatefulShellRoute.indexedStack` and convert each tab destination into a `StatefulShellBranch`.

### Task 1: Add State Preservation Regression Test

**Files:**
- Modify: `test/navigation/router_test.dart`

- [ ] **Step 1: Add a test-only key**

Add this constant after the imports:

```dart
const _homeCounterButtonKey = ValueKey('test.homeCounterButton');
```

- [ ] **Step 2: Add the failing widget test**

Add this test after `bottom navigation tab switches do not overlap route pages`:

```dart
  testWidgets('bottom navigation preserves tab widget state between switches', (
    tester,
  ) async {
    await tester.pumpZenliftRoute();

    expect(find.text('Home counter: 0'), findsOneWidget);

    await tester.tap(find.byKey(_homeCounterButtonKey));
    await tester.pump();

    expect(find.text('Home counter: 1'), findsOneWidget);

    await tester.tap(find.byKey(ZenliftRouteKeys.historyTab));
    await tester.pumpAndSettle();

    expect(find.byKey(ZenliftRouteKeys.historyScreen), findsOneWidget);

    await tester.tap(find.byKey(ZenliftRouteKeys.homeTab));
    await tester.pumpAndSettle();

    expect(find.text('Home counter: 1'), findsOneWidget);
  });
```

- [ ] **Step 3: Make the home test stub stateful**

Replace `_HomeRouteStub` with:

```dart
class _HomeRouteStub extends StatefulWidget {
  const _HomeRouteStub({super.key});

  @override
  State<_HomeRouteStub> createState() => _HomeRouteStubState();
}

class _HomeRouteStubState extends State<_HomeRouteStub> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Home counter: $_count'),
            TextButton(
              key: _homeCounterButtonKey,
              onPressed: () => setState(() => _count += 1),
              child: const Text('Increment home counter'),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
flutter test test/navigation/router_test.dart --plain-name "bottom navigation preserves tab widget state between switches"
```

Expected: FAIL because returning to Home shows `Home counter: 0`.

### Task 2: Move The Tab Shell To `StatefulShellRoute.indexedStack`

**Files:**
- Modify: `lib/features/home/presentation/zenlift_tab_shell.dart`
- Modify: `lib/app/router.dart`

- [ ] **Step 1: Update `ZenliftTabShell`**

Replace `lib/features/home/presentation/zenlift_tab_shell.dart` with:

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ZenliftTabShell extends StatelessWidget {
  const ZenliftTabShell({
    required this.navigationBarKey,
    required this.navigationShell,
    required this.destinations,
    super.key,
  });

  final Key navigationBarKey;
  final StatefulNavigationShell navigationShell;
  final List<ZenliftTabDestination> destinations;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        key: navigationBarKey,
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: navigationShell.goBranch,
        destinations: [
          for (final tab in destinations)
            NavigationDestination(
              key: tab.key,
              icon: Icon(tab.icon),
              selectedIcon: Icon(tab.selectedIcon),
              label: tab.label,
            ),
        ],
      ),
    );
  }
}

class ZenliftTabDestination {
  const ZenliftTabDestination({
    required this.path,
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.key,
  });

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final Key key;
}
```

- [ ] **Step 2: Replace the `ShellRoute` with `StatefulShellRoute.indexedStack`**

In `lib/app/router.dart`, replace the existing `ShellRoute(...)` block with:

```dart
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => ZenliftTabShell(
          key: ZenliftRouteKeys.tabShell,
          navigationBarKey: ZenliftRouteKeys.navigationBar,
          navigationShell: navigationShell,
          destinations: _zenliftTabDestinations,
        ),
        branches: <StatefulShellBranch>[
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: ZenliftRoutes.home,
                builder: (context, state) =>
                    homeBuilder?.call(context) ??
                    const HomeRoute(key: ZenliftRouteKeys.homeScreen),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: ZenliftRoutes.routines,
                builder: (context, state) =>
                    routinesBuilder?.call(context) ??
                    const RoutinesRoute(key: ZenliftRouteKeys.routinesScreen),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: ZenliftRoutes.exerciseLibrary,
                builder: (context, state) =>
                    exerciseLibraryBuilder?.call(context) ??
                    const ExerciseLibraryRoute(
                      key: ZenliftRouteKeys.exerciseLibraryScreen,
                    ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: ZenliftRoutes.history,
                builder: (context, state) =>
                    historyBuilder?.call(context) ??
                    const HistoryRoute(key: ZenliftRouteKeys.historyScreen),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: ZenliftRoutes.settings,
                builder: (context, state) =>
                    settingsBuilder?.call(context) ??
                    const SettingsRoute(key: ZenliftRouteKeys.settingsScreen),
              ),
            ],
          ),
        ],
      ),
```

- [ ] **Step 3: Remove `_buildTabPage`**

Delete this helper from `lib/app/router.dart`:

```dart
Page<void> _buildTabPage(GoRouterState state, Widget child) {
  return NoTransitionPage<void>(key: state.pageKey, child: child);
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
flutter test test/navigation/router_test.dart --plain-name "bottom navigation preserves tab widget state between switches"
```

Expected: PASS.

### Task 3: Verify Navigation Regressions

**Files:**
- Test: `test/navigation/router_test.dart`

- [ ] **Step 1: Run the full navigation test file**

Run:

```bash
flutter test test/navigation/router_test.dart
```

Expected: PASS.

- [ ] **Step 2: Run static analysis**

Run:

```bash
flutter analyze
```

Expected: PASS with no analyzer issues.

## Self-Review

- Spec coverage: the plan preserves tab state by moving to the dedicated stateful branch router and keeps the bottom tab bar selected state wired to the active branch.
- Placeholder scan: no placeholder instructions remain; every code-changing step includes exact code.
- Type consistency: `ZenliftTabShell` takes `StatefulNavigationShell`, `StatefulShellRoute.indexedStack` provides it, and `NavigationBar.onDestinationSelected` can call `goBranch`.
