abstract interface class MigrationBridgeSettings {
  Future<bool> readMigrationBridgeCompleted();

  Future<void> writeMigrationBridgeCompleted(bool isCompleted);

  Future<void> writeMigrationBridgeFailure(String failure);
}

abstract interface class MigrationBridgeImporter {
  Future<MigrationBridgeImportResult> importBridgeIfPresent();
}

abstract interface class MigrationBridgeVerifier {
  Future<MigrationBridgeVerificationResult> verify(
    MigrationBridgeImportResult result,
  );
}

final class FirstLaunchMigrator {
  const FirstLaunchMigrator({
    required this.settings,
    required this.importer,
    required this.verifier,
  });

  final MigrationBridgeSettings settings;
  final MigrationBridgeImporter importer;
  final MigrationBridgeVerifier verifier;

  Future<FirstLaunchMigrationResult> runOnce() async {
    if (await settings.readMigrationBridgeCompleted()) {
      return const FirstLaunchMigrationResult(
        status: FirstLaunchMigrationStatus.alreadyCompleted,
      );
    }

    try {
      final importResult = await importer.importBridgeIfPresent();
      if (!importResult.sourceDetected) {
        await settings.writeMigrationBridgeCompleted(true);
        return const FirstLaunchMigrationResult(
          status: FirstLaunchMigrationStatus.noSourceData,
        );
      }

      final verification = await verifier.verify(importResult);
      if (!verification.passed) {
        await settings.writeMigrationBridgeFailure(verification.message);
        return FirstLaunchMigrationResult(
          status: FirstLaunchMigrationStatus.verificationFailed,
          failure: verification.message,
        );
      }

      await settings.writeMigrationBridgeCompleted(true);
      return FirstLaunchMigrationResult(
        status: FirstLaunchMigrationStatus.imported,
        insertedRows: importResult.insertedRows,
        skippedRows: importResult.skippedRows,
      );
    } on Object catch (error) {
      final failure = error.toString();
      await settings.writeMigrationBridgeFailure(failure);
      return FirstLaunchMigrationResult(
        status: FirstLaunchMigrationStatus.failed,
        failure: failure,
      );
    }
  }
}

final class MigrationBridgeImportResult {
  const MigrationBridgeImportResult({
    required this.sourceDetected,
    this.insertedRows = 0,
    this.skippedRows = 0,
    this.tableRowCounts = const <String, int>{},
    this.requiredUuids = const <String>{},
    this.settingsKeys = const <String>{},
  });

  final bool sourceDetected;
  final int insertedRows;
  final int skippedRows;
  final Map<String, int> tableRowCounts;
  final Set<String> requiredUuids;
  final Set<String> settingsKeys;
}

final class MigrationBridgeVerificationResult {
  const MigrationBridgeVerificationResult._({
    required this.passed,
    required this.message,
  });

  const MigrationBridgeVerificationResult.passed()
    : this._(passed: true, message: '');

  const MigrationBridgeVerificationResult.failed(String message)
    : this._(passed: false, message: message);

  final bool passed;
  final String message;
}

final class FirstLaunchMigrationResult {
  const FirstLaunchMigrationResult({
    required this.status,
    this.insertedRows = 0,
    this.skippedRows = 0,
    this.failure,
  });

  final FirstLaunchMigrationStatus status;
  final int insertedRows;
  final int skippedRows;
  final String? failure;
}

enum FirstLaunchMigrationStatus {
  alreadyCompleted,
  noSourceData,
  imported,
  verificationFailed,
  failed,
}
