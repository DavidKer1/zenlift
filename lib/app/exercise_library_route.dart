import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/uuid/id_generator.dart';
import '../features/exercises/application/exercise_library_controller.dart';
import '../features/exercises/data/drift_exercise_repository.dart';
import '../features/exercises/presentation/exercise_library_screen.dart';
import '../storage/drift/app_database.dart';

class ExerciseLibraryRoute extends StatefulWidget {
  const ExerciseLibraryRoute({super.key, this.database});

  final AppDatabase? database;

  @override
  State<ExerciseLibraryRoute> createState() => _ExerciseLibraryRouteState();
}

class _ExerciseLibraryRouteState extends State<ExerciseLibraryRoute> {
  late final AppDatabase _database;
  late final bool _ownsDatabase;
  late final ExerciseLibraryController _controller;

  @override
  void initState() {
    super.initState();
    _ownsDatabase = widget.database == null;
    _database = widget.database ?? AppDatabase();
    _controller = ExerciseLibraryController(
      exerciseRepository: DriftExerciseRepository(
        _database,
        const UuidIdGenerator(),
      ),
      muscleGroupRepository: DriftMuscleGroupRepository(_database),
    );
  }

  @override
  void dispose() {
    if (_ownsDatabase) {
      _database.close();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ExerciseLibraryScreen(
      loadExercises: _controller.load,
      onToggleFavorite: _controller.toggleFavorite,
      onOpenExercise: (id) async => context.go('/exercise/$id'),
      onCreateExercise: () async => context.go('/exercise/create'),
    );
  }
}
