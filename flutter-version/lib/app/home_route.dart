import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/exercises/data/drift_exercise_repository.dart';
import '../features/home/application/home_dashboard_controller.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/routines/data/drift_routine_repository.dart';
import '../features/workout/application/active_workout_controller.dart';
import '../features/workout/data/drift_workout_repository.dart';
import '../features/workout/data/shared_preferences_active_workout_session_store.dart';
import '../storage/drift/app_database.dart';

class HomeRoute extends StatefulWidget {
  const HomeRoute({super.key});

  @override
  State<HomeRoute> createState() => _HomeRouteState();
}

class _HomeRouteState extends State<HomeRoute> {
  late final AppDatabase _database;
  late final DriftWorkoutRepository _workoutRepository;
  late final HomeDashboardController _dashboardController;
  late final ActiveWorkoutController _activeWorkoutController;

  @override
  void initState() {
    super.initState();
    const idGenerator = UuidIdGenerator();
    _database = AppDatabase();
    _workoutRepository = DriftWorkoutRepository(_database, idGenerator);
    _dashboardController = HomeDashboardController(
      workoutRepository: _workoutRepository,
      routineRepository: DriftRoutineRepository(_database, idGenerator),
      exerciseRepository: DriftExerciseRepository(_database, idGenerator),
    );
    _activeWorkoutController = ActiveWorkoutController(
      repository: _workoutRepository,
      sessionStore: SharedPreferencesActiveWorkoutSessionStore(),
      pendingSetWriteStore: SharedPreferencesPendingSetWriteStore(),
    );
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return HomeScreen(
      loadDashboard: _dashboardController.load,
      onStartWorkout: () async => context.go(_routinesPath),
      onQuickWorkout: () => _startWorkout(context, const StartWorkoutParams()),
      onCreateRoutine: () async => context.go(_routineCreatePath),
      onOpenRoutine: (routine) async => context.go('/routine/${routine.id}'),
      onRepeatWorkout: (workout) => _startWorkout(
        context,
        StartWorkoutParams(
          name: workout.title,
          routineId: workout.routineId,
          routineDayId: workout.routineDayId,
        ),
      ),
    );
  }

  Future<void> _startWorkout(
    BuildContext context,
    StartWorkoutParams params,
  ) async {
    final activeSession = await _workoutRepository.getActiveSession();
    if (!context.mounted) {
      return;
    }

    var mode = ActiveWorkoutStartMode.continueExisting;
    if (activeSession != null) {
      final choice = await showDialog<ActiveWorkoutStartMode>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Active workout found'),
          content: const Text(
            'Continue your current workout or start a new one?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(
                dialogContext,
              ).pop(ActiveWorkoutStartMode.startNew),
              child: const Text('Start new'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(
                dialogContext,
              ).pop(ActiveWorkoutStartMode.continueExisting),
              child: const Text('Continue'),
            ),
          ],
        ),
      );
      if (choice == null) {
        return;
      }
      mode = choice;
    }

    await _activeWorkoutController.quickStart(params, mode: mode);
    if (context.mounted) {
      context.go(_activeWorkoutPath);
    }
  }
}

const _activeWorkoutPath = '/workout/active';
const _routineCreatePath = '/routine/create';
const _routinesPath = '/routines';
