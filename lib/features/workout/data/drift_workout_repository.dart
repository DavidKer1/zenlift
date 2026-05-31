import 'package:drift/drift.dart';

import '../../../core/date/zenlift_clock.dart';
import '../../../core/uuid/id_generator.dart';
import '../../../storage/drift/app_database.dart' as drift_db;
import '../../exercises/data/exercise_mappers.dart' hide dateToStorage;
import '../../routines/data/routine_mappers.dart' hide dateToStorage;
import '../domain/entities/workout_repository_entities.dart';
import '../domain/workout_repository.dart';
import 'workout_mappers.dart';

class DriftWorkoutRepository implements WorkoutRepository {
  DriftWorkoutRepository(
    this._database,
    this._idGenerator, [
    this._clock = const SystemZenliftClock(),
  ]);

  final drift_db.AppDatabase _database;
  final IdGenerator _idGenerator;
  final ZenliftClock _clock;

  @override
  Future<WorkoutSessionEntity> createSession(
    CreateWorkoutSessionData data,
  ) async {
    final id = data.id ?? _idGenerator.generate();
    final now = workoutDateToStorage(_clock.now());
    await _database
        .into(_database.workoutSessions)
        .insert(
          drift_db.WorkoutSessionsCompanion.insert(
            id: id,
            routineId: Value(data.routineId),
            routineDayId: Value(data.routineDayId),
            name: Value(data.name),
            startedAt: now,
            status: WorkoutStatus.active.value,
            createdAt: Value(now),
          ),
        );
    final created = await getSession(id);
    if (created == null) {
      throw StateError('Created workout session $id could not be read back.');
    }
    return created;
  }

  @override
  Future<WorkoutSessionEntity?> getSession(String id) async {
    final row = await (_database.select(
      _database.workoutSessions,
    )..where((table) => table.id.equals(id))).getSingleOrNull();
    return row == null ? null : workoutSessionFromRow(row);
  }

  @override
  Future<WorkoutSessionEntity?> getActiveSession() async {
    final row =
        await (_database.select(_database.workoutSessions)
              ..where(
                (table) => table.status.equals(WorkoutStatus.active.value),
              )
              ..limit(1))
            .getSingleOrNull();
    return row == null ? null : workoutSessionFromRow(row);
  }

  @override
  Future<List<WorkoutSessionEntity>> getHistory({
    int limit = 20,
    int offset = 0,
  }) async {
    final rows =
        await (_database.select(_database.workoutSessions)
              ..where(
                (table) => table.status.isIn([
                  WorkoutStatus.completed.value,
                  WorkoutStatus.cancelled.value,
                ]),
              )
              ..orderBy([(row) => OrderingTerm.desc(row.startedAt)])
              ..limit(limit, offset: offset))
            .get();
    return rows.map(workoutSessionFromRow).toList();
  }

  @override
  Future<List<WorkoutSessionEntity>> getHistoryByRoutine(
    String routineId,
  ) async {
    final rows =
        await (_database.select(_database.workoutSessions)
              ..where(
                (table) =>
                    table.routineId.equals(routineId) &
                    table.status.isIn([
                      WorkoutStatus.completed.value,
                      WorkoutStatus.cancelled.value,
                    ]),
              )
              ..orderBy([(row) => OrderingTerm.desc(row.startedAt)]))
            .get();
    return rows.map(workoutSessionFromRow).toList();
  }

  @override
  Future<FullWorkoutSession?> getFullSession(String id) async {
    final sessionRow = await (_database.select(
      _database.workoutSessions,
    )..where((table) => table.id.equals(id))).getSingleOrNull();
    if (sessionRow == null) {
      return null;
    }

    final workoutExerciseRows =
        await (_database.select(_database.workoutExercises)
              ..where((table) => table.workoutSessionId.equals(id))
              ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]))
            .get();

    final exercises = <WorkoutExerciseWithSets>[];
    for (final workoutExerciseRow in workoutExerciseRows) {
      final exerciseRow =
          await (_database.select(_database.exercises)..where(
                (table) => table.id.equals(workoutExerciseRow.exerciseId),
              ))
              .getSingle();
      final setRows =
          await (_database.select(_database.setLogs)
                ..where(
                  (table) =>
                      table.workoutExerciseId.equals(workoutExerciseRow.id),
                )
                ..orderBy([(row) => OrderingTerm.asc(row.setNumber)]))
              .get();
      exercises.add(
        WorkoutExerciseWithSets(
          workoutExercise: workoutExerciseFromRow(workoutExerciseRow),
          exercise: exerciseFromRow(exerciseRow),
          sets: setRows.map(setLogFromRow).toList(),
        ),
      );
    }

    final prRows = await (_database.select(
      _database.personalRecords,
    )..where((table) => table.workoutSessionId.equals(id))).get();

    final routineRow = sessionRow.routineId == null
        ? null
        : await (_database.select(_database.routines)
                ..where((table) => table.id.equals(sessionRow.routineId!)))
              .getSingleOrNull();
    final routineDayRow = sessionRow.routineDayId == null
        ? null
        : await (_database.select(_database.routineDays)
                ..where((table) => table.id.equals(sessionRow.routineDayId!)))
              .getSingleOrNull();

    return FullWorkoutSession(
      session: workoutSessionFromRow(sessionRow),
      routine: routineRow == null ? null : routineFromRow(routineRow),
      routineDay: routineDayRow == null
          ? null
          : routineDayFromRow(routineDayRow),
      exercises: exercises,
      personalRecords: prRows.map(personalRecordFromRow).toList(),
    );
  }

  @override
  Future<void> completeSession(String id) async {
    final session = await getSession(id);
    final now = _clock.now();
    final duration = session == null
        ? null
        : now.difference(session.startedAt).inSeconds;
    await (_database.update(
      _database.workoutSessions,
    )..where((table) => table.id.equals(id))).write(
      drift_db.WorkoutSessionsCompanion(
        status: Value(WorkoutStatus.completed.value),
        endedAt: Value(workoutDateToStorage(now)),
        durationSeconds: Value(duration),
        updatedAt: Value(workoutDateToStorage(now)),
      ),
    );
  }

  @override
  Future<void> cancelSession(String id) async {
    final now = workoutDateToStorage(_clock.now());
    await (_database.update(
      _database.workoutSessions,
    )..where((table) => table.id.equals(id))).write(
      drift_db.WorkoutSessionsCompanion(
        status: Value(WorkoutStatus.cancelled.value),
        endedAt: Value(now),
        updatedAt: Value(now),
      ),
    );
  }

  @override
  Future<void> updateSessionNotes(String sessionId, String notes) async {
    await (_database.update(
      _database.workoutSessions,
    )..where((table) => table.id.equals(sessionId))).write(
      drift_db.WorkoutSessionsCompanion(
        notes: Value(notes),
        updatedAt: Value(workoutDateToStorage(_clock.now())),
      ),
    );
  }

  @override
  Future<void> deleteSession(String id) async {
    await (_database.delete(
      _database.workoutSessions,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<WorkoutExerciseEntity> addExercise(
    String sessionId,
    String exerciseId,
  ) async {
    final id = _idGenerator.generate();
    final sortOrder = await _nextSortOrder(sessionId);
    await _database
        .into(_database.workoutExercises)
        .insert(
          drift_db.WorkoutExercisesCompanion.insert(
            id: id,
            workoutSessionId: sessionId,
            exerciseId: exerciseId,
            sortOrder: Value(sortOrder),
          ),
        );
    final row = await (_database.select(
      _database.workoutExercises,
    )..where((table) => table.id.equals(id))).getSingle();
    return workoutExerciseFromRow(row);
  }

  @override
  Future<List<WorkoutExerciseEntity>> addRoutineDayExercisesToSession(
    String sessionId,
    String routineDayId,
  ) async {
    final routineExercises =
        await (_database.select(_database.routineExercises)
              ..where((table) => table.routineDayId.equals(routineDayId))
              ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]))
            .get();
    final created = <WorkoutExerciseEntity>[];
    await _database.transaction(() async {
      for (final routineExercise in routineExercises) {
        final id = _idGenerator.generate();
        await _database
            .into(_database.workoutExercises)
            .insert(
              drift_db.WorkoutExercisesCompanion.insert(
                id: id,
                workoutSessionId: sessionId,
                exerciseId: routineExercise.exerciseId,
                sortOrder: Value(routineExercise.sortOrder),
              ),
            );
        created.add(
          WorkoutExerciseEntity(
            id: id,
            workoutSessionId: sessionId,
            exerciseId: routineExercise.exerciseId,
            sortOrder: routineExercise.sortOrder,
            notes: null,
          ),
        );
      }
    });
    return created;
  }

  @override
  Future<List<WorkoutExerciseEntity>> getExercises(String sessionId) async {
    final rows =
        await (_database.select(_database.workoutExercises)
              ..where((table) => table.workoutSessionId.equals(sessionId))
              ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]))
            .get();
    return rows.map(workoutExerciseFromRow).toList();
  }

  @override
  Future<void> removeExercise(String id) async {
    await (_database.delete(
      _database.workoutExercises,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<SetLogEntity> addSet(String workoutExerciseId, AddSetData data) async {
    final id = _idGenerator.generate();
    final setNumber = await _nextSetNumber(workoutExerciseId);
    await _database
        .into(_database.setLogs)
        .insert(
          drift_db.SetLogsCompanion.insert(
            id: id,
            workoutExerciseId: workoutExerciseId,
            setNumber: setNumber,
            weight: data.weight,
            reps: data.reps,
            setType: Value(data.setType.value),
            isCompleted: const Value(false),
            notes: Value(data.notes),
          ),
        );
    final row = await (_database.select(
      _database.setLogs,
    )..where((table) => table.id.equals(id))).getSingle();
    return setLogFromRow(row);
  }

  @override
  Future<void> completeSet(String id) async {
    await (_database.update(
      _database.setLogs,
    )..where((table) => table.id.equals(id))).write(
      drift_db.SetLogsCompanion(
        isCompleted: const Value(true),
        completedAt: Value(workoutDateToStorage(_clock.now())),
      ),
    );
  }

  @override
  Future<void> uncompleteSet(String id) async {
    await (_database.update(
      _database.setLogs,
    )..where((table) => table.id.equals(id))).write(
      const drift_db.SetLogsCompanion(
        isCompleted: Value(false),
        completedAt: Value(null),
      ),
    );
  }

  @override
  Future<void> updateSet(String id, UpdateSetData data) async {
    if (data.isEmpty) {
      return;
    }
    await (_database.update(
      _database.setLogs,
    )..where((table) => table.id.equals(id))).write(
      drift_db.SetLogsCompanion(
        weight: data.weight == null
            ? const Value.absent()
            : Value(data.weight!),
        reps: data.reps == null ? const Value.absent() : Value(data.reps!),
        setType: data.setType == null
            ? const Value.absent()
            : Value(data.setType!.value),
        notes: data.notes == null
            ? const Value.absent()
            : Value(data.notes!.value),
      ),
    );
  }

  @override
  Future<void> deleteSet(String id) async {
    await (_database.delete(
      _database.setLogs,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<List<SetLogEntity>> getSets(String workoutExerciseId) async {
    final rows =
        await (_database.select(_database.setLogs)
              ..where(
                (table) => table.workoutExerciseId.equals(workoutExerciseId),
              )
              ..orderBy([(row) => OrderingTerm.asc(row.setNumber)]))
            .get();
    return rows.map(setLogFromRow).toList();
  }

  @override
  Future<List<PreviousPerformance>> getPreviousPerformance(
    String exerciseId, {
    int limit = 5,
  }) async {
    final rows = await _database
        .customSelect(
          '''
SELECT ws.started_at, sl.weight, sl.reps, sl.set_type
FROM set_logs sl
JOIN workout_exercises we ON sl.workout_exercise_id = we.id
JOIN workout_sessions ws ON we.workout_session_id = ws.id
WHERE we.exercise_id = ? AND sl.is_completed = 1
ORDER BY ws.started_at DESC
LIMIT ?
''',
          variables: [Variable<String>(exerciseId), Variable<int>(limit)],
          readsFrom: {
            _database.setLogs,
            _database.workoutExercises,
            _database.workoutSessions,
          },
        )
        .get();
    return rows.map((row) {
      return PreviousPerformance(
        startedAt: DateTime.parse(row.read<String>('started_at')).toUtc(),
        weight: row.read<double>('weight'),
        reps: row.read<int>('reps'),
        setType: SetType.fromStorage(row.read<String>('set_type')),
      );
    }).toList();
  }

  @override
  Future<({double weight, int reps})?> getLastWorkoutExerciseData(
    String exerciseId,
  ) async {
    final row = await _database
        .customSelect(
          '''
SELECT sl.weight, sl.reps
FROM set_logs sl
JOIN workout_exercises we ON sl.workout_exercise_id = we.id
JOIN workout_sessions ws ON we.workout_session_id = ws.id
WHERE we.exercise_id = ? AND sl.is_completed = 1
ORDER BY ws.started_at DESC
LIMIT 1
''',
          variables: [Variable<String>(exerciseId)],
          readsFrom: {
            _database.setLogs,
            _database.workoutExercises,
            _database.workoutSessions,
          },
        )
        .getSingleOrNull();
    if (row == null) {
      return null;
    }
    return (weight: row.read<double>('weight'), reps: row.read<int>('reps'));
  }

  @override
  Future<PersonalRecordEntity> addPR(AddPersonalRecordData data) async {
    final id = _idGenerator.generate();
    final now = workoutDateToStorage(_clock.now());
    await _database
        .into(_database.personalRecords)
        .insert(
          drift_db.PersonalRecordsCompanion.insert(
            id: id,
            exerciseId: data.exerciseId,
            workoutSessionId: data.workoutSessionId,
            type: data.type.value,
            value: data.value,
            weight: Value(data.weight),
            reps: Value(data.reps),
            achievedAt: now,
          ),
        );
    final row = await (_database.select(
      _database.personalRecords,
    )..where((table) => table.id.equals(id))).getSingle();
    return personalRecordFromRow(row);
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsByExercise(String exerciseId) async {
    final rows =
        await (_database.select(_database.personalRecords)
              ..where((table) => table.exerciseId.equals(exerciseId))
              ..orderBy([(row) => OrderingTerm.desc(row.achievedAt)]))
            .get();
    return rows.map(personalRecordFromRow).toList();
  }

  @override
  Future<List<PersonalRecordEntity>> getPRsBySession(String sessionId) async {
    final rows = await (_database.select(
      _database.personalRecords,
    )..where((table) => table.workoutSessionId.equals(sessionId))).get();
    return rows.map(personalRecordFromRow).toList();
  }

  @override
  Future<List<PersonalRecordEntity>> getLatestPRs({int limit = 10}) async {
    final rows =
        await (_database.select(_database.personalRecords)
              ..orderBy([(row) => OrderingTerm.desc(row.achievedAt)])
              ..limit(limit))
            .get();
    return rows.map(personalRecordFromRow).toList();
  }

  Future<int> _nextSortOrder(String sessionId) async {
    final row = await _database
        .customSelect(
          'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM workout_exercises WHERE workout_session_id = ?',
          variables: [Variable<String>(sessionId)],
          readsFrom: {_database.workoutExercises},
        )
        .getSingle();
    return row.read<int>('max_order') + 1;
  }

  Future<int> _nextSetNumber(String workoutExerciseId) async {
    final row = await _database
        .customSelect(
          'SELECT COALESCE(MAX(set_number), 0) AS max_number FROM set_logs WHERE workout_exercise_id = ?',
          variables: [Variable<String>(workoutExerciseId)],
          readsFrom: {_database.setLogs},
        )
        .getSingle();
    return row.read<int>('max_number') + 1;
  }
}
