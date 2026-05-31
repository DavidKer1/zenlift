import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/application/exercise_detail_controller.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/domain/workout_repository.dart';

void main() {
  test(
    'loads exercise detail with muscles performance history and PRs',
    () async {
      final controller = ExerciseDetailController(
        exerciseRepository: _FakeExerciseRepository(),
        workoutRepository: _FakeWorkoutRepository(),
      );

      final state = await controller.load('bench');

      expect(state.exercise?.name, 'Bench Press');
      expect(state.muscles.single.displayNameEs, 'Pecho');
      expect(state.bestPerformance.maxWeight, 100);
      expect(state.bestPerformance.bestEstimatedOneRepMax, greaterThan(120));
      expect(state.bestPerformance.maxVolume, 1000);
      expect(state.history, hasLength(2));
      expect(state.personalRecords.single.type, PersonalRecordType.maxWeight);
    },
  );

  test('returns not found state when exercise is missing', () async {
    final controller = ExerciseDetailController(
      exerciseRepository: _FakeExerciseRepository(missing: true),
      workoutRepository: _FakeWorkoutRepository(),
    );

    final state = await controller.load('missing');

    expect(state.exercise, isNull);
    expect(state.errorMessage, 'Exercise not found.');
  });
}

class _FakeExerciseRepository implements ExerciseRepository {
  _FakeExerciseRepository({this.missing = false});

  final bool missing;

  @override
  Future<ExerciseEntity?> getById(String id) async {
    if (missing) {
      return null;
    }
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

  @override
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) async {
    return const [
      MuscleGroupEntity(
        id: 'chest',
        name: 'chest',
        displayNameEs: 'Pecho',
        color: '#ffcc00',
      ),
    ];
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

class _FakeWorkoutRepository implements WorkoutRepository {
  @override
  Future<List<PreviousPerformance>> getPreviousPerformance(
    String exerciseId, {
    int limit = 5,
  }) async {
    return [
      PreviousPerformance(
        startedAt: DateTime.utc(2026, 5, 30),
        weight: 100,
        reps: 10,
        setType: SetType.normal,
      ),
      PreviousPerformance(
        startedAt: DateTime.utc(2026, 5, 29),
        weight: 80,
        reps: 12,
        setType: SetType.warmup,
      ),
    ];
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsByExercise(String exerciseId) async {
    return [
      PersonalRecordEntity(
        id: 'pr',
        exerciseId: exerciseId,
        workoutSessionId: 'session',
        type: PersonalRecordType.maxWeight,
        value: 100,
        weight: 100,
        reps: 10,
        achievedAt: DateTime.utc(2026, 5, 30),
      ),
    ];
  }

  @override
  Future<PersonalRecordEntity> addPR(AddPersonalRecordData data) {
    throw UnimplementedError();
  }

  @override
  Future<WorkoutExerciseEntity> addExercise(
    String sessionId,
    String exerciseId,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<List<WorkoutExerciseEntity>> addRoutineDayExercisesToSession(
    String sessionId,
    String routineDayId,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<void> cancelSession(String id) => throw UnimplementedError();

  @override
  Future<void> completeSession(String id) => throw UnimplementedError();

  @override
  Future<WorkoutSessionEntity> createSession(CreateWorkoutSessionData data) {
    throw UnimplementedError();
  }

  @override
  Future<void> deleteSession(String id) => throw UnimplementedError();

  @override
  Future<void> deleteSet(String id) => throw UnimplementedError();

  @override
  Future<WorkoutSessionEntity?> getActiveSession() =>
      throw UnimplementedError();

  @override
  Future<List<WorkoutExerciseEntity>> getExercises(String sessionId) {
    throw UnimplementedError();
  }

  @override
  Future<FullWorkoutSession?> getFullSession(String id) {
    throw UnimplementedError();
  }

  @override
  Future<List<WorkoutSessionEntity>> getHistory({
    int limit = 20,
    int offset = 0,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<List<WorkoutSessionEntity>> getHistoryByRoutine(String routineId) {
    throw UnimplementedError();
  }

  @override
  Future<({double weight, int reps})?> getLastWorkoutExerciseData(
    String exerciseId,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<List<PersonalRecordEntity>> getLatestPRs({int limit = 10}) {
    throw UnimplementedError();
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsBySession(String sessionId) {
    throw UnimplementedError();
  }

  @override
  Future<WorkoutSessionEntity?> getSession(String id) =>
      throw UnimplementedError();

  @override
  Future<List<SetLogEntity>> getSets(String workoutExerciseId) {
    throw UnimplementedError();
  }

  @override
  Future<SetLogEntity> addSet(String workoutExerciseId, AddSetData data) {
    throw UnimplementedError();
  }

  @override
  Future<void> completeSet(String id) => throw UnimplementedError();

  @override
  Future<void> removeExercise(String id) => throw UnimplementedError();

  @override
  Future<void> uncompleteSet(String id) => throw UnimplementedError();

  @override
  Future<void> updateSessionNotes(String sessionId, String notes) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateSet(String id, UpdateSetData data) {
    throw UnimplementedError();
  }
}
