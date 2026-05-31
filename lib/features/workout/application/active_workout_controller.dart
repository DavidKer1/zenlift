import '../../../core/optional_field.dart';
import '../domain/calculations/one_rep_max.dart';
import '../domain/calculations/volume.dart';
import '../domain/entities/workout_entities.dart' as calculations;
import '../domain/entities/workout_repository_entities.dart';
import '../domain/workout_repository.dart';

typedef ZenliftNow = DateTime Function();

enum ActiveWorkoutStartMode { continueExisting, startNew }

const activeWorkoutCompletedSetRetryLimit = 3;

class StartWorkoutParams {
  const StartWorkoutParams({
    this.name,
    this.routineId,
    this.routineDayId,
    this.exerciseId,
  });

  final String? name;
  final String? routineId;
  final String? routineDayId;
  final String? exerciseId;
}

class WorkoutSummary {
  const WorkoutSummary({
    required this.sessionId,
    required this.routineId,
    required this.routineDayId,
    required this.name,
    required this.startedAt,
    required this.endedAt,
    required this.durationSeconds,
    required this.exerciseCount,
    required this.completedSetCount,
    required this.totalVolume,
    required this.personalRecordCount,
    required this.personalRecords,
  });

  final String sessionId;
  final String? routineId;
  final String? routineDayId;
  final String? name;
  final DateTime startedAt;
  final DateTime endedAt;
  final int durationSeconds;
  final int exerciseCount;
  final int completedSetCount;
  final double totalVolume;
  final int personalRecordCount;
  final List<DetectedPersonalRecord> personalRecords;
}

class DetectedPersonalRecord {
  const DetectedPersonalRecord({
    required this.exerciseId,
    required this.exerciseName,
    required this.type,
    required this.value,
    required this.previousBest,
  });

  final String exerciseId;
  final String exerciseName;
  final PersonalRecordType type;
  final double value;
  final double? previousBest;
}

class ActiveWorkoutState {
  const ActiveWorkoutState({
    this.session,
    this.exercises = const <WorkoutExerciseWithSets>[],
    this.previousPerformanceByWorkoutExerciseId =
        const <String, ({double weight, int reps})>{},
    this.hasPendingSetWrites = false,
    this.lastError,
  });

  final WorkoutSessionEntity? session;
  final List<WorkoutExerciseWithSets> exercises;
  final Map<String, ({double weight, int reps})>
  previousPerformanceByWorkoutExerciseId;
  final bool hasPendingSetWrites;
  final String? lastError;

  bool get hasActiveSession => session?.status == WorkoutStatus.active;

  ActiveWorkoutState copyWith({
    WorkoutSessionEntity? session,
    List<WorkoutExerciseWithSets>? exercises,
    Map<String, ({double weight, int reps})>?
    previousPerformanceByWorkoutExerciseId,
    bool? hasPendingSetWrites,
    String? lastError,
    bool clearSession = false,
    bool clearError = false,
  }) {
    return ActiveWorkoutState(
      session: clearSession ? null : session ?? this.session,
      exercises: exercises ?? this.exercises,
      previousPerformanceByWorkoutExerciseId:
          previousPerformanceByWorkoutExerciseId ??
          this.previousPerformanceByWorkoutExerciseId,
      hasPendingSetWrites: hasPendingSetWrites ?? this.hasPendingSetWrites,
      lastError: clearError ? null : lastError ?? this.lastError,
    );
  }

  static const empty = ActiveWorkoutState();
}

abstract interface class ActiveWorkoutSessionStore {
  Future<String?> readActiveSessionId();
  Future<void> saveActiveSessionId(String id);
  Future<void> clearActiveSessionId();
}

class PendingCompletedSetWrite {
  const PendingCompletedSetWrite({
    required this.setId,
    required this.workoutExerciseId,
    required this.weight,
    required this.reps,
    required this.setType,
    required this.isCompleted,
    required this.completedAt,
  });

  final String setId;
  final String workoutExerciseId;
  final double weight;
  final int reps;
  final SetType setType;
  final bool isCompleted;
  final DateTime completedAt;
}

abstract interface class ActiveWorkoutPendingSetWriteStore {
  Future<List<PendingCompletedSetWrite>> readPendingCompletedSetWrites();
  Future<void> savePendingCompletedSetWrite(PendingCompletedSetWrite write);
  Future<void> removePendingCompletedSetWrite(String setId);
}

class ActiveWorkoutException implements Exception {
  const ActiveWorkoutException(this.message, [this.cause]);

  final String message;
  final Object? cause;

  @override
  String toString() => 'ActiveWorkoutException: $message';
}

class ActiveWorkoutController {
  ActiveWorkoutController({
    required WorkoutRepository repository,
    required ActiveWorkoutSessionStore sessionStore,
    ActiveWorkoutPendingSetWriteStore? pendingSetWriteStore,
    ZenliftNow? now,
  }) : this._(
         repository,
         sessionStore,
         pendingSetWriteStore,
         now ?? DateTime.now,
       );

  ActiveWorkoutController._(
    this._repository,
    this._sessionStore,
    this._pendingSetWriteStore,
    this._now,
  );

  final WorkoutRepository _repository;
  final ActiveWorkoutSessionStore _sessionStore;
  final ActiveWorkoutPendingSetWriteStore? _pendingSetWriteStore;
  final ZenliftNow _now;

  ActiveWorkoutState _state = ActiveWorkoutState.empty;

  ActiveWorkoutState get state => _state;

  Future<bool> recoverSession() async {
    await retryPendingCompletedSetWrites();
    final persistedId = await _sessionStore.readActiveSessionId();
    FullWorkoutSession? fullSession;

    if (persistedId != null) {
      fullSession = await _repository.getFullSession(persistedId);
    }

    if (fullSession?.session.status != WorkoutStatus.active) {
      final activeSession = await _repository.getActiveSession();
      if (activeSession != null) {
        fullSession = await _repository.getFullSession(activeSession.id);
      }
    }

    if (fullSession?.session.status != WorkoutStatus.active) {
      await _sessionStore.clearActiveSessionId();
      _state = ActiveWorkoutState.empty;
      return false;
    }

    await _sessionStore.saveActiveSessionId(fullSession!.session.id);
    await _hydrate(fullSession);
    return true;
  }

  Future<WorkoutSessionEntity> quickStart(
    StartWorkoutParams params, {
    ActiveWorkoutStartMode mode = ActiveWorkoutStartMode.continueExisting,
  }) async {
    final existing = await _repository.getActiveSession();
    if (existing != null && mode == ActiveWorkoutStartMode.continueExisting) {
      final fullSession = await _repository.getFullSession(existing.id);
      if (fullSession != null &&
          fullSession.session.status == WorkoutStatus.active) {
        await _sessionStore.saveActiveSessionId(fullSession.session.id);
        await _hydrate(fullSession);
        if (params.exerciseId != null) {
          await addExercise(params.exerciseId!);
        }
        return fullSession.session;
      }
    }

    if (existing != null && mode == ActiveWorkoutStartMode.startNew) {
      await _repository.cancelSession(existing.id);
      await _sessionStore.clearActiveSessionId();
    }

    final created = await _repository.createSession(
      CreateWorkoutSessionData(
        name: params.name,
        routineId: params.routineId,
        routineDayId: params.routineDayId,
      ),
    );

    if (params.routineDayId != null) {
      await _repository.addRoutineDayExercisesToSession(
        created.id,
        params.routineDayId!,
      );
    }

    if (params.exerciseId != null) {
      await _repository.addExercise(created.id, params.exerciseId!);
    }

    final fullSession = await _repository.getFullSession(created.id);
    if (fullSession == null ||
        fullSession.session.status != WorkoutStatus.active) {
      throw const ActiveWorkoutException(
        'Workout session was created but could not be hydrated.',
      );
    }

    await _sessionStore.saveActiveSessionId(fullSession.session.id);
    await _hydrate(fullSession);
    return fullSession.session;
  }

  Future<WorkoutExerciseWithSets> addExercise(String exerciseId) async {
    final session = _requireSession('addExercise');
    final workoutExercise = await _repository.addExercise(
      session.id,
      exerciseId,
    );
    await _refreshCurrentSession();

    return _state.exercises.firstWhere(
      (exercise) => exercise.workoutExercise.id == workoutExercise.id,
    );
  }

  Future<SetLogEntity> addSet(String workoutExerciseId) async {
    final defaults = await _defaultSetValues(workoutExerciseId);
    final set = await _repository.addSet(
      workoutExerciseId,
      AddSetData(weight: defaults.weight, reps: defaults.reps),
    );
    await _refreshCurrentSession();
    return set;
  }

  Future<void> updateSet(
    String setId, {
    double? weight,
    int? reps,
    SetType? setType,
    OptionalField<String?>? notes,
  }) async {
    await _repository.updateSet(
      setId,
      UpdateSetData(weight: weight, reps: reps, setType: setType, notes: notes),
    );
    await _refreshCurrentSession();
  }

  Future<void> toggleSetCompletion(String setId) async {
    final set = _findSet(setId);
    if (set == null) {
      throw ActiveWorkoutException('Set $setId was not found.');
    }

    if (set.isCompleted) {
      await _repository.uncompleteSet(setId);
      await _pendingSetWriteStore?.removePendingCompletedSetWrite(setId);
      await _refreshCurrentSession();
      return;
    }

    final pendingWrite = PendingCompletedSetWrite(
      setId: set.id,
      workoutExerciseId: set.workoutExerciseId,
      weight: set.weight,
      reps: set.reps,
      setType: set.setType,
      isCompleted: true,
      completedAt: _now(),
    );
    try {
      await _retryCompletedSetWrite(pendingWrite);
      await _pendingSetWriteStore?.removePendingCompletedSetWrite(setId);
      await _refreshCurrentSession();
    } on Object catch (error) {
      await _pendingSetWriteStore?.savePendingCompletedSetWrite(pendingWrite);
      _state = _state.copyWith(
        hasPendingSetWrites: true,
        lastError:
            'Set save is pending. Zenlift will retry when the workout recovers.',
      );
      throw ActiveWorkoutException(
        'Set save is pending and will retry.',
        error,
      );
    }
  }

  Future<void> retryPendingCompletedSetWrites() async {
    final pendingWrites =
        await _pendingSetWriteStore?.readPendingCompletedSetWrites() ??
        const <PendingCompletedSetWrite>[];
    for (final write in pendingWrites) {
      try {
        await _retryCompletedSetWrite(write);
        await _pendingSetWriteStore?.removePendingCompletedSetWrite(
          write.setId,
        );
      } on Object {
        _state = _state.copyWith(
          hasPendingSetWrites: true,
          lastError:
              'Some completed sets are still pending save. Zenlift will retry.',
        );
        return;
      }
    }
    if (pendingWrites.isNotEmpty) {
      _state = _state.copyWith(hasPendingSetWrites: false, clearError: true);
    }
  }

  Future<void> deleteSet(String setId) async {
    await _repository.deleteSet(setId);
    await _refreshCurrentSession();
  }

  Future<WorkoutSummary> finishWorkout() async {
    final session = _requireSession('finishWorkout');
    final fullSession = await _repository.getFullSession(session.id);
    if (fullSession == null) {
      throw const ActiveWorkoutException(
        'Active workout session was not found.',
      );
    }

    final completedWorkSets = _countCompletedWorkSets(fullSession.exercises);
    if (completedWorkSets == 0) {
      throw const ActiveWorkoutException(
        'At least one completed work set is required.',
      );
    }

    final detectedRecords = await _detectPersonalRecords(fullSession);
    for (final record in detectedRecords) {
      if (record.type == PersonalRecordType.maxSessionVolume) {
        continue;
      }
      await _repository.addPR(
        AddPersonalRecordData(
          exerciseId: record.exerciseId,
          workoutSessionId: session.id,
          type: record.type,
          value: record.value,
          weight: _recordWeight(record),
          reps: record.type == PersonalRecordType.maxReps
              ? record.value.round()
              : null,
        ),
      );
    }

    await _repository.completeSession(session.id);
    await _sessionStore.clearActiveSessionId();

    final endedAt = _now();
    final summary = WorkoutSummary(
      sessionId: session.id,
      routineId: session.routineId,
      routineDayId: session.routineDayId,
      name: session.name,
      startedAt: session.startedAt,
      endedAt: endedAt,
      durationSeconds: endedAt.difference(session.startedAt).inSeconds,
      exerciseCount: fullSession.exercises.length,
      completedSetCount: completedWorkSets,
      totalVolume: _calculateTotalVolume(fullSession.exercises),
      personalRecordCount: detectedRecords.length,
      personalRecords: detectedRecords,
    );

    _state = ActiveWorkoutState.empty;
    return summary;
  }

  Future<void> cancelWorkout() async {
    final session = _state.session;
    if (session == null) {
      return;
    }
    await _repository.cancelSession(session.id);
    await _sessionStore.clearActiveSessionId();
    _state = ActiveWorkoutState.empty;
  }

  Future<void> _refreshCurrentSession() async {
    final session = _requireSession('refreshCurrentSession');
    final fullSession = await _repository.getFullSession(session.id);
    if (fullSession == null ||
        fullSession.session.status != WorkoutStatus.active) {
      await _sessionStore.clearActiveSessionId();
      _state = ActiveWorkoutState.empty;
      throw const ActiveWorkoutException('Active workout session was lost.');
    }
    await _hydrate(fullSession);
  }

  Future<void> _hydrate(FullWorkoutSession fullSession) async {
    final previousPerformance = <String, ({double weight, int reps})>{};
    for (final exercise in fullSession.exercises) {
      final previous = await _repository.getLastWorkoutExerciseData(
        exercise.exercise.id,
      );
      if (previous != null) {
        previousPerformance[exercise.workoutExercise.id] = previous;
      }
    }
    _state = ActiveWorkoutState(
      session: fullSession.session,
      exercises: fullSession.exercises,
      previousPerformanceByWorkoutExerciseId: previousPerformance,
      hasPendingSetWrites: _state.hasPendingSetWrites,
      lastError: _state.lastError,
    );
  }

  Future<void> _retryCompletedSetWrite(PendingCompletedSetWrite write) async {
    Object? lastError;
    for (
      var attempt = 0;
      attempt < activeWorkoutCompletedSetRetryLimit;
      attempt += 1
    ) {
      try {
        await _repository.updateSet(
          write.setId,
          UpdateSetData(
            weight: write.weight,
            reps: write.reps,
            setType: write.setType,
          ),
        );
        if (write.isCompleted) {
          await _repository.completeSet(write.setId);
        } else {
          await _repository.uncompleteSet(write.setId);
        }
        return;
      } on Object catch (error) {
        lastError = error;
      }
    }
    Error.throwWithStackTrace(
      lastError ?? StateError('Completed set write failed.'),
      StackTrace.current,
    );
  }

  WorkoutSessionEntity _requireSession(String action) {
    final session = _state.session;
    if (session == null || session.status != WorkoutStatus.active) {
      throw ActiveWorkoutException('Cannot $action without an active session.');
    }
    return session;
  }

  SetLogEntity? _findSet(String setId) {
    for (final exercise in _state.exercises) {
      for (final set in exercise.sets) {
        if (set.id == setId) {
          return set;
        }
      }
    }
    return null;
  }

  Future<({double weight, int reps})> _defaultSetValues(
    String workoutExerciseId,
  ) async {
    WorkoutExerciseWithSets? exercise;
    for (final item in _state.exercises) {
      if (item.workoutExercise.id == workoutExerciseId) {
        exercise = item;
        break;
      }
    }

    if (exercise == null) {
      throw ActiveWorkoutException(
        'Workout exercise $workoutExerciseId was not found.',
      );
    }

    final completedSets = exercise.sets
        .where((set) => set.isCompleted)
        .toList();
    if (completedSets.isNotEmpty) {
      final lastCompleted = completedSets.last;
      return (weight: lastCompleted.weight, reps: lastCompleted.reps);
    }

    final previous =
        _state.previousPerformanceByWorkoutExerciseId[workoutExerciseId] ??
        await _repository.getLastWorkoutExerciseData(exercise.exercise.id);
    if (previous != null) {
      return previous;
    }

    return (weight: 0.0, reps: 0);
  }

  Future<List<DetectedPersonalRecord>> _detectPersonalRecords(
    FullWorkoutSession session,
  ) async {
    final previousRecords = await _repository.getLatestPRs(limit: 1000);
    final previousBest = <String, Map<PersonalRecordType, double>>{};
    for (final record in previousRecords) {
      final byType = previousBest.putIfAbsent(record.exerciseId, () => {});
      final current = byType[record.type];
      if (current == null || record.value > current) {
        byType[record.type] = record.value;
      }
    }

    final records = <DetectedPersonalRecord>[];
    var hasQualifyingSets = false;

    for (final exercise in session.exercises) {
      final qualifyingSets = exercise.sets
          .where((set) => set.isCompleted && set.setType != SetType.warmup)
          .toList();
      if (qualifyingSets.isEmpty) {
        continue;
      }
      hasQualifyingSets = true;

      final exerciseBest = previousBest[exercise.exercise.id] ?? const {};
      final maxWeight = qualifyingSets
          .map((set) => set.weight)
          .reduce((value, element) => value > element ? value : element);
      _addRecordIfImproved(
        records,
        exercise: exercise,
        type: PersonalRecordType.maxWeight,
        value: maxWeight,
        previousBest: exerciseBest[PersonalRecordType.maxWeight],
      );

      _addRecordIfImproved(
        records,
        exercise: exercise,
        type: PersonalRecordType.maxVolume,
        value: _calculateTotalVolume([exercise]),
        previousBest: exerciseBest[PersonalRecordType.maxVolume],
      );

      final maxReps = qualifyingSets
          .map((set) => set.reps)
          .reduce((value, element) => value > element ? value : element)
          .toDouble();
      _addRecordIfImproved(
        records,
        exercise: exercise,
        type: PersonalRecordType.maxReps,
        value: maxReps,
        previousBest: exerciseBest[PersonalRecordType.maxReps],
      );

      final estimatedOneRepMax = estimateOneRepMaxFromSets(
        _toCalculationExercise(exercise).sets,
      );
      if (estimatedOneRepMax != null) {
        _addRecordIfImproved(
          records,
          exercise: exercise,
          type: PersonalRecordType.estimatedOneRepMax,
          value: estimatedOneRepMax,
          previousBest: exerciseBest[PersonalRecordType.estimatedOneRepMax],
        );
      }
    }

    final sessionVolume = _calculateTotalVolume(session.exercises);
    double? previousSessionVolume;
    for (final historySession in await _repository.getHistory(limit: 1000)) {
      final fullHistory = await _repository.getFullSession(historySession.id);
      if (fullHistory == null) {
        continue;
      }
      final volume = _calculateTotalVolume(fullHistory.exercises);
      if (previousSessionVolume == null || volume > previousSessionVolume) {
        previousSessionVolume = volume;
      }
    }
    if (hasQualifyingSets &&
        (previousSessionVolume == null ||
            sessionVolume > previousSessionVolume)) {
      records.add(
        DetectedPersonalRecord(
          exerciseId: '',
          exerciseName: '',
          type: PersonalRecordType.maxSessionVolume,
          value: sessionVolume,
          previousBest: previousSessionVolume,
        ),
      );
    }

    return records;
  }
}

void _addRecordIfImproved(
  List<DetectedPersonalRecord> records, {
  required WorkoutExerciseWithSets exercise,
  required PersonalRecordType type,
  required double value,
  required double? previousBest,
}) {
  if (previousBest != null && value <= previousBest) {
    return;
  }
  records.add(
    DetectedPersonalRecord(
      exerciseId: exercise.exercise.id,
      exerciseName: exercise.exercise.name,
      type: type,
      value: value,
      previousBest: previousBest,
    ),
  );
}

double? _recordWeight(DetectedPersonalRecord record) {
  return switch (record.type) {
    PersonalRecordType.maxWeight ||
    PersonalRecordType.estimatedOneRepMax => record.value,
    PersonalRecordType.maxVolume ||
    PersonalRecordType.maxReps ||
    PersonalRecordType.maxSessionVolume => null,
  };
}

int _countCompletedWorkSets(Iterable<WorkoutExerciseWithSets> exercises) {
  var count = 0;
  for (final exercise in exercises) {
    for (final set in exercise.sets) {
      if (set.isCompleted && set.setType != SetType.warmup) {
        count += 1;
      }
    }
  }
  return count;
}

double _calculateTotalVolume(Iterable<WorkoutExerciseWithSets> exercises) {
  return calculateSessionVolume(exercises.map(_toCalculationExercise));
}

calculations.WorkoutExercise _toCalculationExercise(
  WorkoutExerciseWithSets exercise,
) {
  return calculations.WorkoutExercise(
    id: exercise.workoutExercise.id,
    exerciseId: exercise.exercise.id,
    sets: exercise.sets
        .map(
          (set) => calculations.WorkoutSet(
            id: set.id,
            weight: set.weight,
            reps: set.reps,
            isCompleted: set.isCompleted,
            setType: _toCalculationSetType(set.setType),
            completedAt: set.completedAt,
          ),
        )
        .toList(),
  );
}

calculations.WorkoutSetType _toCalculationSetType(SetType setType) {
  return switch (setType) {
    SetType.normal => calculations.WorkoutSetType.normal,
    SetType.warmup => calculations.WorkoutSetType.warmup,
    SetType.drop => calculations.WorkoutSetType.drop,
    SetType.failure => calculations.WorkoutSetType.failure,
    SetType.amrap => calculations.WorkoutSetType.amrap,
  };
}
