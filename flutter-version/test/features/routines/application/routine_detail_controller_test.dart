import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';
import 'package:zenlift/features/routines/application/routine_detail_controller.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_detail.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';

void main() {
  test('loads full routine and primary muscles', () async {
    final routine = _fullRoutine();
    final controller = RoutineDetailController(
      routineRepository: _FakeRoutineRepository(fullRoutine: routine),
      exerciseRepository: _FakeExerciseRepository(
        musclesByExerciseId: {
          'bench': [_muscle('chest')],
        },
      ),
    );

    final state = await controller.load('routine-a');

    expect(state.routine?.routine.name, 'Push');
    expect(state.primaryMusclesByExerciseId['bench']?.displayNameEs, 'chest');
  });

  test('updates name optimistically through repository', () async {
    final repository = _FakeRoutineRepository(fullRoutine: _fullRoutine());
    final controller = RoutineDetailController(
      routineRepository: repository,
      exerciseRepository: _FakeExerciseRepository(),
    );

    final state = await controller.updateName(
      RoutineDetailState(
        routine: _fullRoutine(),
        primaryMusclesByExerciseId: const {},
      ),
      'Push Power',
    );

    expect(repository.updatedNames, <String>['Push Power']);
    expect(state.routine?.routine.name, 'Push Power');
  });

  test('remove and reorder exercises persist through repository', () async {
    final repository = _FakeRoutineRepository(fullRoutine: _fullRoutine());
    final controller = RoutineDetailController(
      routineRepository: repository,
      exerciseRepository: _FakeExerciseRepository(),
    );
    final current = RoutineDetailState(
      routine: _fullRoutine(),
      primaryMusclesByExerciseId: const {},
    );

    final removed = await controller.removeExercise(
      current,
      'routine-ex-bench',
    );
    final reordered = await controller.moveExercise(
      current,
      dayId: 'day-a',
      routineExerciseId: 'routine-ex-row',
      direction: -1,
    );

    expect(repository.deletedExerciseIds, <String>['routine-ex-bench']);
    expect(
      removed.routine?.days.single.exercises.map(
        (item) => item.routineExercise.id,
      ),
      <String>['routine-ex-row'],
    );
    expect(repository.reorderedExerciseIds['day-a'], <String>[
      'routine-ex-row',
      'routine-ex-bench',
    ]);
    expect(
      reordered.routine?.days.single.exercises.first.routineExercise.id,
      'routine-ex-row',
    );
  });

  test('duplicates using copy name', () async {
    final repository = _FakeRoutineRepository(fullRoutine: _fullRoutine());
    final controller = RoutineDetailController(
      routineRepository: repository,
      exerciseRepository: _FakeExerciseRepository(),
    );

    await controller.duplicate(
      RoutineDetailState(
        routine: _fullRoutine(),
        primaryMusclesByExerciseId: const {},
      ),
    );

    expect(repository.duplicatedNames, <String>['Copy of Push']);
  });
}

FullRoutine _fullRoutine() {
  return FullRoutine(
    routine: const RoutineEntity(
      id: 'routine-a',
      name: 'Push',
      description: 'Chest and shoulders',
      goal: null,
      isArchived: false,
      sortOrder: 0,
      createdAt: null,
      updatedAt: null,
    ),
    days: [
      FullRoutineDay(
        day: const RoutineDayEntity(
          id: 'day-a',
          routineId: 'routine-a',
          name: 'Day A',
          dayOfWeek: 1,
          sortOrder: 0,
        ),
        exercises: [
          _routineExercise('routine-ex-bench', 'bench', 'Bench Press'),
          _routineExercise('routine-ex-row', 'row', 'Barbell Row'),
        ],
      ),
    ],
  );
}

RoutineExerciseWithExercise _routineExercise(
  String id,
  String exerciseId,
  String name,
) {
  return RoutineExerciseWithExercise(
    routineExercise: RoutineExerciseEntity(
      id: id,
      routineDayId: 'day-a',
      exerciseId: exerciseId,
      targetSets: 4,
      targetRepsMin: 8,
      targetRepsMax: 12,
      notes: null,
      sortOrder: 0,
    ),
    exercise: ExerciseEntity(
      id: exerciseId,
      name: name,
      equipment: 'Barbell',
      category: 'Strength',
      isCustom: false,
      isFavorite: false,
      notes: null,
      createdAt: null,
      updatedAt: null,
    ),
  );
}

MuscleGroupEntity _muscle(String name) {
  return MuscleGroupEntity(
    id: name,
    name: name,
    displayNameEs: name,
    color: '#ffcc00',
  );
}

class _FakeRoutineRepository implements RoutineRepository {
  _FakeRoutineRepository({this.fullRoutine});

  final FullRoutine? fullRoutine;
  final updatedNames = <String>[];
  final duplicatedNames = <String>[];
  final deletedExerciseIds = <String>[];
  final reorderedExerciseIds = <String, List<String>>{};

  @override
  Future<FullRoutine?> getFullRoutine(String id) async => fullRoutine;

  @override
  Future<void> update(String id, UpdateRoutineData updates) async {
    if (updates.name != null) {
      updatedNames.add(updates.name!);
    }
  }

  @override
  Future<FullRoutine> duplicate(String id, String newName) async {
    duplicatedNames.add(newName);
    return fullRoutine!;
  }

  @override
  Future<void> deleteExercise(String id) async {
    deletedExerciseIds.add(id);
  }

  @override
  Future<void> reorderExercises(String dayId, List<String> exerciseIds) async {
    reorderedExerciseIds[dayId] = exerciseIds;
  }

  @override
  Future<void> archive(String id) => throw UnimplementedError();

  @override
  Future<RoutineEntity> create(CreateRoutineData data) =>
      throw UnimplementedError();

  @override
  Future<RoutineDayEntity> createDay(
    String routineId,
    CreateRoutineDayData data,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<RoutineExerciseEntity> createExercise(
    String dayId,
    CreateRoutineExerciseData data,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<void> delete(String id) => throw UnimplementedError();

  @override
  Future<void> deleteDay(String id) => throw UnimplementedError();

  @override
  Future<List<RoutineEntity>> getAll({bool includeArchived = false}) {
    throw UnimplementedError();
  }

  @override
  Future<List<RoutineWithCounts>> getAllWithDayCount({
    bool includeArchived = false,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<RoutineEntity?> getById(String id) => throw UnimplementedError();

  @override
  Future<List<RoutineDayEntity>> getDays(String routineId) {
    throw UnimplementedError();
  }

  @override
  Future<List<RoutineExerciseWithExercise>> getExercises(String dayId) {
    throw UnimplementedError();
  }

  @override
  Future<void> reorderDays(String routineId, List<String> dayIds) {
    throw UnimplementedError();
  }

  @override
  Future<FullRoutine> saveDraft(RoutineDraft draft) {
    throw UnimplementedError();
  }

  @override
  Future<void> unarchive(String id) => throw UnimplementedError();

  @override
  Future<void> updateDay(String id, UpdateRoutineDayData updates) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateExercise(String id, UpdateRoutineExerciseData updates) {
    throw UnimplementedError();
  }
}

class _FakeExerciseRepository implements ExerciseRepository {
  _FakeExerciseRepository({this.musclesByExerciseId = const {}});

  final Map<String, List<MuscleGroupEntity>> musclesByExerciseId;

  @override
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) async {
    return musclesByExerciseId[exerciseId] ?? const <MuscleGroupEntity>[];
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
  Future<void> delete(String id) => throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getAll() => throw UnimplementedError();

  @override
  Future<ExerciseEntity?> getById(String id) => throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getByCategory(String category) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> getByEquipment(String equipment) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> getByMuscle(String muscleGroupId) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> getFavorites() => throw UnimplementedError();

  @override
  Future<void> removeMuscle(String exerciseId, String muscleGroupId) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> search(String query) =>
      throw UnimplementedError();

  @override
  Future<ExerciseEntity?> toggleFavorite(String id) =>
      throw UnimplementedError();

  @override
  Future<ExerciseEntity?> update(String id, UpdateExerciseData updates) {
    throw UnimplementedError();
  }
}
