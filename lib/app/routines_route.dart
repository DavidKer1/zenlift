import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/routines/application/routines_controller.dart';
import '../features/routines/data/drift_routine_repository.dart';
import '../features/routines/presentation/routines_screen.dart';
import '../storage/drift/app_database.dart';

class RoutinesRoute extends StatefulWidget {
  const RoutinesRoute({super.key});

  @override
  State<RoutinesRoute> createState() => _RoutinesRouteState();
}

class _RoutinesRouteState extends State<RoutinesRoute> {
  late final AppDatabase _database;
  late final RoutinesController _controller;

  @override
  void initState() {
    super.initState();
    _database = AppDatabase();
    _controller = RoutinesController(
      routineRepository: DriftRoutineRepository(
        _database,
        const UuidIdGenerator(),
      ),
    );
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RoutinesScreen(
      loadRoutines: _controller.load,
      onArchiveRoutine: _controller.archive,
      onUndoArchive: _controller.undoArchive,
      onOpenRoutine: (routine) async =>
          context.go('/routine/${routine.routine.id}'),
      onCreateRoutine: () async => context.go('/routine/create'),
      onOpenTemplate: (template) async =>
          context.go('/routine/create', extra: template.kind),
    );
  }
}
