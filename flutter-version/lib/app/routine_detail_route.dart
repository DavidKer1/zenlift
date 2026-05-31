import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/exercises/data/drift_exercise_repository.dart';
import '../features/routines/application/routine_detail_controller.dart';
import '../features/routines/data/drift_routine_repository.dart';
import '../features/routines/domain/routine.dart';
import '../features/routines/presentation/routine_detail_screen.dart';
import '../features/workout/application/active_workout_controller.dart';
import '../features/workout/data/drift_workout_repository.dart';
import '../features/workout/data/shared_preferences_active_workout_session_store.dart';
import '../storage/drift/app_database.dart';

class RoutineDetailRoute extends StatefulWidget {
  const RoutineDetailRoute({required this.routineId, super.key});

  final String routineId;

  @override
  State<RoutineDetailRoute> createState() => _RoutineDetailRouteState();
}

class _RoutineDetailRouteState extends State<RoutineDetailRoute> {
  late final AppDatabase _database;
  late final DriftWorkoutRepository _workoutRepository;
  late final RoutineDetailController _detailController;
  late final ActiveWorkoutController _activeWorkoutController;

  @override
  void initState() {
    super.initState();
    const idGenerator = UuidIdGenerator();
    _database = AppDatabase();
    _workoutRepository = DriftWorkoutRepository(_database, idGenerator);
    _detailController = RoutineDetailController(
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
    return RoutineDetailScreen(
      routineId: widget.routineId,
      loadRoutine: _detailController.load,
      onUpdateName: _detailController.updateName,
      onDuplicateRoutine: _detailController.duplicate,
      onArchiveRoutine: (routine) async {
        await _detailController.archive(routine.routine.id);
        if (context.mounted) {
          context.go('/routines');
        }
      },
      onDeleteRoutine: (routine) async {
        await _detailController.delete(routine.routine.id);
        if (context.mounted) {
          context.go('/routines');
        }
      },
      onRemoveExercise: _detailController.removeExercise,
      onMoveExercise: _detailController.moveExercise,
      onEditRoutine: (routine) async =>
          context.go('/routine/edit/${routine.routine.id}'),
      onAddExercise: (routine, day) async =>
          context.go('/routine/edit/${routine.routine.id}'),
      onStartWorkout: _startWorkout,
      onBackToRoutines: () async => context.go('/routines'),
    );
  }

  Future<void> _startWorkout(FullRoutine routine, RoutineDayEntity day) async {
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

    await _activeWorkoutController.quickStart(
      StartWorkoutParams(
        name: '${routine.routine.name} - ${day.name}',
        routineId: routine.routine.id,
        routineDayId: day.id,
      ),
      mode: mode,
    );
    if (mounted) {
      context.go('/workout/active');
    }
  }
}
