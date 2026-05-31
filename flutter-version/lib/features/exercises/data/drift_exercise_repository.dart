import 'package:drift/drift.dart';

import '../../../core/date/zenlift_clock.dart';
import '../../../core/uuid/id_generator.dart';
import '../../../storage/drift/app_database.dart' as drift_db;
import '../domain/exercise.dart';
import '../domain/exercise_repository.dart';
import 'exercise_mappers.dart';

class DriftExerciseRepository implements ExerciseRepository {
  DriftExerciseRepository(
    this._database,
    this._idGenerator, [
    this._clock = const SystemZenliftClock(),
  ]);

  final drift_db.AppDatabase _database;
  final IdGenerator _idGenerator;
  final ZenliftClock _clock;

  @override
  Future<List<ExerciseEntity>> getAll() async {
    final rows = await (_database.select(
      _database.exercises,
    )..orderBy([(row) => OrderingTerm.asc(row.name)])).get();
    return rows.map(exerciseFromRow).toList();
  }

  @override
  Future<ExerciseEntity?> getById(String id) async {
    final row = await (_database.select(
      _database.exercises,
    )..where((table) => table.id.equals(id))).getSingleOrNull();
    return row == null ? null : exerciseFromRow(row);
  }

  @override
  Future<List<ExerciseEntity>> getByMuscle(String muscleGroupId) async {
    final query =
        _database.select(_database.exercises).join([
            innerJoin(
              _database.exerciseMuscles,
              _database.exerciseMuscles.exerciseId.equalsExp(
                _database.exercises.id,
              ),
              useColumns: false,
            ),
          ])
          ..where(_database.exerciseMuscles.muscleGroupId.equals(muscleGroupId))
          ..orderBy([OrderingTerm.asc(_database.exercises.name)]);

    final rows = await query.get();
    final seenIds = <String>{};
    return [
      for (final row in rows)
        if (seenIds.add(row.readTable(_database.exercises).id))
          exerciseFromRow(row.readTable(_database.exercises)),
    ];
  }

  @override
  Future<List<ExerciseEntity>> getByCategory(String category) async {
    final rows =
        await (_database.select(_database.exercises)
              ..where((table) => table.category.equals(category))
              ..orderBy([(row) => OrderingTerm.asc(row.name)]))
            .get();
    return rows.map(exerciseFromRow).toList();
  }

  @override
  Future<List<ExerciseEntity>> getByEquipment(String equipment) async {
    final rows =
        await (_database.select(_database.exercises)
              ..where((table) => table.equipment.equals(equipment))
              ..orderBy([(row) => OrderingTerm.asc(row.name)]))
            .get();
    return rows.map(exerciseFromRow).toList();
  }

  @override
  Future<List<ExerciseEntity>> search(String query) async {
    final rows = await _database
        .customSelect(
          "SELECT * FROM exercises WHERE name LIKE '%' || ? || '%' COLLATE NOCASE ORDER BY name",
          variables: [Variable<String>(query)],
          readsFrom: {_database.exercises},
        )
        .get();
    return rows.map(_exerciseFromQueryRow).toList();
  }

  @override
  Future<List<ExerciseEntity>> getFavorites() async {
    final rows =
        await (_database.select(_database.exercises)
              ..where((table) => table.isFavorite.equals(true))
              ..orderBy([(row) => OrderingTerm.asc(row.name)]))
            .get();
    return rows.map(exerciseFromRow).toList();
  }

  @override
  Future<List<MuscleGroupEntity>> getMuscles(String exerciseId) async {
    final query =
        _database.select(_database.muscleGroups).join([
            innerJoin(
              _database.exerciseMuscles,
              _database.exerciseMuscles.muscleGroupId.equalsExp(
                _database.muscleGroups.id,
              ),
              useColumns: false,
            ),
          ])
          ..where(_database.exerciseMuscles.exerciseId.equals(exerciseId))
          ..orderBy([OrderingTerm.asc(_database.muscleGroups.name)]);

    final rows = await query.get();
    return rows
        .map((row) => muscleGroupFromRow(row.readTable(_database.muscleGroups)))
        .toList();
  }

  @override
  Future<ExerciseEntity> create(
    CreateExerciseData data,
    List<MuscleEntry> muscles,
  ) async {
    _validateExactlyOnePrimary(muscles);
    final id = data.id ?? _idGenerator.generate();
    final now = _clock.now();

    await _database.transaction(() async {
      await _database
          .into(_database.exercises)
          .insert(
            drift_db.ExercisesCompanion.insert(
              id: id,
              name: data.name,
              equipment: data.equipment,
              category: data.category,
              isCustom: Value(data.isCustom),
              isFavorite: Value(data.isFavorite),
              notes: Value(data.notes),
              createdAt: Value(dateToStorage(now)),
              updatedAt: Value(dateToStorage(now)),
            ),
          );

      for (final muscle in muscles) {
        await _database
            .into(_database.exerciseMuscles)
            .insert(
              drift_db.ExerciseMusclesCompanion.insert(
                id: _idGenerator.generate(),
                exerciseId: id,
                muscleGroupId: muscle.muscleGroupId,
                role: muscle.role.value,
              ),
            );
      }
    });

    final created = await getById(id);
    if (created == null) {
      throw StateError('Created exercise $id could not be read back.');
    }
    return created;
  }

  @override
  Future<ExerciseEntity?> update(String id, UpdateExerciseData updates) async {
    if (updates.isEmpty) {
      return getById(id);
    }

    final updatedRows =
        await (_database.update(
          _database.exercises,
        )..where((table) => table.id.equals(id))).write(
          drift_db.ExercisesCompanion(
            name: updates.name == null
                ? const Value.absent()
                : Value(updates.name!),
            equipment: updates.equipment == null
                ? const Value.absent()
                : Value(updates.equipment!),
            category: updates.category == null
                ? const Value.absent()
                : Value(updates.category!),
            isCustom: updates.isCustom == null
                ? const Value.absent()
                : Value(updates.isCustom!),
            isFavorite: updates.isFavorite == null
                ? const Value.absent()
                : Value(updates.isFavorite!),
            notes: updates.notes == null
                ? const Value.absent()
                : Value(updates.notes!.value),
            updatedAt: Value(dateToStorage(_clock.now())),
          ),
        );

    if (updatedRows == 0) {
      return null;
    }

    return getById(id);
  }

  @override
  Future<void> delete(String id) async {
    await (_database.delete(
      _database.exercises,
    )..where((table) => table.id.equals(id))).go();
  }

  @override
  Future<ExerciseEntity?> toggleFavorite(String id) async {
    final updatedRows = await _database.customUpdate(
      'UPDATE exercises SET is_favorite = NOT is_favorite, updated_at = ? WHERE id = ?',
      variables: [
        Variable<String>(dateToStorage(_clock.now())!),
        Variable<String>(id),
      ],
      updates: {_database.exercises},
    );

    if (updatedRows == 0) {
      return null;
    }

    return getById(id);
  }

  @override
  Future<void> addMuscle(
    String exerciseId,
    String muscleGroupId,
    MuscleRole role,
  ) async {
    if (role == MuscleRole.primary &&
        await _hasPrimaryMuscle(
          exerciseId,
          exceptMuscleGroupId: muscleGroupId,
        )) {
      throw StateError('An exercise must have exactly one primary muscle.');
    }

    await _database
        .into(_database.exerciseMuscles)
        .insert(
          drift_db.ExerciseMusclesCompanion.insert(
            id: _idGenerator.generate(),
            exerciseId: exerciseId,
            muscleGroupId: muscleGroupId,
            role: role.value,
          ),
        );
  }

  @override
  Future<void> removeMuscle(String exerciseId, String muscleGroupId) async {
    final target =
        await (_database.select(_database.exerciseMuscles)..where(
              (table) =>
                  table.exerciseId.equals(exerciseId) &
                  table.muscleGroupId.equals(muscleGroupId),
            ))
            .getSingleOrNull();

    if (target?.role == MuscleRole.primary.value) {
      throw StateError('An exercise must have exactly one primary muscle.');
    }

    await (_database.delete(_database.exerciseMuscles)..where(
          (table) =>
              table.exerciseId.equals(exerciseId) &
              table.muscleGroupId.equals(muscleGroupId),
        ))
        .go();
  }

  Future<bool> _hasPrimaryMuscle(
    String exerciseId, {
    String? exceptMuscleGroupId,
  }) async {
    final query = _database.select(_database.exerciseMuscles)
      ..where((table) {
        final predicate =
            table.exerciseId.equals(exerciseId) &
            table.role.equals(MuscleRole.primary.value);
        if (exceptMuscleGroupId == null) {
          return predicate;
        }
        return predicate & table.muscleGroupId.isNotValue(exceptMuscleGroupId);
      });

    return (await query.get()).isNotEmpty;
  }
}

class DriftMuscleGroupRepository implements MuscleGroupRepository {
  const DriftMuscleGroupRepository(this._database);

  final drift_db.AppDatabase _database;

  @override
  Future<List<MuscleGroupEntity>> getAll() async {
    final rows = await (_database.select(
      _database.muscleGroups,
    )..orderBy([(row) => OrderingTerm.asc(row.name)])).get();
    return rows.map(muscleGroupFromRow).toList();
  }

  @override
  Future<MuscleGroupEntity?> getById(String id) async {
    final row = await (_database.select(
      _database.muscleGroups,
    )..where((table) => table.id.equals(id))).getSingleOrNull();
    return row == null ? null : muscleGroupFromRow(row);
  }
}

ExerciseEntity _exerciseFromQueryRow(QueryRow row) {
  return ExerciseEntity(
    id: row.read<String>('id'),
    name: row.read<String>('name'),
    equipment: row.read<String>('equipment'),
    category: row.read<String>('category'),
    isCustom: row.read<bool>('is_custom'),
    isFavorite: row.read<bool>('is_favorite'),
    notes: row.readNullable<String>('notes'),
    createdAt: _readStorageDate(row, 'created_at'),
    updatedAt: _readStorageDate(row, 'updated_at'),
  );
}

DateTime? _readStorageDate(QueryRow row, String key) {
  final value = row.readNullable<String>(key);
  return value == null ? null : DateTime.parse(value).toUtc();
}

void _validateExactlyOnePrimary(List<MuscleEntry> muscles) {
  final primaryCount = muscles
      .where((muscle) => muscle.role == MuscleRole.primary)
      .length;
  if (primaryCount != 1) {
    throw StateError('An exercise must have exactly one primary muscle.');
  }
}
