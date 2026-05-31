import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/application/exercise_library_controller.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';

void main() {
  test('loads search results with muscle and equipment filters', () async {
    final bench = _exercise('bench', 'Bench Press', equipment: 'barbell');
    final row = _exercise('row', 'Cable Row', equipment: 'cable');
    final controller = ExerciseLibraryController(
      exerciseRepository: _FakeExerciseRepository(
        exercises: <ExerciseEntity>[bench, row],
        muscleMatches: <String, List<ExerciseEntity>>{
          'chest': <ExerciseEntity>[bench],
        },
        equipmentMatches: <String, List<ExerciseEntity>>{
          'barbell': <ExerciseEntity>[bench],
        },
        musclesByExercise: <String, List<MuscleGroupEntity>>{
          bench.id: <MuscleGroupEntity>[_muscle('chest', 'Chest')],
        },
      ),
      muscleGroupRepository: _FakeMuscleGroupRepository(
        muscles: <MuscleGroupEntity>[_muscle('chest', 'Chest')],
      ),
    );

    final state = await controller.load(
      query: 'bench',
      muscleIds: const <String>{'chest'},
      equipment: 'barbell',
    );

    expect(state.hasError, isFalse);
    expect(state.exercises, hasLength(1));
    expect(state.exercises.single.exercise.name, 'Bench Press');
    expect(state.exercises.single.primaryMuscle?.displayNameEs, 'Chest');
    expect(state.muscleGroups.single.id, 'chest');
  });

  test('returns recoverable empty state when repository fails', () async {
    final controller = ExerciseLibraryController(
      exerciseRepository: _FakeExerciseRepository(shouldThrow: true),
      muscleGroupRepository: _FakeMuscleGroupRepository(),
    );

    final state = await controller.load();

    expect(state.hasError, isTrue);
    expect(state.exercises, isEmpty);
  });
}

ExerciseEntity _exercise(String id, String name, {required String equipment}) {
  return ExerciseEntity(
    id: id,
    name: name,
    equipment: equipment,
    category: 'strength',
    isCustom: false,
    isFavorite: false,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

MuscleGroupEntity _muscle(String id, String name) {
  return MuscleGroupEntity(
    id: id,
    name: name.toLowerCase(),
    displayNameEs: name,
    color: '#EF4444',
  );
}

class _FakeExerciseRepository implements ExerciseRepository {
  _FakeExerciseRepository({
    this.exercises = const <ExerciseEntity>[],
    this.muscleMatches = const <String, List<ExerciseEntity>>{},
    this.equipmentMatches = const <String, List<ExerciseEntity>>{},
    this.musclesByExercise = const <String, List<MuscleGroupEntity>>{},
    this.shouldThrow = false,
  });

  final List<ExerciseEntity> exercises;
  final Map<String, List<ExerciseEntity>> muscleMatches;
  final Map<String, List<ExerciseEntity>> equipmentMatches;
  final Map<String, List<MuscleGroupEntity>> musclesByExercise;
  final bool shouldThrow;

  @override
  Future<List<ExerciseEntity>> getAll() async {
    if (shouldThrow) {
      throw StateError('getAll failed');
    }
    return exercises;
  }

  @override
  Future<List<ExerciseEntity>> search(String query) async {
    if (shouldThrow) {
      throw StateError('search failed');
    }
    return exercises
        .where(
          (exercise) =>
              exercise.name.toLowerCase().contains(query.toLowerCase()),
        )
        .toList();
  }

  @override
  Future<List<ExerciseEntity>> getByMuscle(String muscleGroupId) async {
    return muscleMatches[muscleGroupId] ?? const <ExerciseEntity>[];
  }

  @override
  Future<List<ExerciseEntity>> getByEquipment(String equipment) async {
    return equipmentMatches[equipment] ?? const <ExerciseEntity>[];
  }

  @override
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) async {
    return musclesByExercise[exerciseId] ?? const <MuscleGroupEntity>[];
  }

  @override
  Future<ExerciseEntity?> toggleFavorite(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> addMuscle(
    String exerciseId,
    String muscleGroupId,
    MuscleRole role,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<ExerciseEntity> create(
    CreateExerciseData data,
    List<MuscleEntry> muscles,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<void> delete(String id) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> getByCategory(String category) {
    throw UnimplementedError();
  }

  @override
  Future<ExerciseEntity?> getById(String id) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> getFavorites() {
    throw UnimplementedError();
  }

  @override
  Future<void> removeMuscle(String exerciseId, String muscleGroupId) {
    throw UnimplementedError();
  }

  @override
  Future<ExerciseEntity?> update(String id, UpdateExerciseData updates) {
    throw UnimplementedError();
  }
}

class _FakeMuscleGroupRepository implements MuscleGroupRepository {
  _FakeMuscleGroupRepository({this.muscles = const <MuscleGroupEntity>[]});

  final List<MuscleGroupEntity> muscles;

  @override
  Future<List<MuscleGroupEntity>> getAll() async => muscles;

  @override
  Future<MuscleGroupEntity?> getById(String id) {
    throw UnimplementedError();
  }
}
