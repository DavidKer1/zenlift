import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/workout/application/active_workout_controller.dart';
import '../features/workout/data/drift_workout_repository.dart';
import '../features/workout/presentation/workout_summary_screen.dart';
import '../storage/drift/app_database.dart';

class WorkoutSummaryRoute extends StatefulWidget {
  const WorkoutSummaryRoute({required this.summary, super.key});

  final WorkoutSummary? summary;

  @override
  State<WorkoutSummaryRoute> createState() => _WorkoutSummaryRouteState();
}

class _WorkoutSummaryRouteState extends State<WorkoutSummaryRoute> {
  late final AppDatabase _database;
  late final DriftWorkoutRepository _repository;

  @override
  void initState() {
    super.initState();
    _database = AppDatabase();
    _repository = DriftWorkoutRepository(_database, const UuidIdGenerator());
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WorkoutSummaryScreen(
      summary: widget.summary,
      onGoHome: () async => context.go('/'),
      onGoHistory: () async => context.go('/history'),
      onSaveNotes: widget.summary == null
          ? null
          : (value) => _repository.updateSessionNotes(
              widget.summary!.sessionId,
              value,
            ),
    );
  }
}
