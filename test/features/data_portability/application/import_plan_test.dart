import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/data_portability/application/import_plan.dart';
import 'package:zenlift/features/data_portability/domain/zenlift_export.dart';

void main() {
  group('planZenliftImport', () {
    test('creates a valid import plan for a complete export', () {
      final result = planZenliftImport(
        decodedJson: completeExport(),
        fileSizeBytes: 1024,
      );

      final success = expectSuccess(result);
      expect(success.export.metadata.version, supportedZenliftExportVersion);
      expect(success.export.metadata.exportedAt, '2026-05-30T12:00:00.000Z');
      expect(success.export.metadata.appVersion, '1.0.0');
      expect(success.export.metadata.sourcePlatform, 'flutter');
      expect(success.export.metadata.schemaVersion, 1);
      expect(success.isLargeFile, isFalse);
      expect(success.warnings, isEmpty);
      expect(success.operations, hasLength(orderedZenliftImportTables.length));
      expect(success.operations.first.table, ZenliftExportTable.muscleGroups);
      expect(success.operations.first.rows, hasLength(1));
      expect(success.operations.last.table, ZenliftExportTable.appSettings);
      expect(success.operations.last.rows, hasLength(1));
    });

    test('aborts when a required table is missing', () {
      final json = completeExport()..remove('set_logs');

      final failure = expectFailure(
        planZenliftImport(decodedJson: json, fileSizeBytes: 1024),
      );

      expect(failure.reason, ImportPlanFailureReason.missingTable);
      expect(failure.table, ZenliftExportTable.setLogs);
    });

    test('aborts when export version is unsupported', () {
      final json = completeExport()..['version'] = 2;

      final failure = expectFailure(
        planZenliftImport(decodedJson: json, fileSizeBytes: 1024),
      );

      expect(failure.reason, ImportPlanFailureReason.unsupportedVersion);
      expect(failure.field, 'version');
    });

    test('aborts when schema version is unsupported', () {
      final json = completeExport()..['schemaVersion'] = 2;

      final failure = expectFailure(
        planZenliftImport(decodedJson: json, fileSizeBytes: 1024),
      );

      expect(failure.reason, ImportPlanFailureReason.unsupportedSchema);
      expect(failure.field, 'schemaVersion');
    });

    test('aborts when a row is not an object map', () {
      final json = completeExport()
        ..['routines'] = <Object?>[
          routineRow('routine-1'),
          'not-a-row',
        ];

      final failure = expectFailure(
        planZenliftImport(decodedJson: json, fileSizeBytes: 1024),
      );

      expect(failure.reason, ImportPlanFailureReason.invalidRowShape);
      expect(failure.table, ZenliftExportTable.routines);
      expect(failure.rowIndex, 1);
    });

    test('aborts when a row is missing a required column', () {
      final json = completeExport()
        ..['muscle_groups'] = <Object?>[
          {'id': 'mg-1', 'name': 'chest', 'display_name_es': 'Pecho'},
        ];

      final failure = expectFailure(
        planZenliftImport(decodedJson: json, fileSizeBytes: 1024),
      );

      expect(failure.reason, ImportPlanFailureReason.missingRequiredColumn);
      expect(failure.field, 'color');
      expect(failure.table, ZenliftExportTable.muscleGroups);
      expect(failure.rowIndex, 0);
    });

    test('marks large files without blocking validation', () {
      final result = planZenliftImport(
        decodedJson: completeExport(),
        fileSizeBytes: maxZenliftImportSizeBytes + 1,
      );

      final success = expectSuccess(result);
      expect(success.isLargeFile, isTrue);
      expect(success.warnings, [ImportPlanWarningReason.fileTooLarge]);
    });

    test('plans duplicate existing UUID rows as skips', () {
      final result = planZenliftImport(
        decodedJson: completeExport(),
        fileSizeBytes: 1024,
        existingIdsByTable: {
          ZenliftExportTable.muscleGroups: {'mg-1'},
        },
      );

      final success = expectSuccess(result);
      final muscleGroups = success.operations.first;
      expect(muscleGroups.toInsert, isEmpty);
      expect(muscleGroups.toSkipExisting, hasLength(1));
      expect(muscleGroups.toSkipExisting.single.id, 'mg-1');
    });

    test('plans duplicate existing settings keys as skips', () {
      final result = planZenliftImport(
        decodedJson: completeExport(),
        fileSizeBytes: 1024,
        existingIdsByTable: {
          ZenliftExportTable.appSettings: {'weightUnit'},
        },
      );

      final success = expectSuccess(result);
      final settings = success.operations.last;
      expect(settings.table, ZenliftExportTable.appSettings);
      expect(settings.toInsert, isEmpty);
      expect(settings.toSkipExisting, hasLength(1));
      expect(settings.toSkipExisting.single.id, 'weightUnit');
    });

    test('keeps parent tables before dependents and settings last', () {
      final result = planZenliftImport(
        decodedJson: completeExport(),
        fileSizeBytes: 1024,
      );

      final success = expectSuccess(result);

      expect(
        success.operations.map((operation) => operation.table).toList(),
        orderedZenliftImportTables,
      );
      expect(orderedZenliftImportTables.last, ZenliftExportTable.appSettings);
    });
  });
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
        'id': 'mg-1',
        'name': 'chest',
        'display_name_es': 'Pecho',
        'color': '#f43f5e',
      },
    ],
    'exercises': <Map<String, Object?>>[],
    'exercise_muscles': <Map<String, Object?>>[],
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

Map<String, Object?> routineRow(String id) {
  return {
    'id': id,
    'name': 'Push',
    'description': null,
    'goal': null,
    'is_archived': 0,
    'sort_order': 0,
    'created_at': null,
    'updated_at': null,
  };
}

ImportPlanSuccess expectSuccess(ImportPlanResult result) {
  final success = switch (result) {
    ImportPlanSuccess() => result,
    ImportPlanFailure() => fail('Expected success, got ${result.reason}'),
  };
  return success;
}

ImportPlanFailure expectFailure(ImportPlanResult result) {
  final failure = switch (result) {
    ImportPlanFailure() => result,
    ImportPlanSuccess() => fail('Expected failure, got success'),
  };
  return failure;
}
