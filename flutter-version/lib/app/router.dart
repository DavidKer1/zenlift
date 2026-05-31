import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'active_workout_route.dart';
import 'exercise_detail_route.dart';
import 'exercise_form_route.dart';
import 'exercise_library_route.dart';
import 'history_route.dart';
import 'home_route.dart';
import 'routine_detail_route.dart';
import 'routine_editor_route.dart';
import 'routines_route.dart';
import 'settings_route.dart';
import 'workout_summary_route.dart';
import '../features/home/presentation/zenlift_tab_shell.dart';
import '../features/onboarding/presentation/onboarding_screen.dart';
import '../features/workout/application/active_workout_controller.dart';

final zenliftRouter = buildZenliftRouter();

abstract final class ZenliftRoutes {
  static const onboarding = '/onboarding';
  static const home = '/';
  static const routines = '/routines';
  static const exerciseLibrary = '/exercise';
  static const history = '/history';
  static const settings = '/settings';
  static const routineDetail = '/routine/:id';
  static const routineCreate = '/routine/create';
  static const routineEdit = '/routine/edit/:id';
  static const exerciseDetail = '/exercise/:id';
  static const exerciseCreate = '/exercise/create';
  static const exerciseEdit = '/exercise/edit/:id';
  static const activeWorkout = '/workout/active';
  static const workoutSummary = '/workout/summary';

  static const catalog = <String>[
    onboarding,
    home,
    routines,
    exerciseLibrary,
    history,
    settings,
    routineDetail,
    routineCreate,
    routineEdit,
    exerciseDetail,
    exerciseCreate,
    exerciseEdit,
    activeWorkout,
    workoutSummary,
  ];

  static String routine(String id) => '/routine/$id';
  static String editRoutine(String id) => '/routine/edit/$id';
  static String exercise(String id) => '/exercise/$id';
  static String editExercise(String id) => '/exercise/edit/$id';
}

abstract final class ZenliftRouteKeys {
  static const tabShell = ValueKey('zenlift.tabShell');
  static const navigationBar = ValueKey('zenlift.navigationBar');
  static const homeTab = ValueKey('zenlift.tab.home');
  static const routinesTab = ValueKey('zenlift.tab.routines');
  static const exerciseTab = ValueKey('zenlift.tab.exercise');
  static const historyTab = ValueKey('zenlift.tab.history');
  static const settingsTab = ValueKey('zenlift.tab.settings');
  static const homeScreen = ValueKey('zenlift.screen.home');
  static const routinesScreen = ValueKey('zenlift.screen.routines');
  static const exerciseLibraryScreen = ValueKey(
    'zenlift.screen.exerciseLibrary',
  );
  static const historyScreen = ValueKey('zenlift.screen.history');
  static const settingsScreen = ValueKey('zenlift.screen.settings');
  static const onboardingScreen = ValueKey('zenlift.screen.onboarding');
  static const routineDetailScreen = ValueKey('zenlift.screen.routineDetail');
  static const routineCreateScreen = ValueKey('zenlift.screen.routineCreate');
  static const routineEditScreen = ValueKey('zenlift.screen.routineEdit');
  static const exerciseDetailScreen = ValueKey('zenlift.screen.exerciseDetail');
  static const exerciseCreateScreen = ValueKey('zenlift.screen.exerciseCreate');
  static const exerciseEditScreen = ValueKey('zenlift.screen.exerciseEdit');
  static const activeWorkoutScreen = ValueKey('zenlift.screen.activeWorkout');
  static const workoutSummaryScreen = ValueKey('zenlift.screen.workoutSummary');
}

GoRouter buildZenliftRouter({
  String initialLocation = ZenliftRoutes.home,
  WidgetBuilder? homeBuilder,
  WidgetBuilder? routinesBuilder,
  WidgetBuilder? historyBuilder,
  WidgetBuilder? exerciseLibraryBuilder,
  WidgetBuilder? settingsBuilder,
  WidgetBuilder? activeWorkoutBuilder,
  WidgetBuilder? workoutSummaryBuilder,
  Widget Function(BuildContext context, String routineId)? routineDetailBuilder,
  Widget Function(BuildContext context, String exerciseId)?
  exerciseDetailBuilder,
  WidgetBuilder? exerciseCreateBuilder,
  Widget Function(BuildContext context, String exerciseId)? exerciseEditBuilder,
  WidgetBuilder? routineCreateBuilder,
  Widget Function(BuildContext context, String routineId)? routineEditBuilder,
}) {
  return GoRouter(
    initialLocation: initialLocation,
    routes: <RouteBase>[
      ShellRoute(
        builder: (context, state, child) => ZenliftTabShell(
          key: ZenliftRouteKeys.tabShell,
          navigationBarKey: ZenliftRouteKeys.navigationBar,
          location: state.uri.path,
          destinations: _zenliftTabDestinations,
          child: child,
        ),
        routes: <RouteBase>[
          GoRoute(
            path: ZenliftRoutes.home,
            builder: (context, state) =>
                homeBuilder?.call(context) ??
                const HomeRoute(key: ZenliftRouteKeys.homeScreen),
          ),
          GoRoute(
            path: ZenliftRoutes.routines,
            builder: (context, state) =>
                routinesBuilder?.call(context) ??
                const RoutinesRoute(key: ZenliftRouteKeys.routinesScreen),
          ),
          GoRoute(
            path: ZenliftRoutes.exerciseLibrary,
            builder: (context, state) =>
                exerciseLibraryBuilder?.call(context) ??
                const ExerciseLibraryRoute(
                  key: ZenliftRouteKeys.exerciseLibraryScreen,
                ),
          ),
          GoRoute(
            path: ZenliftRoutes.history,
            builder: (context, state) =>
                historyBuilder?.call(context) ??
                const HistoryRoute(key: ZenliftRouteKeys.historyScreen),
          ),
          GoRoute(
            path: ZenliftRoutes.settings,
            builder: (context, state) =>
                settingsBuilder?.call(context) ??
                const SettingsRoute(key: ZenliftRouteKeys.settingsScreen),
          ),
        ],
      ),
      GoRoute(
        path: ZenliftRoutes.onboarding,
        builder: (context, state) =>
            const OnboardingScreen(key: ZenliftRouteKeys.onboardingScreen),
      ),
      GoRoute(
        path: ZenliftRoutes.routineCreate,
        builder: (context, state) =>
            routineCreateBuilder?.call(context) ??
            const RoutineEditorRoute.create(
              key: ZenliftRouteKeys.routineCreateScreen,
            ),
      ),
      GoRoute(
        path: ZenliftRoutes.routineEdit,
        builder: (context, state) {
          final routineId = state.pathParameters['id'] ?? '';
          return routineEditBuilder?.call(context, routineId) ??
              RoutineEditorRoute.edit(
                key: ZenliftRouteKeys.routineEditScreen,
                routineId: routineId,
              );
        },
      ),
      GoRoute(
        path: ZenliftRoutes.routineDetail,
        builder: (context, state) {
          final routineId = state.pathParameters['id'] ?? '';
          return routineDetailBuilder?.call(context, routineId) ??
              RoutineDetailRoute(
                key: ZenliftRouteKeys.routineDetailScreen,
                routineId: routineId,
              );
        },
      ),
      GoRoute(
        path: ZenliftRoutes.exerciseCreate,
        builder: (context, state) =>
            exerciseCreateBuilder?.call(context) ??
            const ExerciseFormRoute.create(
              key: ZenliftRouteKeys.exerciseCreateScreen,
            ),
      ),
      GoRoute(
        path: ZenliftRoutes.exerciseEdit,
        builder: (context, state) {
          final exerciseId = state.pathParameters['id'] ?? '';
          return exerciseEditBuilder?.call(context, exerciseId) ??
              ExerciseFormRoute.edit(
                key: ZenliftRouteKeys.exerciseEditScreen,
                exerciseId: exerciseId,
              );
        },
      ),
      GoRoute(
        path: ZenliftRoutes.exerciseDetail,
        builder: (context, state) {
          final exerciseId = state.pathParameters['id'] ?? '';
          return exerciseDetailBuilder?.call(context, exerciseId) ??
              ExerciseDetailRoute(
                key: ZenliftRouteKeys.exerciseDetailScreen,
                exerciseId: exerciseId,
              );
        },
      ),
      GoRoute(
        path: ZenliftRoutes.activeWorkout,
        builder: (context, state) =>
            activeWorkoutBuilder?.call(context) ??
            const ActiveWorkoutRoute(key: ZenliftRouteKeys.activeWorkoutScreen),
      ),
      GoRoute(
        path: ZenliftRoutes.workoutSummary,
        builder: (context, state) =>
            workoutSummaryBuilder?.call(context) ??
            WorkoutSummaryRoute(
              key: ZenliftRouteKeys.workoutSummaryScreen,
              summary: state.extra is WorkoutSummary
                  ? state.extra! as WorkoutSummary
                  : null,
            ),
      ),
    ],
  );
}

const _zenliftTabDestinations = <ZenliftTabDestination>[
  ZenliftTabDestination(
    path: ZenliftRoutes.home,
    label: 'Home',
    icon: Icons.grid_view_outlined,
    selectedIcon: Icons.grid_view,
    key: ZenliftRouteKeys.homeTab,
  ),
  ZenliftTabDestination(
    path: ZenliftRoutes.routines,
    label: 'Routines',
    icon: Icons.format_list_bulleted_outlined,
    selectedIcon: Icons.format_list_bulleted,
    key: ZenliftRouteKeys.routinesTab,
  ),
  ZenliftTabDestination(
    path: ZenliftRoutes.exerciseLibrary,
    label: 'Exercise',
    icon: Icons.fitness_center_outlined,
    selectedIcon: Icons.fitness_center,
    key: ZenliftRouteKeys.exerciseTab,
  ),
  ZenliftTabDestination(
    path: ZenliftRoutes.history,
    label: 'History',
    icon: Icons.history_outlined,
    selectedIcon: Icons.history,
    key: ZenliftRouteKeys.historyTab,
  ),
  ZenliftTabDestination(
    path: ZenliftRoutes.settings,
    label: 'Settings',
    icon: Icons.settings_outlined,
    selectedIcon: Icons.settings,
    key: ZenliftRouteKeys.settingsTab,
  ),
];
