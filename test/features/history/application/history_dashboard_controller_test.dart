import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/history/application/history_dashboard_controller.dart';
import 'package:zenlift/features/routines/domain/routine.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/domain/workout_repository.dart';

void main() {
  test('loads completed workout history summaries', () async {
    final completed = _session(
      id: 'session-1',
      name: 'Push day',
      startedAt: DateTime(2026, 5, 30, 9),
      routineId: 'routine-1',
      routineDayId: 'day-1',
      status: WorkoutStatus.completed,
    );
    final cancelled = _session(
      id: 'session-2',
      name: 'Cancelled',
      startedAt: DateTime(2026, 5, 29, 9),
      status: WorkoutStatus.cancelled,
    );
    final controller = HistoryDashboardController(
      workoutRepository: _FakeWorkoutRepository(
        history: <WorkoutSessionEntity>[cancelled, completed],
        fullSessions: <String, FullWorkoutSession>{
          completed.id: _fullSession(completed),
        },
      ),
    );

    final state = await controller.load();

    expect(state.hasError, isFalse);
    expect(state.workouts, hasLength(1));
    final workout = state.workouts.single;
    expect(workout.title, 'Push day');
    expect(workout.routineName, 'Strength A');
    expect(workout.routineDayName, 'Upper');
    expect(workout.exerciseCount, 1);
    expect(workout.completedSetCount, 1);
    expect(workout.totalVolume, 800);
    expect(workout.personalRecordCount, 1);
    expect(workout.canRepeat, isTrue);
  });

  test('returns empty recoverable state when repository fails', () async {
    final controller = HistoryDashboardController(
      workoutRepository: _FakeWorkoutRepository(shouldThrow: true),
    );

    final state = await controller.load();

    expect(state.hasError, isTrue);
    expect(state.workouts, isEmpty);
  });
}

WorkoutSessionEntity _session({
  required String id,
  required String name,
  required DateTime startedAt,
  required WorkoutStatus status,
  String? routineId,
  String? routineDayId,
}) {
  return WorkoutSessionEntity(
    id: id,
    routineId: routineId,
    routineDayId: routineDayId,
    name: name,
    startedAt: startedAt,
    endedAt: startedAt.add(const Duration(minutes: 75)),
    durationSeconds: 4500,
    status: status,
    notes: null,
    createdAt: startedAt,
    updatedAt: startedAt,
  );
}

FullWorkoutSession _fullSession(WorkoutSessionEntity session) {
  return FullWorkoutSession(
    session: session,
    routine: const RoutineEntity(
      id: 'routine-1',
      name: 'Strength A',
      description: null,
      goal: null,
      isArchived: false,
      sortOrder: 0,
      createdAt: null,
      updatedAt: null,
    ),
    routineDay: const RoutineDayEntity(
      id: 'day-1',
      routineId: 'routine-1',
      name: 'Upper',
      dayOfWeek: 1,
      sortOrder: 0,
    ),
    exercises: <WorkoutExerciseWithSets>[
      WorkoutExerciseWithSets(
        workoutExercise: const WorkoutExerciseEntity(
          id: 'workout-exercise-1',
          workoutSessionId: 'session-1',
          exerciseId: 'bench',
          sortOrder: 0,
          notes: null,
        ),
        exercise: const ExerciseEntity(
          id: 'bench',
          name: 'Bench Press',
          equipment: 'barbell',
          category: 'strength',
          isCustom: false,
          isFavorite: false,
          notes: null,
          createdAt: null,
          updatedAt: null,
        ),
        sets: <SetLogEntity>[
          SetLogEntity(
            id: 'set-1',
            workoutExerciseId: 'workout-exercise-1',
            setNumber: 1,
            weight: 80,
            reps: 10,
            setType: SetType.normal,
            isCompleted: true,
            completedAt: DateTime(2026, 5, 30, 9, 10),
            notes: null,
          ),
          SetLogEntity(
            id: 'set-2',
            workoutExerciseId: 'workout-exercise-1',
            setNumber: 2,
            weight: 40,
            reps: 10,
            setType: SetType.warmup,
            isCompleted: true,
            completedAt: DateTime(2026, 5, 30, 9, 15),
            notes: null,
          ),
        ],
      ),
    ],
    personalRecords: <PersonalRecordEntity>[
      PersonalRecordEntity(
        id: 'pr-1',
        exerciseId: 'bench',
        workoutSessionId: session.id,
        type: PersonalRecordType.maxWeight,
        value: 80,
        weight: 80,
        reps: 10,
        achievedAt: DateTime(2026, 5, 30, 9, 10),
      ),
    ],
  );
}

class _FakeWorkoutRepository implements WorkoutRepository {
  _FakeWorkoutRepository({
    this.history = const <WorkoutSessionEntity>[],
    this.fullSessions = const <String, FullWorkoutSession>{},
    this.shouldThrow = false,
  });

  final List<WorkoutSessionEntity> history;
  final Map<String, FullWorkoutSession> fullSessions;
  final bool shouldThrow;

  @override
  Future<List<WorkoutSessionEntity>> getHistory({
    int limit = 20,
    int offset = 0,
  }) async {
    if (shouldThrow) {
      throw StateError('history failed');
    }
    return history.take(limit).toList();
  }

  @override
  Future<FullWorkoutSession?> getFullSession(String id) async {
    if (shouldThrow) {
      throw StateError('full session failed');
    }
    return fullSessions[id];
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
