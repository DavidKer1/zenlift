import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/routines/application/routines_controller.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_list.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';

void main() {
  test('loads active routines through the repository', () async {
    final repository = _FakeRoutineRepository(routines: [_routine('a', 2)]);
    final controller = RoutinesController(routineRepository: repository);

    final state = await controller.load();

    expect(state.routines.map((item) => item.routine.name), <String>['A']);
    expect(state.hasError, isFalse);
  });

  test('load returns an error state when repository fails', () async {
    final repository = _FakeRoutineRepository(loadError: Exception('offline'));
    final controller = RoutinesController(routineRepository: repository);

    final state = await controller.load();

    expect(state.routines, isEmpty);
    expect(state.errorMessage, 'Could not load routines.');
  });

  test('archive removes the routine and keeps it undoable', () async {
    final routineA = _routine('a', 2);
    final routineB = _routine('b', 1);
    final repository = _FakeRoutineRepository(routines: [routineA, routineB]);
    final controller = RoutinesController(routineRepository: repository);

    final state = await controller.archive(
      RoutineListState(routines: [routineA, routineB]),
      routineA,
    );

    expect(repository.archivedIds, <String>['a']);
    expect(state.routines.map((item) => item.routine.id), <String>['b']);
    expect(state.archivedRoutine, routineA);
  });

  test('undo archive restores the routine by sort order', () async {
    final routineA = _routine('a', 1);
    final routineB = _routine('b', 2);
    final repository = _FakeRoutineRepository(routines: [routineA, routineB]);
    final controller = RoutinesController(routineRepository: repository);

    final state = await controller.undoArchive(
      RoutineListState(routines: [routineB], archivedRoutine: routineA),
    );

    expect(repository.unarchivedIds, <String>['a']);
    expect(state.routines.map((item) => item.routine.id), <String>['a', 'b']);
    expect(state.archivedRoutine, isNull);
  });
}

RoutineWithCounts _routine(String id, int sortOrder) {
  return RoutineWithCounts(
    routine: RoutineEntity(
      id: id,
      name: id.toUpperCase(),
      description: null,
      goal: null,
      isArchived: false,
      sortOrder: sortOrder,
      createdAt: null,
      updatedAt: null,
    ),
    dayCount: sortOrder,
    exerciseCount: sortOrder * 3,
  );
}

class _FakeRoutineRepository implements RoutineRepository {
  _FakeRoutineRepository({this.routines = const [], this.loadError});

  final List<RoutineWithCounts> routines;
  final Object? loadError;
  final archivedIds = <String>[];
  final unarchivedIds = <String>[];

  @override
  Future<List<RoutineWithCounts>> getAllWithDayCount({
    bool includeArchived = false,
  }) async {
    if (loadError != null) {
      throw loadError!;
    }
    return routines;
  }

  @override
  Future<void> archive(String id) async {
    archivedIds.add(id);
  }

  @override
  Future<void> unarchive(String id) async {
    unarchivedIds.add(id);
  }

  @override
  Future<RoutineEntity> create(CreateRoutineData data) {
    throw UnimplementedError();
  }

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
  Future<void> delete(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> deleteDay(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> deleteExercise(String id) {
    throw UnimplementedError();
  }

  @override
  Future<FullRoutine> duplicate(String id, String newName) {
    throw UnimplementedError();
  }

  @override
  Future<List<RoutineEntity>> getAll({bool includeArchived = false}) {
    throw UnimplementedError();
  }

  @override
  Future<RoutineEntity?> getById(String id) {
    throw UnimplementedError();
  }

  @override
  Future<List<RoutineDayEntity>> getDays(String routineId) {
    throw UnimplementedError();
  }

  @override
  Future<List<RoutineExerciseWithExercise>> getExercises(String dayId) {
    throw UnimplementedError();
  }

  @override
  Future<FullRoutine?> getFullRoutine(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> reorderDays(String routineId, List<String> dayIds) {
    throw UnimplementedError();
  }

  @override
  Future<void> reorderExercises(String dayId, List<String> exerciseIds) {
    throw UnimplementedError();
  }

  @override
  Future<FullRoutine> saveDraft(RoutineDraft draft) {
    throw UnimplementedError();
  }

  @override
  Future<void> update(String id, UpdateRoutineData updates) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateDay(String id, UpdateRoutineDayData updates) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateExercise(String id, UpdateRoutineExerciseData updates) {
    throw UnimplementedError();
  }
}
