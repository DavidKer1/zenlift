import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/data_portability/data/path_provider_data_portability_file_store.dart';
import 'package:zenlift/features/data_portability/domain/zenlift_export.dart';

void main() {
  test('writes and reads .zenlift JSON files', () async {
    final directory = await Directory.systemTemp.createTemp('zenlift-export-');
    addTearDown(() async {
      if (await directory.exists()) {
        await directory.delete(recursive: true);
      }
    });
    final store = PathProviderDataPortabilityFileStore(
      temporaryDirectoryProvider: () async => directory,
    );
    final export = ZenliftExportData(
      metadata: const ZenliftExportMetadata(
        version: supportedZenliftExportVersion,
        exportedAt: '2026-05-30T12:00:00.000Z',
        appVersion: '1.0.0',
        sourcePlatform: 'flutter',
        schemaVersion: supportedZenliftSchemaVersion,
      ),
      rowsByTable: {
        for (final table in requiredZenliftExportTables)
          table: const <ZenliftExportRow>[],
      },
    );

    final path = await store.writeExportFile(export);
    final imported = await store.readImportFile(path);

    expect(path.endsWith('.zenlift'), isTrue);
    expect(imported.decodedJson['version'], supportedZenliftExportVersion);
    expect(imported.fileSizeBytes, greaterThan(0));
  });
}
