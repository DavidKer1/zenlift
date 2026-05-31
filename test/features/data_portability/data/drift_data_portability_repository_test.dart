import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/core/date/zenlift_clock.dart';
import 'package:zenlift/features/data_portability/data/drift_data_portability_repository.dart';
import 'package:zenlift/features/data_portability/domain/data_portability_repository.dart';
import 'package:zenlift/features/data_portability/domain/zenlift_export.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  late AppDatabase database;
  late DriftDataPortabilityRepository repository;

  setUp(() {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    repository = DriftDataPortabilityRepository(
      database,
      FixedZenliftClock(DateTime.utc(2026, 5, 30, 12)),
    );
  });

  tearDown(() async {
    await database.close();
  });

  test('exportData returns metadata and every required table', () async {
    await database
        .into(database.muscleGroups)
        .insert(
          MuscleGroupsCompanion.insert(
            id: 'mg-1',
            name: 'chest',
            displayNameEs: 'Pecho',
            color: '#EF4444',
          ),
        );
    await database
        .into(database.appSettings)
        .insert(AppSettingsCompanion.insert(key: 'weightUnit', value: 'kg'));

    final export = await repository.exportData(
      appVersion: '1.0.0',
      sourcePlatform: 'flutter',
    );

    expect(export.metadata.version, supportedZenliftExportVersion);
    expect(export.metadata.exportedAt, '2026-05-30T12:00:00.000Z');
    expect(export.metadata.appVersion, '1.0.0');
    expect(export.metadata.sourcePlatform, 'flutter');
    for (final table in requiredZenliftExportTables) {
      expect(export.rowsByTable, contains(table));
    }
    expect(
      export.rowsFor(ZenliftExportTable.muscleGroups).single['id'],
      'mg-1',
    );
    expect(
      export.rowsFor(ZenliftExportTable.appSettings).single['value'],
      'kg',
    );
  });

  test('importJson inserts new UUID rows and skips existing rows', () async {
    await database
        .into(database.muscleGroups)
        .insert(
          MuscleGroupsCompanion.insert(
            id: 'mg-existing',
            name: 'existing',
            displayNameEs: 'Existente',
            color: '#FFFFFF',
          ),
        );

    final summary = await repository.importJson(
      decodedJson: completeExport(),
      fileSizeBytes: 1024,
    );

    final muscleGroups = await database.select(database.muscleGroups).get();
    final exercises = await database.select(database.exercises).get();
    final exerciseMuscles = await database
        .select(database.exerciseMuscles)
        .get();

    expect(summary.skippedExistingRows, 1);
    expect(summary.insertedRows, greaterThan(1));
    expect(
      muscleGroups.map((row) => row.id),
      containsAll(['mg-existing', 'mg-1']),
    );
    expect(exercises.single.id, 'ex-1');
    expect(exerciseMuscles.single.exerciseId, 'ex-1');
  });

  test(
    'importJson rolls back inserted rows when a dependent row fails',
    () async {
      final json = completeExport()
        ..['exercise_muscles'] = [
          {
            'id': 'em-broken',
            'exercise_id': 'missing-exercise',
            'muscle_group_id': 'mg-1',
            'role': 'primary',
          },
        ];

      await expectLater(
        repository.importJson(decodedJson: json, fileSizeBytes: 1024),
        throwsA(isA<Exception>()),
      );

      expect(await database.select(database.muscleGroups).get(), isEmpty);
      expect(await database.select(database.exercises).get(), isEmpty);
    },
  );

  test(
    'deleteAllData requires a valid backup and clears data in order',
    () async {
      final imported = await repository.importJson(
        decodedJson: completeExport(),
        fileSizeBytes: 1024,
      );
      expect(imported.insertedRows, greaterThan(0));
      final backup = await repository.exportData(
        appVersion: '1.0.0',
        sourcePlatform: 'flutter',
      );

      await repository.deleteAllData(verifiedBackup: backup);

      expect(await database.select(database.exercises).get(), isEmpty);
      expect(await database.select(database.muscleGroups).get(), isEmpty);

      await expectLater(
        repository.deleteAllData(
          verifiedBackup: ZenliftExportData(
            metadata: backup.metadata,
            rowsByTable: const <ZenliftExportTable, List<ZenliftExportRow>>{},
          ),
        ),
        throwsA(isA<ZenliftDeleteBackupException>()),
      );
    },
  );
}

Map<String, Object?> completeExport() {
  return {
    'version': supportedZenliftExportVersion,
    'exportedAt': '2026-05-30T12:00:00.000Z',
    'appVersion': '1.0.0',
    'sourcePlatform': 'flutter',
    'schemaVersion': supportedZenliftSchemaVersion,
    'muscle_groups': [
      {
        'id': 'mg-existing',
        'name': 'existing',
        'display_name_es': 'Existente',
        'color': '#FFFFFF',
      },
      {
        'id': 'mg-1',
        'name': 'chest',
        'display_name_es': 'Pecho',
        'color': '#EF4444',
      },
    ],
    'exercises': [
      {
        'id': 'ex-1',
        'name': 'Bench Press',
        'equipment': 'barbell',
        'category': 'strength',
        'is_custom': 0,
        'is_favorite': 0,
        'notes': null,
        'created_at': null,
        'updated_at': null,
      },
    ],
    'exercise_muscles': [
      {
        'id': 'em-1',
        'exercise_id': 'ex-1',
        'muscle_group_id': 'mg-1',
        'role': 'primary',
      },
    ],
    'routines': <Map<String, Object?>>[],
    'routine_days': <Map<String, Object?>>[],
    'routine_exercises': <Map<String, Object?>>[],
    'workout_sessions': <Map<String, Object?>>[],
    'workout_exercises': <Map<String, Object?>>[],
    'set_logs': <Map<String, Object?>>[],
    'personal_records': <Map<String, Object?>>[],
    'app_settings': [
      {'key': 'weightUnit', 'value': 'kg'},
    ],
  };
}
