import 'zenlift_export.dart';

class ZenliftImportException implements Exception {
  const ZenliftImportException(this.message);

  final String message;
}

class ZenliftDeleteBackupException implements Exception {
  const ZenliftDeleteBackupException(this.message);

  final String message;
}

class ZenliftImportSummary {
  const ZenliftImportSummary({
    required this.insertedRows,
    required this.skippedExistingRows,
  });

  final int insertedRows;
  final int skippedExistingRows;
}

abstract interface class DataPortabilityRepository {
  Future<ZenliftExportData> exportData({
    required String appVersion,
    required String sourcePlatform,
  });

  Future<ZenliftImportSummary> importJson({
    required Map<String, Object?> decodedJson,
    required int fileSizeBytes,
  });

  Future<void> deleteAllData({required ZenliftExportData verifiedBackup});
}

class ZenliftImportFile {
  const ZenliftImportFile({
    required this.decodedJson,
    required this.fileSizeBytes,
  });

  final Map<String, Object?> decodedJson;
  final int fileSizeBytes;
}

abstract interface class DataPortabilityFileStore {
  Future<String> writeExportFile(ZenliftExportData export);
  Future<ZenliftImportFile> readImportFile(String path);
}
