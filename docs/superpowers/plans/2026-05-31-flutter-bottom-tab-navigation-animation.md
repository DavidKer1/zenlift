# Flutter Bottom Tab Navigation Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop Flutter bottom tab switches from playing route slide animations that overlap tab pages.

**Architecture:** Keep the existing `ShellRoute` + `NavigationBar` design and make only root tab routes transitionless. Detail/workout/onboarding routes stay outside the tab shell and keep their normal page transitions.

**Tech Stack:** Flutter 3.44.0, Dart 3.12.0, go_router 17.2.3, flutter_test.

---

## File Structure

- Modify `test/navigation/router_test.dart`: add a regression widget test proving bottom tab taps do not keep the outgoing tab screen in the tree during route transition frames.
- Modify `lib/app/router.dart`: replace tab-route `builder` usage with `pageBuilder` returning `NoTransitionPage<void>` for the five bottom tab destinations.
- Do not modify `lib/features/home/presentation/zenlift_tab_shell.dart`: the shell already selects the correct tab and delegates taps through `context.go`.

### Task 1: Regression Test For Non-Overlapping Tab Switches

**Files:**
- Modify: `test/navigation/router_test.dart`

- [ ] **Step 1: Add the failing widget test**

Add this test after `bottom navigation taps switch tab routes inside the shell`:

```dart
  testWidgets('bottom navigation tab switches do not overlap route pages', (
    tester,
  ) async {
    await tester.pumpZenliftRoute();

    await tester.tap(find.byKey(ZenliftRouteKeys.historyTab));
    await tester.pump();

    expect(find.byKey(ZenliftRouteKeys.historyScreen), findsOneWidget);
    expect(find.byKey(ZenliftRouteKeys.homeScreen), findsNothing);
    expect(selectedTabIndex(tester), 3);
  });
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
flutter test test/navigation/router_test.dart --plain-name "bottom navigation tab switches do not overlap route pages"
```

Expected: FAIL because the outgoing home tab is still present during the first transition frame.

### Task 2: Make Tab Routes Transitionless

**Files:**
- Modify: `lib/app/router.dart`

- [ ] **Step 1: Add a helper for tab pages**

Add this helper above `_zenliftTabDestinations`:

```dart
Page<void> _buildTabPage(GoRouterState state, Widget child) {
  return NoTransitionPage<void>(key: state.pageKey, child: child);
}
```

- [ ] **Step 2: Convert each shell tab route to `pageBuilder`**

Replace the five shell tab `GoRoute(builder: ...)` blocks with this pattern:

```dart
          GoRoute(
            path: ZenliftRoutes.home,
            pageBuilder: (context, state) => _buildTabPage(
              state,
              homeBuilder?.call(context) ??
                  const HomeRoute(key: ZenliftRouteKeys.homeScreen),
            ),
          ),
```

Apply the same `pageBuilder` + `_buildTabPage` structure to `ZenliftRoutes.routines`, `ZenliftRoutes.exerciseLibrary`, `ZenliftRoutes.history`, and `ZenliftRoutes.settings`, preserving the existing builder overrides and screen keys.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run:

```bash
flutter test test/navigation/router_test.dart --plain-name "bottom navigation tab switches do not overlap route pages"
```

Expected: PASS.

### Task 3: Verify Existing Navigation Behavior

**Files:**
- Test: `test/navigation/router_test.dart`

- [ ] **Step 1: Run the full navigation test file**

Run:

```bash
flutter test test/navigation/router_test.dart
```

Expected: PASS, including initial routes, tab selection, standalone detail routes, and pop back to previous tab.

- [ ] **Step 2: Run static analysis**

Run:

```bash
flutter analyze
```

Expected: PASS with no analyzer issues introduced by the route changes.

## Self-Review

- Spec coverage: the plan addresses the reported left-to-right tab animation and overlap by removing page transitions only from bottom tabs.
- Placeholder scan: no placeholder instructions remain; each code-changing step includes concrete code.
- Type consistency: `_buildTabPage` returns `Page<void>` and uses `NoTransitionPage<void>`, which is provided by `go_router` 17.2.3.
