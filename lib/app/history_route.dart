import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/history/application/history_dashboard_controller.dart';
import '../features/history/presentation/history_screen.dart';
import '../features/workout/application/active_workout_controller.dart';
import '../features/workout/data/drift_workout_repository.dart';
import '../features/workout/data/shared_preferences_active_workout_session_store.dart';
import '../storage/drift/app_database.dart';

class HistoryRoute extends StatefulWidget {
  const HistoryRoute({super.key});

  @override
  State<HistoryRoute> createState() => _HistoryRouteState();
}

class _HistoryRouteState extends State<HistoryRoute> {
  late final AppDatabase _database;
  late final DriftWorkoutRepository _workoutRepository;
  late final HistoryDashboardController _historyController;
  late final ActiveWorkoutController _activeWorkoutController;

  @override
  void initState() {
    super.initState();
    const idGenerator = UuidIdGenerator();
    _database = AppDatabase();
    _workoutRepository = DriftWorkoutRepository(_database, idGenerator);
    _historyController = HistoryDashboardController(
      workoutRepository: _workoutRepository,
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
    return HistoryScreen(
      loadHistory: _historyController.load,
      onStartWorkout: () async => context.go(_routinesPath),
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
const _routinesPath = '/routines';
