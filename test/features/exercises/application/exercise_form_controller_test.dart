import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/application/exercise_form_controller.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_form.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';

void main() {
  test('loads create defaults with muscle options', () async {
    final controller = ExerciseFormController(
      exerciseRepository: _FakeExerciseRepository(),
      muscleGroupRepository: _FakeMuscleGroupRepository(),
    );

    final state = await controller.loadCreate();

    expect(state.mode, ExerciseFormMode.create);
    expect(state.draft.name, '');
    expect(state.muscleGroups.map((muscle) => muscle.displayNameEs), [
      'Pecho',
      'Espalda',
    ]);
  });

  test('loads edit draft with primary and secondary muscles', () async {
    final controller = ExerciseFormController(
      exerciseRepository: _FakeExerciseRepository(),
      muscleGroupRepository: _FakeMuscleGroupRepository(),
    );

    final state = await controller.loadEdit('bench');

    expect(state.mode, ExerciseFormMode.edit);
    expect(state.draft.id, 'bench');
    expect(state.draft.primaryMuscleGroupId, 'chest');
    expect(state.draft.secondaryMuscleGroupIds, ['back']);
  });

  test(
    'loads edit draft with canonical seeded equipment and category',
    () async {
      final controller = ExerciseFormController(
        exerciseRepository: _FakeExerciseRepository(
          exercise: _exercise(
            id: 'bench',
            name: 'Bench Press',
            equipment: 'Barbell',
            category: 'Chest',
          ),
        ),
        muscleGroupRepository: _FakeMuscleGroupRepository(),
      );

      final state = await controller.loadEdit('bench');

      expect(state.draft.equipment, 'barbell');
      expect(state.draft.category, 'strength');
    },
  );

  test('loadCreate reports unavailable form when muscles are empty', () async {
    final controller = ExerciseFormController(
      exerciseRepository: _FakeExerciseRepository(),
      muscleGroupRepository: _FakeMuscleGroupRepository(
        muscles: const <MuscleGroupEntity>[],
      ),
    );

    final state = await controller.loadCreate();

    expect(state.muscleGroups, isEmpty);
    expect(state.errorMessage, 'No se pudieron cargar los músculos.');
  });

  test('validates and blocks duplicate names before save', () async {
    final repository = _FakeExerciseRepository(
      searchResults: [_exercise(id: 'other', name: 'Bench Press')],
    );
    final controller = ExerciseFormController(
      exerciseRepository: repository,
      muscleGroupRepository: _FakeMuscleGroupRepository(),
    );

    await expectLater(
      controller.save(
        const ExerciseDraft(
          name: ' bench press ',
          primaryMuscleGroupId: 'chest',
          equipment: 'barbell',
          category: 'strength',
        ),
      ),
      throwsA(isA<ExerciseFormValidationException>()),
    );
    expect(repository.savedDraft, isNull);
  });

  test('normalizes valid draft and saves through repository', () async {
    final repository = _FakeExerciseRepository();
    final controller = ExerciseFormController(
      exerciseRepository: repository,
      muscleGroupRepository: _FakeMuscleGroupRepository(),
    );

    final saved = await controller.save(
      const ExerciseDraft(
        name: ' Incline Press ',
        primaryMuscleGroupId: 'chest',
        secondaryMuscleGroupIds: ['back', 'chest'],
        equipment: 'barbell',
        category: 'strength',
        notes: '  Low incline  ',
      ),
    );

    expect(saved.name, 'Incline Press');
    expect(repository.savedDraft?.name, 'Incline Press');
    expect(repository.savedDraft?.notes, 'Low incline');
    expect(repository.savedDraft?.secondaryMuscleGroupIds, ['back']);
  });
}

ExerciseEntity _exercise({
  String id = 'bench',
  String name = 'Bench Press',
  String equipment = 'barbell',
  String category = 'strength',
}) {
  return ExerciseEntity(
    id: id,
    name: name,
    equipment: equipment,
    category: category,
    isCustom: true,
    isFavorite: false,
    notes: 'Keep shoulders pinned',
    createdAt: null,
    updatedAt: null,
  );
}

class _FakeExerciseRepository implements ExerciseRepository {
  _FakeExerciseRepository({
    this.searchResults = const <ExerciseEntity>[],
    ExerciseEntity? exercise,
  }) : exercise = exercise ?? _exercise();

  final List<ExerciseEntity> searchResults;
  final ExerciseEntity exercise;
  ExerciseDraft? savedDraft;

  @override
  Future<ExerciseEntity?> getById(String id) async => exercise;

  @override
  Future<List<MuscleEntry>> getMuscleEntries(String exerciseId) async {
    return const [
      MuscleEntry(muscleGroupId: 'chest', role: MuscleRole.primary),
      MuscleEntry(muscleGroupId: 'back', role: MuscleRole.secondary),
    ];
  }

  @override
  Future<List<ExerciseEntity>> search(String query) async => searchResults;

  @override
  Future<ExerciseEntity> saveDraft(ExerciseDraft draft) async {
    savedDraft = draft;
    return _exercise(id: draft.id ?? 'created', name: draft.name);
  }

  @override
  Future<void> addMuscle(
    String exerciseId,
    String muscleGroupId,
    MuscleRole role,
  ) => throw UnimplementedError();

  @override
  Future<ExerciseEntity> create(
    CreateExerciseData data,
    List<MuscleEntry> muscles,
  ) => throw UnimplementedError();

  @override
  Future<void> delete(String id) => throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getAll() => throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getByCategory(String category) =>
      throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getByEquipment(String equipment) =>
      throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getByMuscle(String muscleGroupId) =>
      throw UnimplementedError();

  @override
  Future<List<ExerciseEntity>> getFavorites() => throw UnimplementedError();

  @override
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) =>
      throw UnimplementedError();

  @override
  Future<void> removeMuscle(String exerciseId, String muscleGroupId) =>
      throw UnimplementedError();

  @override
  Future<ExerciseEntity?> toggleFavorite(String id) =>
      throw UnimplementedError();

  @override
  Future<ExerciseEntity?> update(String id, UpdateExerciseData updates) =>
      throw UnimplementedError();
}

class _FakeMuscleGroupRepository implements MuscleGroupRepository {
  _FakeMuscleGroupRepository({
    this.muscles = const <MuscleGroupEntity>[
      MuscleGroupEntity(
        id: 'chest',
        name: 'chest',
        displayNameEs: 'Pecho',
        color: '#EF4444',
      ),
      MuscleGroupEntity(
        id: 'back',
        name: 'back',
        displayNameEs: 'Espalda',
        color: '#EF4444',
      ),
    ],
  });

  final List<MuscleGroupEntity> muscles;

  @override
  Future<List<MuscleGroupEntity>> getAll() async => muscles;

  @override
  Future<MuscleGroupEntity?> getById(String id) => throw UnimplementedError();
}
