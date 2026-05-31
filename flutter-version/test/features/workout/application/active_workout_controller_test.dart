import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/core/optional_field.dart';
import 'package:zenlift/features/exercises/domain/exercise.dart';
import 'package:zenlift/features/workout/application/active_workout_controller.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';
import 'package:zenlift/features/workout/domain/workout_repository.dart';

void main() {
  late FakeWorkoutRepository repository;
  late InMemoryActiveWorkoutSessionStore sessionStore;
  late InMemoryPendingSetWriteStore pendingSetWriteStore;
  late ActiveWorkoutController controller;

  setUp(() {
    repository = FakeWorkoutRepository();
    sessionStore = InMemoryActiveWorkoutSessionStore();
    pendingSetWriteStore = InMemoryPendingSetWriteStore();
    controller = ActiveWorkoutController(
      repository: repository,
      sessionStore: sessionStore,
      pendingSetWriteStore: pendingSetWriteStore,
      now: () => DateTime.utc(2026, 5, 30, 12),
    );
  });

  test('recovers active session from persisted id', () async {
    repository.seedFullSession(_fullSession('session-1'));
    await sessionStore.saveActiveSessionId('session-1');

    final recovered = await controller.recoverSession();

    expect(recovered, isTrue);
    expect(controller.state.session?.id, 'session-1');
    expect(controller.state.exercises, hasLength(1));
    expect(await sessionStore.readActiveSessionId(), 'session-1');
  });

  test('falls back to sqlite active session and persists its id', () async {
    repository.seedFullSession(_fullSession('session-2'));
    repository.activeSessionId = 'session-2';

    final recovered = await controller.recoverSession();

    expect(recovered, isTrue);
    expect(controller.state.session?.id, 'session-2');
    expect(await sessionStore.readActiveSessionId(), 'session-2');
  });

  test('clears stale persisted id when no active session exists', () async {
    await sessionStore.saveActiveSessionId('missing');

    final recovered = await controller.recoverSession();

    expect(recovered, isFalse);
    expect(controller.state.session, isNull);
    expect(await sessionStore.readActiveSessionId(), isNull);
  });

  test('quick start creates a session and persists it', () async {
    final session = await controller.quickStart(
      const StartWorkoutParams(name: 'Quick workout'),
    );

    expect(session.id, 'generated-session-1');
    expect(controller.state.session?.name, 'Quick workout');
    expect(await sessionStore.readActiveSessionId(), 'generated-session-1');
  });

  test('quick start continues existing session by default', () async {
    repository.seedFullSession(_fullSession('active-session'));
    repository.activeSessionId = 'active-session';

    final session = await controller.quickStart(
      const StartWorkoutParams(name: 'Ignored new name'),
    );

    expect(session.id, 'active-session');
    expect(repository.cancelledSessionIds, isEmpty);
    expect(controller.state.exercises.single.exercise.name, 'Bench Press');
  });

  test(
    'quick start can cancel existing session before starting a new one',
    () async {
      repository.seedFullSession(_fullSession('old-session'));
      repository.activeSessionId = 'old-session';

      final session = await controller.quickStart(
        const StartWorkoutParams(name: 'Fresh workout'),
        mode: ActiveWorkoutStartMode.startNew,
      );

      expect(repository.cancelledSessionIds, <String>['old-session']);
      expect(session.id, 'generated-session-1');
      expect(controller.state.session?.name, 'Fresh workout');
    },
  );

  test(
    'routine-day quick start copies planned exercises and hydrates state',
    () async {
      repository.seedRoutineDayCopy('routine-day-1', <WorkoutExerciseEntity>[
        _workoutExercise('copied-workout-exercise', 'generated-session-1'),
      ]);

      await controller.quickStart(
        const StartWorkoutParams(
          name: 'Push day',
          routineId: 'routine-1',
          routineDayId: 'routine-day-1',
        ),
      );

      expect(repository.copiedRoutineDayIds, <String>['routine-day-1']);
      expect(controller.state.exercises, hasLength(1));
      expect(
        controller.state.exercises.single.workoutExercise.id,
        'copied-workout-exercise',
      );
    },
  );

  test(
    'add set preloads from previous performance then toggles completion',
    () async {
      repository.seedFullSession(_fullSession('session-1'));
      repository.lastWorkoutData['bench'] = (weight: 85, reps: 6);
      await controller.recoverSession();

      final set = await controller.addSet('workout-exercise-1');
      await controller.toggleSetCompletion(set.id);

      final currentSet = controller.state.exercises.single.sets.single;
      expect(currentSet.weight, 85);
      expect(currentSet.reps, 6);
      expect(currentSet.isCompleted, isTrue);
      expect(currentSet.completedAt, isNotNull);
    },
  );

  test('finish rejects sessions without completed work sets', () async {
    repository.seedFullSession(
      _fullSession(
        'session-1',
        sets: <SetLogEntity>[
          _set('warmup-set', isCompleted: true, setType: SetType.warmup),
        ],
      ),
    );
    await controller.recoverSession();

    expect(
      () => controller.finishWorkout(),
      throwsA(isA<ActiveWorkoutException>()),
    );
  });

  test(
    'finish completes session, clears persisted id, and returns summary',
    () async {
      repository.seedFullSession(
        _fullSession(
          'session-1',
          sets: <SetLogEntity>[
            _set('set-1', weight: 100, reps: 5, isCompleted: true),
            _set('set-2', weight: 40, reps: 12, isCompleted: true),
            _set('set-3', weight: 20, reps: 12, isCompleted: true),
          ],
        ),
      );
      await sessionStore.saveActiveSessionId('session-1');
      await controller.recoverSession();

      final summary = await controller.finishWorkout();

      expect(repository.completedSessionIds, <String>['session-1']);
      expect(summary.completedSetCount, 3);
      expect(summary.totalVolume, 1220);
      expect(summary.personalRecordCount, greaterThan(0));
      expect(
        repository.addedPRs.map((record) => record.type),
        contains(PersonalRecordType.maxWeight),
      );
      expect(controller.state.session, isNull);
      expect(await sessionStore.readActiveSessionId(), isNull);
    },
  );

  test('updates set type and notes through repository autosave', () async {
    repository.seedFullSession(
      _fullSession('session-1', sets: <SetLogEntity>[_set('set-1')]),
    );
    await controller.recoverSession();

    await controller.updateSet(
      'set-1',
      setType: SetType.failure,
      notes: const OptionalField('Hard last rep'),
    );

    final set = controller.state.exercises.single.sets.single;
    expect(set.setType, SetType.failure);
    expect(set.notes, 'Hard last rep');
  });

  test('persists pending completed set write after retries fail', () async {
    repository.seedFullSession(
      _fullSession('session-1', sets: <SetLogEntity>[_set('set-1')]),
    );
    repository.failCompleteSetAttempts = activeWorkoutCompletedSetRetryLimit;
    await controller.recoverSession();

    await expectLater(
      controller.toggleSetCompletion('set-1'),
      throwsA(isA<ActiveWorkoutException>()),
    );

    final pendingWrites = await pendingSetWriteStore
        .readPendingCompletedSetWrites();
    expect(pendingWrites.single.setId, 'set-1');
    expect(pendingWrites.single.weight, 0);
    expect(pendingWrites.single.reps, 0);
    expect(controller.state.hasPendingSetWrites, isTrue);
    expect(controller.state.lastError, contains('pending'));
  });

  test('retries pending completed set writes during recovery', () async {
    repository.seedFullSession(
      _fullSession('session-1', sets: <SetLogEntity>[_set('set-1')]),
    );
    await sessionStore.saveActiveSessionId('session-1');
    await pendingSetWriteStore.savePendingCompletedSetWrite(
      PendingCompletedSetWrite(
        setId: 'set-1',
        workoutExerciseId: 'workout-exercise-1',
        weight: 70,
        reps: 7,
        setType: SetType.normal,
        isCompleted: true,
        completedAt: DateTime.utc(2026, 5, 30, 12),
      ),
    );

    final recovered = await controller.recoverSession();

    expect(recovered, isTrue);
    expect(await pendingSetWriteStore.readPendingCompletedSetWrites(), isEmpty);
    final set = controller.state.exercises.single.sets.single;
    expect(set.isCompleted, isTrue);
    expect(set.weight, 70);
    expect(set.reps, 7);
  });
}

class FakeWorkoutRepository implements WorkoutRepository {
  final _fullSessions = <String, FullWorkoutSession>{};
  final _sets = <String, SetLogEntity>{};
  final _setsByWorkoutExercise = <String, List<SetLogEntity>>{};
  final copiedRoutineDayIds = <String>[];
  final cancelledSessionIds = <String>[];
  final completedSessionIds = <String>[];
  final addedPRs = <AddPersonalRecordData>[];
  final latestPRs = <PersonalRecordEntity>[];
  final lastWorkoutData = <String, ({double weight, int reps})>{};
  final _routineDayCopies = <String, List<WorkoutExerciseEntity>>{};
  String? activeSessionId;
  var failCompleteSetAttempts = 0;
  var _sessionSequence = 0;
  var _setSequence = 0;

  void seedFullSession(FullWorkoutSession session) {
    _fullSessions[session.session.id] = session;
    if (session.session.status == WorkoutStatus.active) {
      activeSessionId = session.session.id;
    }
    for (final exercise in session.exercises) {
      _setsByWorkoutExercise[exercise.workoutExercise.id] = [...exercise.sets];
      for (final set in exercise.sets) {
        _sets[set.id] = set;
      }
    }
  }

  void seedRoutineDayCopy(
    String routineDayId,
    List<WorkoutExerciseEntity> exercises,
  ) {
    _routineDayCopies[routineDayId] = exercises;
  }

  @override
  Future<WorkoutSessionEntity> createSession(
    CreateWorkoutSessionData data,
  ) async {
    _sessionSequence += 1;
    final session = WorkoutSessionEntity(
      id: data.id ?? 'generated-session-$_sessionSequence',
      routineId: data.routineId,
      routineDayId: data.routineDayId,
      name: data.name,
      startedAt: DateTime.utc(2026, 5, 30, 11),
      endedAt: null,
      durationSeconds: null,
      status: WorkoutStatus.active,
      notes: null,
      createdAt: DateTime.utc(2026, 5, 30, 11),
      updatedAt: DateTime.utc(2026, 5, 30, 11),
    );
    _fullSessions[session.id] = FullWorkoutSession(
      session: session,
      routine: null,
      routineDay: null,
      exercises: const <WorkoutExerciseWithSets>[],
      personalRecords: const <PersonalRecordEntity>[],
    );
    activeSessionId = session.id;
    return session;
  }

  @override
  Future<WorkoutSessionEntity?> getSession(String id) async {
    return _fullSessions[id]?.session;
  }

  @override
  Future<WorkoutSessionEntity?> getActiveSession() async {
    return activeSessionId == null
        ? null
        : _fullSessions[activeSessionId]?.session;
  }

  @override
  Future<FullWorkoutSession?> getFullSession(String id) async {
    return _fullSessions[id];
  }

  @override
  Future<List<WorkoutExerciseEntity>> addRoutineDayExercisesToSession(
    String sessionId,
    String routineDayId,
  ) async {
    copiedRoutineDayIds.add(routineDayId);
    final copied = _routineDayCopies[routineDayId] ?? const [];
    final current = _fullSessions[sessionId];
    if (current != null) {
      _fullSessions[sessionId] = FullWorkoutSession(
        session: current.session,
        routine: current.routine,
        routineDay: current.routineDay,
        exercises: copied
            .map(
              (workoutExercise) => WorkoutExerciseWithSets(
                workoutExercise: workoutExercise,
                exercise: _exercise(workoutExercise.exerciseId),
                sets: const <SetLogEntity>[],
              ),
            )
            .toList(),
        personalRecords: current.personalRecords,
      );
    }
    return copied;
  }

  @override
  Future<WorkoutExerciseEntity> addExercise(
    String sessionId,
    String exerciseId,
  ) async {
    final current = _fullSessions[sessionId];
    if (current == null) {
      throw StateError('Missing session');
    }
    final workoutExercise = _workoutExercise(
      'workout-exercise-${current.exercises.length + 1}',
      sessionId,
      exerciseId: exerciseId,
      sortOrder: current.exercises.length + 1,
    );
    _fullSessions[sessionId] = FullWorkoutSession(
      session: current.session,
      routine: current.routine,
      routineDay: current.routineDay,
      exercises: [
        ...current.exercises,
        WorkoutExerciseWithSets(
          workoutExercise: workoutExercise,
          exercise: _exercise(exerciseId),
          sets: const <SetLogEntity>[],
        ),
      ],
      personalRecords: current.personalRecords,
    );
    return workoutExercise;
  }

  @override
  Future<SetLogEntity> addSet(String workoutExerciseId, AddSetData data) async {
    _setSequence += 1;
    final set = _set(
      'generated-set-$_setSequence',
      workoutExerciseId: workoutExerciseId,
      setNumber: (_setsByWorkoutExercise[workoutExerciseId]?.length ?? 0) + 1,
      weight: data.weight,
      reps: data.reps,
      setType: data.setType,
      notes: data.notes,
    );
    _sets[set.id] = set;
    _setsByWorkoutExercise.update(
      workoutExerciseId,
      (sets) => [...sets, set],
      ifAbsent: () => [set],
    );
    _replaceExerciseSets(workoutExerciseId);
    return set;
  }

  @override
  Future<void> completeSet(String id) async {
    if (failCompleteSetAttempts > 0) {
      failCompleteSetAttempts -= 1;
      throw StateError('Transient complete-set failure');
    }
    final set = _sets[id];
    if (set == null) {
      return;
    }
    _sets[id] = _copySet(
      set,
      isCompleted: true,
      completedAt: OptionalField(DateTime.utc(2026, 5, 30, 12)),
    );
    _replaceExerciseSets(set.workoutExerciseId);
  }

  @override
  Future<void> uncompleteSet(String id) async {
    final set = _sets[id];
    if (set == null) {
      return;
    }
    _sets[id] = _copySet(set, isCompleted: false, completedAt: null);
    _replaceExerciseSets(set.workoutExerciseId);
  }

  @override
  Future<void> updateSet(String id, UpdateSetData data) async {
    final set = _sets[id];
    if (set == null) {
      return;
    }
    _sets[id] = _copySet(
      set,
      weight: data.weight ?? set.weight,
      reps: data.reps ?? set.reps,
      setType: data.setType ?? set.setType,
      notes: data.notes,
    );
    _replaceExerciseSets(set.workoutExerciseId);
  }

  @override
  Future<void> deleteSet(String id) async {
    final set = _sets.remove(id);
    if (set == null) {
      return;
    }
    _setsByWorkoutExercise.update(
      set.workoutExerciseId,
      (sets) => sets.where((item) => item.id != id).toList(),
    );
    _replaceExerciseSets(set.workoutExerciseId);
  }

  @override
  Future<List<SetLogEntity>> getSets(String workoutExerciseId) async {
    return _setsByWorkoutExercise[workoutExerciseId] ?? const [];
  }

  @override
  Future<({double weight, int reps})?> getLastWorkoutExerciseData(
    String exerciseId,
  ) async {
    return lastWorkoutData[exerciseId];
  }

  @override
  Future<void> completeSession(String id) async {
    completedSessionIds.add(id);
    final current = _fullSessions[id];
    if (current == null) {
      return;
    }
    _fullSessions[id] = FullWorkoutSession(
      session: WorkoutSessionEntity(
        id: current.session.id,
        routineId: current.session.routineId,
        routineDayId: current.session.routineDayId,
        name: current.session.name,
        startedAt: current.session.startedAt,
        endedAt: DateTime.utc(2026, 5, 30, 12),
        durationSeconds: 3600,
        status: WorkoutStatus.completed,
        notes: current.session.notes,
        createdAt: current.session.createdAt,
        updatedAt: DateTime.utc(2026, 5, 30, 12),
      ),
      routine: current.routine,
      routineDay: current.routineDay,
      exercises: current.exercises,
      personalRecords: current.personalRecords,
    );
    activeSessionId = null;
  }

  @override
  Future<void> cancelSession(String id) async {
    cancelledSessionIds.add(id);
    if (activeSessionId == id) {
      activeSessionId = null;
    }
  }

  @override
  Future<List<WorkoutSessionEntity>> getHistory({
    int limit = 20,
    int offset = 0,
  }) async {
    return _fullSessions.values.map((full) => full.session).toList();
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsBySession(String sessionId) async {
    return _fullSessions[sessionId]?.personalRecords ??
        const <PersonalRecordEntity>[];
  }

  void _replaceExerciseSets(String workoutExerciseId) {
    final nextSets =
        (_setsByWorkoutExercise[workoutExerciseId] ?? const <SetLogEntity>[])
            .map((set) => _sets[set.id] ?? set)
            .toList();
    _setsByWorkoutExercise[workoutExerciseId] = nextSets;
    for (final entry in _fullSessions.entries.toList()) {
      final exercises = entry.value.exercises;
      if (!exercises.any(
        (exercise) => exercise.workoutExercise.id == workoutExerciseId,
      )) {
        continue;
      }
      _fullSessions[entry.key] = FullWorkoutSession(
        session: entry.value.session,
        routine: entry.value.routine,
        routineDay: entry.value.routineDay,
        exercises: exercises
            .map(
              (exercise) => exercise.workoutExercise.id == workoutExerciseId
                  ? WorkoutExerciseWithSets(
                      workoutExercise: exercise.workoutExercise,
                      exercise: exercise.exercise,
                      sets: nextSets,
                    )
                  : exercise,
            )
            .toList(),
        personalRecords: entry.value.personalRecords,
      );
    }
  }

  @override
  Future<PersonalRecordEntity> addPR(AddPersonalRecordData data) async {
    addedPRs.add(data);
    final record = PersonalRecordEntity(
      id: 'pr-${addedPRs.length}',
      exerciseId: data.exerciseId,
      workoutSessionId: data.workoutSessionId,
      type: data.type,
      value: data.value,
      weight: data.weight,
      reps: data.reps,
      achievedAt: DateTime.utc(2026, 5, 30, 12),
    );
    latestPRs.add(record);
    return record;
  }

  @override
  Future<void> deleteSession(String id) {
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
  Future<List<PersonalRecordEntity>> getLatestPRs({int limit = 10}) async {
    return latestPRs.take(limit).toList();
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsByExercise(String exerciseId) {
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
  Future<void> removeExercise(String id) {
    throw UnimplementedError();
  }

  @override
  Future<void> updateSessionNotes(String sessionId, String notes) {
    throw UnimplementedError();
  }
}

class InMemoryActiveWorkoutSessionStore implements ActiveWorkoutSessionStore {
  String? _id;

  @override
  Future<void> clearActiveSessionId() async {
    _id = null;
  }

  @override
  Future<String?> readActiveSessionId() async {
    return _id;
  }

  @override
  Future<void> saveActiveSessionId(String id) async {
    _id = id;
  }
}

class InMemoryPendingSetWriteStore
    implements ActiveWorkoutPendingSetWriteStore {
  final _writes = <String, PendingCompletedSetWrite>{};

  @override
  Future<List<PendingCompletedSetWrite>> readPendingCompletedSetWrites() async {
    return _writes.values.toList();
  }

  @override
  Future<void> removePendingCompletedSetWrite(String setId) async {
    _writes.remove(setId);
  }

  @override
  Future<void> savePendingCompletedSetWrite(
    PendingCompletedSetWrite write,
  ) async {
    _writes[write.setId] = write;
  }
}

FullWorkoutSession _fullSession(
  String id, {
  List<SetLogEntity> sets = const <SetLogEntity>[],
}) {
  final session = WorkoutSessionEntity(
    id: id,
    routineId: null,
    routineDayId: null,
    name: 'Active workout',
    startedAt: DateTime.utc(2026, 5, 30, 11),
    endedAt: null,
    durationSeconds: null,
    status: WorkoutStatus.active,
    notes: null,
    createdAt: DateTime.utc(2026, 5, 30, 11),
    updatedAt: DateTime.utc(2026, 5, 30, 11),
  );
  return FullWorkoutSession(
    session: session,
    routine: null,
    routineDay: null,
    exercises: <WorkoutExerciseWithSets>[
      WorkoutExerciseWithSets(
        workoutExercise: _workoutExercise('workout-exercise-1', id),
        exercise: _exercise('bench'),
        sets: sets,
      ),
    ],
    personalRecords: const <PersonalRecordEntity>[],
  );
}

WorkoutExerciseEntity _workoutExercise(
  String id,
  String sessionId, {
  String exerciseId = 'bench',
  int sortOrder = 1,
}) {
  return WorkoutExerciseEntity(
    id: id,
    workoutSessionId: sessionId,
    exerciseId: exerciseId,
    sortOrder: sortOrder,
    notes: null,
  );
}

ExerciseEntity _exercise(String id) {
  return ExerciseEntity(
    id: id,
    name: id == 'bench' ? 'Bench Press' : 'Exercise $id',
    equipment: 'barbell',
    category: 'strength',
    isCustom: false,
    isFavorite: false,
    notes: null,
    createdAt: null,
    updatedAt: null,
  );
}

SetLogEntity _set(
  String id, {
  String workoutExerciseId = 'workout-exercise-1',
  int setNumber = 1,
  double weight = 0,
  int reps = 0,
  SetType setType = SetType.normal,
  bool isCompleted = false,
  DateTime? completedAt,
  String? notes,
}) {
  return SetLogEntity(
    id: id,
    workoutExerciseId: workoutExerciseId,
    setNumber: setNumber,
    weight: weight,
    reps: reps,
    setType: setType,
    isCompleted: isCompleted,
    completedAt: completedAt,
    notes: notes,
  );
}

SetLogEntity _copySet(
  SetLogEntity set, {
  double? weight,
  int? reps,
  SetType? setType,
  bool? isCompleted,
  OptionalField<DateTime?>? completedAt,
  OptionalField<String?>? notes,
}) {
  return SetLogEntity(
    id: set.id,
    workoutExerciseId: set.workoutExerciseId,
    setNumber: set.setNumber,
    weight: weight ?? set.weight,
    reps: reps ?? set.reps,
    setType: setType ?? set.setType,
    isCompleted: isCompleted ?? set.isCompleted,
    completedAt: completedAt == null ? set.completedAt : completedAt.value,
    notes: notes == null ? set.notes : notes.value,
  );
}
