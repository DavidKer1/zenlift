import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/exercises/domain/exercise_repository.dart';
import 'package:zenlift/features/home/application/home_dashboard_controller.dart';
import 'package:zenlift/features/home/domain/home_dashboard.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/routines/domain/routine_repository.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/domain/workout_repository.dart';

void main() {
  test('loads Home dashboard summaries from domain repositories', () async {
    final controller = HomeDashboardController(
      workoutRepository: _FakeWorkoutRepository(
        history: <WorkoutSessionEntity>[
          _session(
            id: 'session-3',
            name: 'Push day',
            routineId: 'routine-1',
            routineDayId: 'day-1',
            startedAt: DateTime(2026, 5, 27, 8),
          ),
          _session(
            id: 'session-2',
            name: 'Legs',
            routineId: 'routine-2',
            routineDayId: 'day-2',
            startedAt: DateTime(2026, 5, 25, 8),
          ),
          _session(
            id: 'session-1',
            name: 'Old pull',
            startedAt: DateTime(2026, 4, 10, 8),
          ),
        ],
        personalRecords: <PersonalRecordEntity>[
          _pr('pr-1', exerciseId: 'bench', value: 100),
        ],
      ),
      routineRepository: _FakeRoutineRepository(
        routines: <RoutineWithCounts>[
          RoutineWithCounts(
            routine: _routine('routine-1', 'Strength A'),
            dayCount: 4,
            exerciseCount: 18,
          ),
        ],
      ),
      exerciseRepository: _FakeExerciseRepository(
        exercises: <String, ExerciseEntity>{'bench': _exercise('bench')},
      ),
      now: () => DateTime(2026, 5, 30, 12),
    );

    final state = await controller.load();

    expect(state.hasError, isFalse);
    expect(state.currentRoutine?.name, 'Strength A');
    expect(state.currentRoutine?.dayCount, 4);
    expect(state.weeklyActivity.workoutCount, 2);
    expect(state.weeklyActivity.activeDays, <bool>[
      true,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(state.calendar.activityDates, hasLength(3));
    expect(state.calendar.latestWorkout?.title, 'Push day');
    expect(state.calendar.latestWorkout?.canRepeat, isTrue);
    expect(state.calendar.latestWorkout?.frequencyCount, 1);
    expect(state.recentPersonalRecords.single.exerciseName, 'Bench Press');
  });

  test('falls back to empty sections and reports recoverable errors', () async {
    final controller = HomeDashboardController(
      workoutRepository: _FakeWorkoutRepository(shouldThrow: true),
      routineRepository: _FakeRoutineRepository(shouldThrow: true),
      exerciseRepository: _FakeExerciseRepository(shouldThrow: true),
      now: () => DateTime(2026, 5, 30, 12),
    );

    final state = await controller.load();

    expect(state.hasError, isTrue);
    expect(state.calendar.latestWorkout, isNull);
    expect(
      state.weeklyActivity.activeDays,
      HomeWeeklyActivity.empty.activeDays,
    );
    expect(state.weeklyActivity.workoutCount, 0);
    expect(state.currentRoutine, isNull);
    expect(state.recentPersonalRecords, isEmpty);
  });
}

WorkoutSessionEntity _session({
  required String id,
  required String name,
  required DateTime startedAt,
  String? routineId,
  String? routineDayId,
}) {
  return WorkoutSessionEntity(
    id: id,
    routineId: routineId,
    routineDayId: routineDayId,
    name: name,
    startedAt: startedAt,
    endedAt: startedAt.add(const Duration(hours: 1)),
    durationSeconds: 3600,
    status: WorkoutStatus.completed,
    notes: null,
    createdAt: startedAt,
    updatedAt: startedAt,
  );
}

PersonalRecordEntity _pr(
  String id, {
  required String exerciseId,
  required double value,
}) {
  return PersonalRecordEntity(
    id: id,
    exerciseId: exerciseId,
    workoutSessionId: 'session-1',
    type: PersonalRecordType.maxWeight,
    value: value,
    weight: value,
    reps: 1,
    achievedAt: DateTime(2026, 5, 27),
  );
}

RoutineEntity _routine(String id, String name) {
  return RoutineEntity(
    id: id,
    name: name,
    description: null,
    goal: null,
    isArchived: false,
    sortOrder: 0,
    createdAt: null,
    updatedAt: null,
  );
}

ExerciseEntity _exercise(String id) {
  return ExerciseEntity(
    id: id,
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    isCustom: false,
    isFavorite: false,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

class _FakeWorkoutRepository implements WorkoutRepository {
  _FakeWorkoutRepository({
    this.history = const <WorkoutSessionEntity>[],
    this.personalRecords = const <PersonalRecordEntity>[],
    this.shouldThrow = false,
  });

  final List<WorkoutSessionEntity> history;
  final List<PersonalRecordEntity> personalRecords;
  final bool shouldThrow;

  @override
  Future<List<WorkoutSessionEntity>> getHistory({
    int limit = 20,
    int offset = 0,
  }) async {
    if (shouldThrow) {
      throw StateError('history failed');
    }
    return history;
  }

  @override
  Future<List<PersonalRecordEntity>> getLatestPRs({int limit = 10}) async {
    if (shouldThrow) {
      throw StateError('prs failed');
    }
    return personalRecords.take(limit).toList();
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
  Future<SetLogEntity> addSet(String workoutExerciseId, AddSetData data) {
    throw UnimplementedError();
  }

  @override
  Future<void> cancelSession(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> completeSession(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> completeSet(String id) {
    throw UnimplementedError();
  }

  @override
  Future<WorkoutSessionEntity> createSession(CreateWorkoutSessionData data) {
    throw UnimplementedError();
  }

  @override
  Future<void> deleteSession(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> deleteSet(String id) {
    throw UnimplementedError();
  }

  @override
  Future<WorkoutSessionEntity?> getActiveSession() {
    throw UnimplementedError();
  }

  @override
  Future<List<WorkoutExerciseEntity>> getExercises(String sessionId) {
    throw UnimplementedError();
  }

  @override
  Future<FullWorkoutSession?> getFullSession(String id) {
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
  Future<List<PersonalRecordEntity>> getPRsByExercise(String exerciseId) {
    throw UnimplementedError();
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsBySession(String sessionId) {
    throw UnimplementedError();
  }

  @override
  Future<List<PreviousPerformance>> getPreviousPerformance(
    String exerciseId, {
    int limit = 5,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<WorkoutSessionEntity?> getSession(String id) {
    throw UnimplementedError();
  }

  @override
  Future<List<SetLogEntity>> getSets(String workoutExerciseId) {
    throw UnimplementedError();
  }

  @override
  Future<void> removeExercise(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> uncompleteSet(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateSessionNotes(String sessionId, String notes) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateSet(String id, UpdateSetData data) {
    throw UnimplementedError();
  }
}

class _FakeRoutineRepository implements RoutineRepository {
  _FakeRoutineRepository({
    this.routines = const <RoutineWithCounts>[],
    this.shouldThrow = false,
  });

  final List<RoutineWithCounts> routines;
  final bool shouldThrow;

  @override
  Future<List<RoutineWithCounts>> getAllWithDayCount({
    bool includeArchived = false,
  }) async {
    if (shouldThrow) {
      throw StateError('routines failed');
    }
    return routines;
  }

  @override
  Future<void> archive(String id) {
    throw UnimplementedError();
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
  Future<void> unarchive(String id) {
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

class _FakeExerciseRepository implements ExerciseRepository {
  _FakeExerciseRepository({
    this.exercises = const <String, ExerciseEntity>{},
    this.shouldThrow = false,
  });

  final Map<String, ExerciseEntity> exercises;
  final bool shouldThrow;

  @override
  Future<ExerciseEntity?> getById(String id) async {
    if (shouldThrow) {
      throw StateError('exercise failed');
    }
    return exercises[id];
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
  Future<List<ExerciseEntity>> getAll() {
    throw UnimplementedError();
  }

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
  Future<List<ExerciseEntity>> getFavorites() {
    throw UnimplementedError();
  }

  @override
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) {
    throw UnimplementedError();
  }

  @override
  Future<void> removeMuscle(String exerciseId, String muscleGroupId) {
    throw UnimplementedError();
  }

  @override
  Future<List<ExerciseEntity>> search(String query) {
    throw UnimplementedError();
  }

  @override
  Future<ExerciseEntity?> toggleFavorite(String id) {
    throw UnimplementedError();
  }

  @override
  Future<ExerciseEntity?> update(String id, UpdateExerciseData updates) {
    throw UnimplementedError();
  }
}
