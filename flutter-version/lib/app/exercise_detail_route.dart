import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/exercises/application/exercise_detail_controller.dart';
import '../features/exercises/data/drift_exercise_repository.dart';
import '../features/exercises/domain/exercise.dart';
import '../features/exercises/presentation/exercise_detail_screen.dart';
import '../features/workout/application/active_workout_controller.dart';
import '../features/workout/data/drift_workout_repository.dart';
import '../features/workout/data/shared_preferences_active_workout_session_store.dart';
import '../storage/drift/app_database.dart';

class ExerciseDetailRoute extends StatefulWidget {
  const ExerciseDetailRoute({required this.exerciseId, super.key});

  final String exerciseId;

  @override
  State<ExerciseDetailRoute> createState() => _ExerciseDetailRouteState();
}

class _ExerciseDetailRouteState extends State<ExerciseDetailRoute> {
  late final AppDatabase _database;
  late final DriftWorkoutRepository _workoutRepository;
  late final ExerciseDetailController _controller;
  late final ActiveWorkoutController _activeWorkoutController;

  @override
  void initState() {
    super.initState();
    const idGenerator = UuidIdGenerator();
    _database = AppDatabase();
    _workoutRepository = DriftWorkoutRepository(_database, idGenerator);
    _controller = ExerciseDetailController(
      exerciseRepository: DriftExerciseRepository(_database, idGenerator),
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
    return ExerciseDetailScreen(
      exerciseId: widget.exerciseId,
      loadExercise: _controller.load,
      onQuickWorkout: _startWorkout,
      onEditExercise: (exercise) async =>
          context.go('/exercise/edit/${exercise.id}'),
      onDeleteExercise: (exercise) async {
        await _controller.delete(exercise.id);
        if (context.mounted) {
          context.go('/exercise');
        }
      },
      onBack: () async => context.go('/exercise'),
    );
  }

  Future<void> _startWorkout(ExerciseEntity exercise) async {
    final activeSession = await _workoutRepository.getActiveSession();
    if (!mounted) {
      return;
    }

    var mode = ActiveWorkoutStartMode.continueExisting;
    if (activeSession != null) {
      final choice = await showDialog<ActiveWorkoutStartMode>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Active workout found'),
          content: const Text('Add this exercise or start a new workout?'),
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
              child: const Text('Add here'),
            ),
          ],
        ),
      );
      if (choice == null) {
        return;
      }
      mode = choice;
    }

    await _activeWorkoutController.quickStart(
      StartWorkoutParams(name: exercise.name, exerciseId: exercise.id),
      mode: mode,
    );
    if (mounted) {
      context.go('/workout/active');
    }
  }
}
