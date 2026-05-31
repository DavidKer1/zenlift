import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/workout/application/active_workout_controller.dart';
import '../features/workout/data/drift_workout_repository.dart';
import '../features/workout/data/shared_preferences_active_workout_session_store.dart';
import '../features/workout/presentation/active_workout_screen.dart';
import '../storage/drift/app_database.dart';

class ActiveWorkoutRoute extends StatefulWidget {
  const ActiveWorkoutRoute({super.key});

  @override
  State<ActiveWorkoutRoute> createState() => _ActiveWorkoutRouteState();
}

class _ActiveWorkoutRouteState extends State<ActiveWorkoutRoute> {
  late final AppDatabase _database;
  late final ActiveWorkoutController _controller;

  @override
  void initState() {
    super.initState();
    _database = AppDatabase();
    _controller = ActiveWorkoutController(
      repository: DriftWorkoutRepository(_database, const UuidIdGenerator()),
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
    return ActiveWorkoutScreen(
      loadState: () async {
        final recovered = await _controller.recoverSession();
        if (!recovered && context.mounted) {
          context.go('/');
        }
        return _controller.state;
      },
      onAddSet: (workoutExerciseId) async {
        await _controller.addSet(workoutExerciseId);
        return _controller.state;
      },
      onUpdateSet: (setId, {weight, reps, setType, notes}) async {
        await _controller.updateSet(
          setId,
          weight: weight,
          reps: reps,
          setType: setType,
          notes: notes,
        );
        return _controller.state;
      },
      onToggleSet: (setId) async {
        await _controller.toggleSetCompletion(setId);
        return _controller.state;
      },
      getLatestState: () => _controller.state,
      onFinish: _controller.finishWorkout,
      onCancel: _controller.cancelWorkout,
    );
  }
}
