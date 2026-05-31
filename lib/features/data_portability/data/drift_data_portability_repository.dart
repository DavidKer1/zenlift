import 'package:drift/drift.dart';

import '../../../core/date/zenlift_clock.dart';
import '../../../storage/drift/app_database.dart' as drift_db;
import '../application/import_plan.dart';
import '../domain/data_portability_repository.dart';
import '../domain/zenlift_export.dart';

class DriftDataPortabilityRepository implements DataPortabilityRepository {
  DriftDataPortabilityRepository(
    this._database, [
    this._clock = const SystemZenliftClock(),
  ]);

  final drift_db.AppDatabase _database;
  final ZenliftClock _clock;

  @override
  Future<ZenliftExportData> exportData({
    required String appVersion,
    required String sourcePlatform,
  }) async {
    final rowsByTable = <ZenliftExportTable, List<ZenliftExportRow>>{};
    for (final table in requiredZenliftExportTables) {
      rowsByTable[table] = await _readTable(table);
    }

    return ZenliftExportData(
      metadata: ZenliftExportMetadata(
        version: supportedZenliftExportVersion,
        exportedAt: _clock.now().toUtc().toIso8601String(),
        appVersion: appVersion,
        sourcePlatform: sourcePlatform,
        schemaVersion: drift_db.appDatabaseSchemaVersion,
      ),
      rowsByTable: Map<ZenliftExportTable, List<ZenliftExportRow>>.unmodifiable(
        rowsByTable,
      ),
    );
  }

  @override
  Future<ZenliftImportSummary> importJson({
    required Map<String, Object?> decodedJson,
    required int fileSizeBytes,
  }) async {
    final existingIds = <ZenliftExportTable, Set<String>>{};
    for (final table in orderedZenliftImportTables) {
      existingIds[table] = await _readExistingIds(table);
    }

    final plan = planZenliftImport(
      decodedJson: decodedJson,
      fileSizeBytes: fileSizeBytes,
      existingIdsByTable: existingIds,
    );
    final success = switch (plan) {
      ImportPlanSuccess() => plan,
      ImportPlanFailure() => throw ZenliftImportException(
        'Invalid import: ${plan.reason.name}',
      ),
    };

    var insertedRows = 0;
    var skippedRows = 0;
    await _database.transaction(() async {
      for (final operation in success.operations) {
        skippedRows += operation.toSkipExisting.length;
        for (final row in operation.toInsert) {
          await _insertRow(operation.table, row);
          insertedRows += 1;
        }
      }
    });

    return ZenliftImportSummary(
      insertedRows: insertedRows,
      skippedExistingRows: skippedRows,
    );
  }

  @override
  Future<void> deleteAllData({
    required ZenliftExportData verifiedBackup,
  }) async {
    _verifyBackup(verifiedBackup);
    await _database.transaction(() async {
      for (final table in orderedZenliftDeleteTables) {
        await _database.customStatement('DELETE FROM ${table.jsonKey}');
      }
    });
  }

  Future<List<ZenliftExportRow>> _readTable(ZenliftExportTable table) async {
    final columns = zenliftTableColumns[table]!;
    final identityColumn = zenliftTableIdentityColumns[table]!;
    final rows = await _database
        .customSelect(
          'SELECT ${columns.join(', ')} FROM ${table.jsonKey} ORDER BY $identityColumn',
          readsFrom: _readSetFor(table),
        )
        .get();
    return rows
        .map(
          (row) => Map<String, Object?>.unmodifiable({
            for (final column in columns) column: row.data[column],
          }),
        )
        .toList();
  }

  Future<Set<String>> _readExistingIds(ZenliftExportTable table) async {
    final identityColumn = zenliftTableIdentityColumns[table]!;
    final rows = await _database
        .customSelect(
          'SELECT $identityColumn FROM ${table.jsonKey}',
          readsFrom: _readSetFor(table),
        )
        .get();
    return rows
        .map((row) => row.data[identityColumn])
        .whereType<String>()
        .toSet();
  }

  Future<void> _insertRow(
    ZenliftExportTable table,
    ZenliftExportRow row,
  ) async {
    final columns = zenliftTableColumns[table]!;
    final placeholders = List.filled(columns.length, '?').join(', ');
    final variables = [
      for (final column in columns) Variable<Object>(row[column]),
    ];
    await _database.customInsert(
      'INSERT INTO ${table.jsonKey} (${columns.join(', ')}) VALUES ($placeholders)',
      variables: variables,
      updates: _readSetFor(table),
    );
  }

  void _verifyBackup(ZenliftExportData backup) {
    if (backup.metadata.version != supportedZenliftExportVersion ||
        backup.metadata.schemaVersion != drift_db.appDatabaseSchemaVersion) {
      throw const ZenliftDeleteBackupException('Unsupported backup metadata.');
    }

    for (final table in requiredZenliftExportTables) {
      final rows = backup.rowsByTable[table];
      if (rows == null) {
        throw ZenliftDeleteBackupException('Backup missing ${table.jsonKey}.');
      }
      for (final row in rows) {
        for (final column in zenliftTableColumns[table]!) {
          if (!row.containsKey(column)) {
            throw ZenliftDeleteBackupException(
              'Backup ${table.jsonKey} missing $column.',
            );
          }
        }
      }
    }
  }

  Set<TableInfo<Table, Object?>> _readSetFor(ZenliftExportTable table) {
    return switch (table) {
      ZenliftExportTable.muscleGroups => {_database.muscleGroups},
      ZenliftExportTable.exercises => {_database.exercises},
      ZenliftExportTable.exerciseMuscles => {_database.exerciseMuscles},
      ZenliftExportTable.routines => {_database.routines},
      ZenliftExportTable.routineDays => {_database.routineDays},
      ZenliftExportTable.routineExercises => {_database.routineExercises},
      ZenliftExportTable.workoutSessions => {_database.workoutSessions},
      ZenliftExportTable.workoutExercises => {_database.workoutExercises},
      ZenliftExportTable.setLogs => {_database.setLogs},
      ZenliftExportTable.personalRecords => {_database.personalRecords},
      ZenliftExportTable.appSettings => {_database.appSettings},
    };
  }
}
