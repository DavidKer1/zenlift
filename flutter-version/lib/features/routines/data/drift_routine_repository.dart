import 'package:drift/drift.dart';

import '../../../core/date/zenlift_clock.dart';
import '../../../core/uuid/id_generator.dart';
import '../../../storage/drift/app_database.dart' as drift_db;
import '../../exercises/data/exercise_mappers.dart' hide dateToStorage;
import '../domain/routine.dart';
import '../domain/routine_repository.dart';
import 'routine_mappers.dart';

class DriftRoutineRepository implements RoutineRepository {
  DriftRoutineRepository(
    this._database,
    this._idGenerator, [
    this._clock = const SystemZenliftClock(),
  ]);

  final drift_db.AppDatabase _database;
  final IdGenerator _idGenerator;
  final ZenliftClock _clock;

  @override
  Future<List<RoutineEntity>> getAll({bool includeArchived = false}) async {
    final query = _database.select(_database.routines)
      ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]);
    if (!includeArchived) {
      query.where((row) => row.isArchived.equals(false));
    }
    final rows = await query.get();
    return rows.map(routineFromRow).toList();
  }

  @override
  Future<List<RoutineWithCounts>> getAllWithDayCount({
    bool includeArchived = false,
  }) async {
    final archiveFilter = includeArchived ? '' : 'WHERE r.is_archived = 0';
    final rows = await _database
        .customSelect(
          '''
SELECT
  r.*,
  COALESCE(day_counts.day_count, 0) AS day_count,
  COALESCE(exercise_counts.exercise_count, 0) AS exercise_count
FROM routines r
LEFT JOIN (
  SELECT routine_id, COUNT(*) AS day_count
  FROM routine_days
  GROUP BY routine_id
) day_counts ON day_counts.routine_id = r.id
LEFT JOIN (
  SELECT rd.routine_id, COUNT(re.id) AS exercise_count
  FROM routine_days rd
  LEFT JOIN routine_exercises re ON re.routine_day_id = rd.id
  GROUP BY rd.routine_id
) exercise_counts ON exercise_counts.routine_id = r.id
$archiveFilter
ORDER BY r.sort_order ASC
''',
          readsFrom: {
            _database.routines,
            _database.routineDays,
            _database.routineExercises,
          },
        )
        .get();

    return rows.map((row) {
      return RoutineWithCounts(
        routine: _routineFromQueryRow(row),
        dayCount: row.read<int>('day_count'),
        exerciseCount: row.read<int>('exercise_count'),
      );
    }).toList();
  }

  @override
  Future<RoutineEntity?> getById(String id) async {
    final row = await (_database.select(
      _database.routines,
    )..where((table) => table.id.equals(id))).getSingleOrNull();
    return row == null ? null : routineFromRow(row);
  }

  @override
  Future<FullRoutine?> getFullRoutine(String id) async {
    final routine = await getById(id);
    if (routine == null) {
      return null;
    }

    final days = await getDays(id);
    final fullDays = <FullRoutineDay>[];
    for (final day in days) {
      fullDays.add(
        FullRoutineDay(day: day, exercises: await getExercises(day.id)),
      );
    }

    return FullRoutine(routine: routine, days: fullDays);
  }

  @override
  Future<RoutineEntity> create(CreateRoutineData data) async {
    final id = data.id ?? _idGenerator.generate();
    final now = dateToStorage(_clock.now());

    await _database
        .into(_database.routines)
        .insert(
          drift_db.RoutinesCompanion.insert(
            id: id,
            name: data.name,
            description: Value(data.description),
            goal: Value(data.goal),
            isArchived: const Value(false),
            sortOrder: const Value(0),
            createdAt: Value(now),
            updatedAt: Value(now),
          ),
        );

    final created = await getById(id);
    if (created == null) {
      throw StateError('Created routine $id could not be read back.');
    }
    return created;
  }

  @override
  Future<void> update(String id, UpdateRoutineData updates) async {
    if (updates.isEmpty) {
      return;
    }
    await (_database.update(
      _database.routines,
    )..where((table) => table.id.equals(id))).write(
      drift_db.RoutinesCompanion(
        name: updates.name == null
            ? const Value.absent()
            : Value(updates.name!),
        description: updates.description == null
            ? const Value.absent()
            : Value(updates.description!.value),
        goal: updates.goal == null
            ? const Value.absent()
            : Value(updates.goal!.value),
        sortOrder: updates.sortOrder == null
            ? const Value.absent()
            : Value(updates.sortOrder!),
        updatedAt: Value(dateToStorage(_clock.now())),
      ),
    );
  }

  @override
  Future<void> archive(String id) => _setArchived(id, archived: true);

  @override
  Future<void> unarchive(String id) => _setArchived(id, archived: false);

  @override
  Future<void> delete(String id) async {
    await (_database.delete(
      _database.routines,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<FullRoutine> duplicate(String id, String newName) async {
    final newRoutineId = _idGenerator.generate();

    await _database.transaction(() async {
      final original = await (_database.select(
        _database.routines,
      )..where((table) => table.id.equals(id))).getSingleOrNull();
      if (original == null) {
        throw StateError('Routine $id not found');
      }

      final now = dateToStorage(_clock.now());
      await _database
          .into(_database.routines)
          .insert(
            drift_db.RoutinesCompanion.insert(
              id: newRoutineId,
              name: newName,
              description: Value(original.description),
              goal: Value(original.goal),
              isArchived: const Value(false),
              sortOrder: Value(original.sortOrder),
              createdAt: Value(now),
              updatedAt: Value(now),
            ),
          );

      final originalDays =
          await (_database.select(_database.routineDays)
                ..where((table) => table.routineId.equals(id))
                ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]))
              .get();
      final dayIdMap = <String, String>{};

      for (final day in originalDays) {
        final newDayId = _idGenerator.generate();
        dayIdMap[day.id] = newDayId;
        await _database
            .into(_database.routineDays)
            .insert(
              drift_db.RoutineDaysCompanion.insert(
                id: newDayId,
                routineId: newRoutineId,
                name: day.name,
                dayOfWeek: Value(day.dayOfWeek),
                sortOrder: Value(day.sortOrder),
              ),
            );
      }

      for (final day in originalDays) {
        final sourceExercises =
            await (_database.select(_database.routineExercises)
                  ..where((table) => table.routineDayId.equals(day.id))
                  ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]))
                .get();
        final newDayId = dayIdMap[day.id]!;
        for (final exercise in sourceExercises) {
          await _database
              .into(_database.routineExercises)
              .insert(
                drift_db.RoutineExercisesCompanion.insert(
                  id: _idGenerator.generate(),
                  routineDayId: newDayId,
                  exerciseId: exercise.exerciseId,
                  targetSets: Value(exercise.targetSets),
                  targetRepsMin: Value(exercise.targetRepsMin),
                  targetRepsMax: Value(exercise.targetRepsMax),
                  notes: Value(exercise.notes),
                  sortOrder: Value(exercise.sortOrder),
                ),
              );
        }
      }
    });

    final duplicated = await getFullRoutine(newRoutineId);
    if (duplicated == null) {
      throw StateError('Duplicated routine $newRoutineId could not be read.');
    }
    return duplicated;
  }

  @override
  Future<List<RoutineDayEntity>> getDays(String routineId) async {
    final rows =
        await (_database.select(_database.routineDays)
              ..where((table) => table.routineId.equals(routineId))
              ..orderBy([(row) => OrderingTerm.asc(row.sortOrder)]))
            .get();
    return rows.map(routineDayFromRow).toList();
  }

  @override
  Future<RoutineDayEntity> createDay(
    String routineId,
    CreateRoutineDayData data,
  ) async {
    final id = data.id ?? _idGenerator.generate();
    await _database
        .into(_database.routineDays)
        .insert(
          drift_db.RoutineDaysCompanion.insert(
            id: id,
            routineId: routineId,
            name: data.name,
            dayOfWeek: Value(data.dayOfWeek),
            sortOrder: const Value(0),
          ),
        );
    final created = await (_database.select(
      _database.routineDays,
    )..where((table) => table.id.equals(id))).getSingle();
    return routineDayFromRow(created);
  }

  @override
  Future<void> updateDay(String id, UpdateRoutineDayData updates) async {
    if (updates.isEmpty) {
      return;
    }
    await (_database.update(
      _database.routineDays,
    )..where((table) => table.id.equals(id))).write(
      drift_db.RoutineDaysCompanion(
        name: updates.name == null
            ? const Value.absent()
            : Value(updates.name!),
        dayOfWeek: updates.dayOfWeek == null
            ? const Value.absent()
            : Value(updates.dayOfWeek!.value),
        sortOrder: updates.sortOrder == null
            ? const Value.absent()
            : Value(updates.sortOrder!),
      ),
    );
  }

  @override
  Future<void> deleteDay(String id) async {
    await (_database.delete(
      _database.routineDays,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<void> reorderDays(String routineId, List<String> dayIds) async {
    await _database.transaction(() async {
      for (var index = 0; index < dayIds.length; index += 1) {
        await (_database.update(_database.routineDays)..where(
              (table) =>
                  table.id.equals(dayIds[index]) &
                  table.routineId.equals(routineId),
            ))
            .write(drift_db.RoutineDaysCompanion(sortOrder: Value(index)));
      }
    });
  }

  @override
  Future<List<RoutineExerciseWithExercise>> getExercises(String dayId) async {
    final query =
        _database.select(_database.routineExercises).join([
            innerJoin(
              _database.exercises,
              _database.exercises.id.equalsExp(
                _database.routineExercises.exerciseId,
              ),
            ),
          ])
          ..where(_database.routineExercises.routineDayId.equals(dayId))
          ..orderBy([OrderingTerm.asc(_database.routineExercises.sortOrder)]);

    final rows = await query.get();
    return rows.map((row) {
      return RoutineExerciseWithExercise(
        routineExercise: routineExerciseFromRow(
          row.readTable(_database.routineExercises),
        ),
        exercise: exerciseFromRow(row.readTable(_database.exercises)),
      );
    }).toList();
  }

  @override
  Future<RoutineExerciseEntity> createExercise(
    String dayId,
    CreateRoutineExerciseData data,
  ) async {
    final id = data.id ?? _idGenerator.generate();
    await _database
        .into(_database.routineExercises)
        .insert(
          drift_db.RoutineExercisesCompanion.insert(
            id: id,
            routineDayId: dayId,
            exerciseId: data.exerciseId,
            targetSets: Value(data.targetSets),
            targetRepsMin: Value(data.targetRepsMin),
            targetRepsMax: Value(data.targetRepsMax),
            notes: Value(data.notes),
            sortOrder: const Value(0),
          ),
        );
    final created = await (_database.select(
      _database.routineExercises,
    )..where((table) => table.id.equals(id))).getSingle();
    return routineExerciseFromRow(created);
  }

  @override
  Future<void> updateExercise(
    String id,
    UpdateRoutineExerciseData updates,
  ) async {
    if (updates.isEmpty) {
      return;
    }
    await (_database.update(
      _database.routineExercises,
    )..where((table) => table.id.equals(id))).write(
      drift_db.RoutineExercisesCompanion(
        exerciseId: updates.exerciseId == null
            ? const Value.absent()
            : Value(updates.exerciseId!),
        targetSets: updates.targetSets == null
            ? const Value.absent()
            : Value(updates.targetSets!.value),
        targetRepsMin: updates.targetRepsMin == null
            ? const Value.absent()
            : Value(updates.targetRepsMin!.value),
        targetRepsMax: updates.targetRepsMax == null
            ? const Value.absent()
            : Value(updates.targetRepsMax!.value),
        notes: updates.notes == null
            ? const Value.absent()
            : Value(updates.notes!.value),
        sortOrder: updates.sortOrder == null
            ? const Value.absent()
            : Value(updates.sortOrder!),
      ),
    );
  }

  @override
  Future<void> deleteExercise(String id) async {
    await (_database.delete(
      _database.routineExercises,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<void> reorderExercises(String dayId, List<String> exerciseIds) async {
    await _database.transaction(() async {
      for (var index = 0; index < exerciseIds.length; index += 1) {
        await (_database.update(_database.routineExercises)..where(
              (table) =>
                  table.id.equals(exerciseIds[index]) &
                  table.routineDayId.equals(dayId),
            ))
            .write(drift_db.RoutineExercisesCompanion(sortOrder: Value(index)));
      }
    });
  }

  @override
  Future<FullRoutine> saveDraft(RoutineDraft draft) async {
    final routineId = draft.id ?? _idGenerator.generate();
    final now = dateToStorage(_clock.now());

    await _database.transaction(() async {
      final existingRoutine = await (_database.select(
        _database.routines,
      )..where((table) => table.id.equals(routineId))).getSingleOrNull();

      if (existingRoutine == null) {
        await _database
            .into(_database.routines)
            .insert(
              drift_db.RoutinesCompanion.insert(
                id: routineId,
                name: draft.name,
                description: Value(draft.description),
                goal: Value(draft.goal),
                isArchived: const Value(false),
                sortOrder: const Value(0),
                createdAt: Value(now),
                updatedAt: Value(now),
              ),
            );
      } else {
        await (_database.update(
          _database.routines,
        )..where((table) => table.id.equals(routineId))).write(
          drift_db.RoutinesCompanion(
            name: Value(draft.name),
            description: Value(draft.description),
            goal: Value(draft.goal),
            updatedAt: Value(now),
          ),
        );
      }

      final existingDays = await (_database.select(
        _database.routineDays,
      )..where((table) => table.routineId.equals(routineId))).get();
      final draftDayIds = draft.days
          .map((day) => day.id)
          .whereType<String>()
          .toSet();
      for (final day in existingDays) {
        if (!draftDayIds.contains(day.id)) {
          await (_database.delete(
            _database.routineDays,
          )..where((table) => table.id.equals(day.id))).go();
        }
      }

      for (var dayIndex = 0; dayIndex < draft.days.length; dayIndex += 1) {
        final dayDraft = draft.days[dayIndex];
        final dayId = dayDraft.id ?? _idGenerator.generate();
        final existingDay = existingDays
            .where((day) => day.id == dayId)
            .firstOrNull;
        if (existingDay == null) {
          await _database
              .into(_database.routineDays)
              .insert(
                drift_db.RoutineDaysCompanion.insert(
                  id: dayId,
                  routineId: routineId,
                  name: dayDraft.name,
                  dayOfWeek: Value(dayDraft.dayOfWeek),
                  sortOrder: Value(dayIndex),
                ),
              );
        } else {
          await (_database.update(
            _database.routineDays,
          )..where((table) => table.id.equals(dayId))).write(
            drift_db.RoutineDaysCompanion(
              name: Value(dayDraft.name),
              dayOfWeek: Value(dayDraft.dayOfWeek),
              sortOrder: Value(dayIndex),
            ),
          );
        }

        final existingExercises = await (_database.select(
          _database.routineExercises,
        )..where((table) => table.routineDayId.equals(dayId))).get();
        final draftExerciseIds = dayDraft.exercises
            .map((exercise) => exercise.id)
            .whereType<String>()
            .toSet();
        for (final exercise in existingExercises) {
          if (!draftExerciseIds.contains(exercise.id)) {
            await (_database.delete(
              _database.routineExercises,
            )..where((table) => table.id.equals(exercise.id))).go();
          }
        }

        for (
          var exerciseIndex = 0;
          exerciseIndex < dayDraft.exercises.length;
          exerciseIndex += 1
        ) {
          final exerciseDraft = dayDraft.exercises[exerciseIndex];
          final routineExerciseId = exerciseDraft.id ?? _idGenerator.generate();
          final existingExercise = existingExercises
              .where((exercise) => exercise.id == routineExerciseId)
              .firstOrNull;
          final companion = drift_db.RoutineExercisesCompanion(
            exerciseId: Value(exerciseDraft.exerciseId),
            targetSets: Value(exerciseDraft.targetSets),
            targetRepsMin: Value(exerciseDraft.targetRepsMin),
            targetRepsMax: Value(exerciseDraft.targetRepsMax),
            notes: Value(exerciseDraft.notes),
            sortOrder: Value(exerciseIndex),
          );
          if (existingExercise == null) {
            await _database
                .into(_database.routineExercises)
                .insert(
                  drift_db.RoutineExercisesCompanion.insert(
                    id: routineExerciseId,
                    routineDayId: dayId,
                    exerciseId: exerciseDraft.exerciseId,
                    targetSets: Value(exerciseDraft.targetSets),
                    targetRepsMin: Value(exerciseDraft.targetRepsMin),
                    targetRepsMax: Value(exerciseDraft.targetRepsMax),
                    notes: Value(exerciseDraft.notes),
                    sortOrder: Value(exerciseIndex),
                  ),
                );
          } else {
            await (_database.update(_database.routineExercises)
                  ..where((table) => table.id.equals(routineExerciseId)))
                .write(companion);
          }
        }
      }
    });

    final saved = await getFullRoutine(routineId);
    if (saved == null) {
      throw StateError('Saved routine $routineId could not be read back.');
    }
    return saved;
  }

  Future<void> _setArchived(String id, {required bool archived}) async {
    await (_database.update(
      _database.routines,
    )..where((table) => table.id.equals(id))).write(
      drift_db.RoutinesCompanion(
        isArchived: Value(archived),
        updatedAt: Value(dateToStorage(_clock.now())),
      ),
    );
  }
}

RoutineEntity _routineFromQueryRow(QueryRow row) {
  return RoutineEntity(
    id: row.read<String>('id'),
    name: row.read<String>('name'),
    description: row.readNullable<String>('description'),
    goal: row.readNullable<String>('goal'),
    isArchived: row.read<bool>('is_archived'),
    sortOrder: row.read<int>('sort_order'),
    createdAt: _readStorageDate(row, 'created_at'),
    updatedAt: _readStorageDate(row, 'updated_at'),
  );
}

DateTime? _readStorageDate(QueryRow row, String key) {
  final value = row.readNullable<String>(key);
  return value == null ? null : DateTime.parse(value).toUtc();
}
