import '../domain/data_portability_repository.dart';

class DataPortabilityController {
  const DataPortabilityController({
    required this.repository,
    required this.fileStore,
    required this.appVersion,
    required this.sourcePlatform,
  });

  final DataPortabilityRepository repository;
  final DataPortabilityFileStore fileStore;
  final String appVersion;
  final String sourcePlatform;

  Future<String> exportToFile() async {
    final export = await repository.exportData(
      appVersion: appVersion,
      sourcePlatform: sourcePlatform,
    );
    return fileStore.writeExportFile(export);
  }

  Future<ZenliftImportSummary> importFromFile(String path) async {
    final file = await fileStore.readImportFile(path);
    return repository.importJson(
      decodedJson: file.decodedJson,
      fileSizeBytes: file.fileSizeBytes,
    );
  }

  Future<String> deleteAllDataAfterFreshBackup() async {
    final export = await repository.exportData(
      appVersion: appVersion,
      sourcePlatform: sourcePlatform,
    );
    final path = await fileStore.writeExportFile(export);
    await repository.deleteAllData(verifiedBackup: export);
    return path;
  }
}
