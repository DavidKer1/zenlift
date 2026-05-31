import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/exercises/application/exercise_form_controller.dart';
import '../features/exercises/data/drift_exercise_repository.dart';
import '../features/exercises/domain/exercise_form.dart';
import '../features/exercises/presentation/exercise_form_screen.dart';
import '../storage/drift/app_database.dart';

class ExerciseFormRoute extends StatefulWidget {
  const ExerciseFormRoute.create({super.key})
    : mode = ExerciseFormMode.create,
      exerciseId = null;

  const ExerciseFormRoute.edit({required this.exerciseId, super.key})
    : mode = ExerciseFormMode.edit;

  final ExerciseFormMode mode;
  final String? exerciseId;

  @override
  State<ExerciseFormRoute> createState() => _ExerciseFormRouteState();
}

class _ExerciseFormRouteState extends State<ExerciseFormRoute> {
  late final AppDatabase _database;
  late final ExerciseFormController _controller;

  @override
  void initState() {
    super.initState();
    _database = AppDatabase();
    final exerciseRepository = DriftExerciseRepository(
      _database,
      const UuidIdGenerator(),
    );
    _controller = ExerciseFormController(
      exerciseRepository: exerciseRepository,
      muscleGroupRepository: DriftMuscleGroupRepository(_database),
    );
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ExerciseFormScreen(
      mode: widget.mode,
      exerciseId: widget.exerciseId,
      loadForm: widget.mode == ExerciseFormMode.edit
          ? () => _controller.loadEdit(widget.exerciseId ?? '')
          : _controller.loadCreate,
      saveDraft: _controller.save,
      validateDraft: _controller.validate,
      onSaved: (exercise) async => context.go('/exercise/${exercise.id}'),
      onCancel: () async {
        if (widget.mode == ExerciseFormMode.edit && widget.exerciseId != null) {
          context.go('/exercise/${widget.exerciseId}');
          return;
        }
        context.go('/exercise');
      },
      onBackToExercises: () async => context.go('/exercise'),
    );
  }
}
