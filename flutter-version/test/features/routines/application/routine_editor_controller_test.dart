import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';
import 'package:zenlift/features/routines/application/routine_editor_controller.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_editor.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';

void main() {
  test('loads create defaults with exercise options', () async {
    final controller = RoutineEditorController(
      routineRepository: _FakeRoutineRepository(),
      exerciseRepository: _FakeExerciseRepository(),
    );

    final state = await controller.loadCreate();

    expect(state.mode, RoutineEditorMode.create);
    expect(state.draft.name, isEmpty);
    expect(state.draft.days, isEmpty);
    expect(state.exerciseOptions.single.name, 'Bench Press');
  });

  test('loads edit data preserving ids', () async {
    final controller = RoutineEditorController(
      routineRepository: _FakeRoutineRepository(fullRoutine: _fullRoutine()),
      exerciseRepository: _FakeExerciseRepository(),
    );

    final state = await controller.loadEdit('routine-a');

    expect(state.mode, RoutineEditorMode.edit);
    expect(state.draft.id, 'routine-a');
    expect(state.draft.days.single.id, 'day-a');
    expect(state.draft.days.single.exercises.single.id, 'routine-ex-a');
  });

  test('validates required fields and saves normalized drafts', () async {
    final repository = _FakeRoutineRepository(fullRoutine: _fullRoutine());
    final controller = RoutineEditorController(
      routineRepository: repository,
      exerciseRepository: _FakeExerciseRepository(),
    );

    final invalid = controller.validate(const RoutineDraft(name: '', days: []));
    expect(invalid.messages, contains('El nombre es obligatorio'));
    expect(invalid.messages, contains('La rutina necesita al menos 1 día'));

    await controller.save(
      const RoutineDraft(
        name: ' Push ',
        description: '',
        days: [
          RoutineDayDraft(
            name: ' Día 1 ',
            exercises: [
              RoutineExerciseDraft(exerciseId: 'bench', targetSets: 3),
            ],
          ),
        ],
      ),
    );

    expect(repository.savedDrafts.single.name, 'Push');
    expect(repository.savedDrafts.single.description, isNull);
    expect(repository.savedDrafts.single.days.single.name, 'Día 1');
  });
}

FullRoutine _fullRoutine() {
  return FullRoutine(
    routine: const RoutineEntity(
      id: 'routine-a',
      name: 'Push',
      description: 'Chest day',
      goal: 'strength',
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
          name: 'Día 1',
          dayOfWeek: null,
          sortOrder: 0,
        ),
        exercises: [
          RoutineExerciseWithExercise(
            routineExercise: const RoutineExerciseEntity(
              id: 'routine-ex-a',
              routineDayId: 'day-a',
              exerciseId: 'bench',
              targetSets: 3,
              targetRepsMin: 8,
              targetRepsMax: 12,
              notes: null,
              sortOrder: 0,
            ),
            exercise: _exercise(),
          ),
        ],
      ),
    ],
  );
}

ExerciseEntity _exercise() {
  return const ExerciseEntity(
    id: 'bench',
    name: 'Bench Press',
    equipment: 'Barbell',
    category: 'Chest',
    isCustom: false,
    isFavorite: false,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

class _FakeRoutineRepository implements RoutineRepository {
  _FakeRoutineRepository({this.fullRoutine});

  final FullRoutine? fullRoutine;
  final savedDrafts = <RoutineDraft>[];

  @override
  Future<FullRoutine?> getFullRoutine(String id) async => fullRoutine;

  @override
  Future<FullRoutine> saveDraft(RoutineDraft draft) async {
    savedDrafts.add(draft);
    return fullRoutine ?? _fullRoutine();
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
  Future<void> deleteExercise(String id) => throw UnimplementedError();

  @override
  Future<FullRoutine> duplicate(String id, String newName) {
    throw UnimplementedError();
  }

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
  Future<void> reorderExercises(String dayId, List<String> exerciseIds) {
    throw UnimplementedError();
  }

  @override
  Future<void> unarchive(String id) => throw UnimplementedError();

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

class _FakeExerciseRepository implements ExerciseRepository {
  @override
  Future<List<ExerciseEntity>> getAll() async => [_exercise()];

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
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) {
    throw UnimplementedError();
  }

  @override
  Future<List<MuscleEntry>> getMuscleEntries(String exerciseId) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> getFavorites() => throw UnimplementedError();

  @override
  Future<void> removeMuscle(String exerciseId, String muscleGroupId) {
    throw UnimplementedError();
  }

  @override
  Future<ExerciseEntity> saveDraft(Object draft) {
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
