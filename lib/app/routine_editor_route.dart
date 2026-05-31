import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/exercises/data/drift_exercise_repository.dart';
import '../features/routines/application/routine_editor_controller.dart';
import '../features/routines/data/drift_routine_repository.dart';
import '../features/routines/domain/routine_editor.dart';
import '../features/routines/presentation/routine_editor_screen.dart';
import '../storage/drift/app_database.dart';

class RoutineEditorRoute extends StatefulWidget {
  const RoutineEditorRoute.create({super.key}) : routineId = null;

  const RoutineEditorRoute.edit({required this.routineId, super.key});

  final String? routineId;

  @override
  State<RoutineEditorRoute> createState() => _RoutineEditorRouteState();
}

class _RoutineEditorRouteState extends State<RoutineEditorRoute> {
  late final AppDatabase _database;
  late final RoutineEditorController _controller;

  bool get _isEditing => widget.routineId != null;

  @override
  void initState() {
    super.initState();
    const idGenerator = UuidIdGenerator();
    _database = AppDatabase();
    _controller = RoutineEditorController(
      routineRepository: DriftRoutineRepository(_database, idGenerator),
      exerciseRepository: DriftExerciseRepository(_database, idGenerator),
    );
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RoutineEditorScreen(
      mode: _isEditing ? RoutineEditorMode.edit : RoutineEditorMode.create,
      routineId: widget.routineId,
      loadEditor: _isEditing
          ? () => _controller.loadEdit(widget.routineId!)
          : _controller.loadCreate,
      saveDraft: _controller.save,
      validateDraft: _controller.validate,
      onSaved: (routine) async => context.go('/routine/${routine.routine.id}'),
      onCancel: () async => _isEditing && widget.routineId != null
          ? context.go('/routine/${widget.routineId}')
          : context.go('/routines'),
      onBackToRoutines: () async => context.go('/routines'),
    );
  }
}
