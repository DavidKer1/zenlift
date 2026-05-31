import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/data_portability/application/data_portability_controller.dart';
import 'package:zenlift/features/data_portability/domain/data_portability_repository.dart';
import 'package:zenlift/features/data_portability/domain/zenlift_export.dart';

void main() {
  test('exports to file through repository and file store', () async {
    final repository = _FakeDataPortabilityRepository();
    final fileStore = _FakeFileStore();
    final controller = DataPortabilityController(
      repository: repository,
      fileStore: fileStore,
      appVersion: '1.0.0',
      sourcePlatform: 'flutter',
    );

    final path = await controller.exportToFile();

    expect(path, '/tmp/export.zenlift');
    expect(repository.exportedAppVersion, '1.0.0');
    expect(fileStore.lastWritten?.metadata.sourcePlatform, 'flutter');
  });

  test('imports from file using parsed file payload', () async {
    final repository = _FakeDataPortabilityRepository();
    final controller = DataPortabilityController(
      repository: repository,
      fileStore: _FakeFileStore(),
      appVersion: '1.0.0',
      sourcePlatform: 'flutter',
    );

    final summary = await controller.importFromFile('/tmp/import.zenlift');

    expect(summary.insertedRows, 2);
    expect(repository.importedFileSize, 42);
  });

  test('deletes only after writing a fresh backup', () async {
    final repository = _FakeDataPortabilityRepository();
    final fileStore = _FakeFileStore();
    final controller = DataPortabilityController(
      repository: repository,
      fileStore: fileStore,
      appVersion: '1.0.0',
      sourcePlatform: 'flutter',
    );

    final backupPath = await controller.deleteAllDataAfterFreshBackup();

    expect(backupPath, '/tmp/export.zenlift');
    expect(fileStore.lastWritten, isNotNull);
    expect(repository.deletedBackup, same(fileStore.lastWritten));
  });
}

class _FakeDataPortabilityRepository implements DataPortabilityRepository {
  String? exportedAppVersion;
  int? importedFileSize;
  ZenliftExportData? deletedBackup;

  @override
  Future<ZenliftExportData> exportData({
    required String appVersion,
    required String sourcePlatform,
  }) async {
    exportedAppVersion = appVersion;
    return ZenliftExportData(
      metadata: ZenliftExportMetadata(
        version: supportedZenliftExportVersion,
        exportedAt: '2026-05-30T12:00:00.000Z',
        appVersion: appVersion,
        sourcePlatform: sourcePlatform,
        schemaVersion: supportedZenliftSchemaVersion,
      ),
      rowsByTable: const <ZenliftExportTable, List<ZenliftExportRow>>{},
    );
  }

  @override
  Future<ZenliftImportSummary> importJson({
    required Map<String, Object?> decodedJson,
    required int fileSizeBytes,
  }) async {
    importedFileSize = fileSizeBytes;
    return const ZenliftImportSummary(insertedRows: 2, skippedExistingRows: 1);
  }

  @override
  Future<void> deleteAllData({
    required ZenliftExportData verifiedBackup,
  }) async {
    deletedBackup = verifiedBackup;
  }
}

class _FakeFileStore implements DataPortabilityFileStore {
  ZenliftExportData? lastWritten;

  @override
  Future<ZenliftImportFile> readImportFile(String path) async {
    return const ZenliftImportFile(
      decodedJson: <String, Object?>{'version': supportedZenliftExportVersion},
      fileSizeBytes: 42,
    );
  }

  @override
  Future<String> writeExportFile(ZenliftExportData export) async {
    lastWritten = export;
    return '/tmp/export.zenlift';
  }
}
