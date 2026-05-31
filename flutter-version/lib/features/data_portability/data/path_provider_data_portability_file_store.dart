import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

import '../domain/data_portability_repository.dart';
import '../domain/zenlift_export.dart';

typedef ZenliftDirectoryProvider = Future<Directory> Function();

class PathProviderDataPortabilityFileStore implements DataPortabilityFileStore {
  PathProviderDataPortabilityFileStore({
    ZenliftDirectoryProvider? temporaryDirectoryProvider,
  }) : _temporaryDirectoryProvider =
           temporaryDirectoryProvider ?? getTemporaryDirectory;

  final ZenliftDirectoryProvider _temporaryDirectoryProvider;

  @override
  Future<String> writeExportFile(ZenliftExportData export) async {
    final directory = await _temporaryDirectoryProvider();
    if (!await directory.exists()) {
      await directory.create(recursive: true);
    }
    final timestamp = export.metadata.exportedAt.replaceAll(
      RegExp(r'[^0-9A-Za-z]+'),
      '-',
    );
    final file = File('${directory.path}/zenlift-$timestamp.zenlift');
    await file.writeAsString(jsonEncode(export.toJson()), flush: true);
    return file.path;
  }

  @override
  Future<ZenliftImportFile> readImportFile(String path) async {
    final file = File(path);
    final content = await file.readAsString();
    final decoded = jsonDecode(content);
    if (decoded is! Map) {
      throw const ZenliftImportException('Import file is not a JSON object.');
    }
    return ZenliftImportFile(
      decodedJson: <String, Object?>{
        for (final entry in decoded.entries)
          if (entry.key is String) entry.key as String: entry.value as Object?,
      },
      fileSizeBytes: await file.length(),
    );
  }
}

extension ZenliftExportJson on ZenliftExportData {
  Map<String, Object?> toJson() {
    return <String, Object?>{
      'version': metadata.version,
      'exportedAt': metadata.exportedAt,
      'appVersion': metadata.appVersion,
      'sourcePlatform': metadata.sourcePlatform,
      'schemaVersion': metadata.schemaVersion,
      for (final table in requiredZenliftExportTables)
        table.jsonKey: rowsFor(table),
    };
  }
}
