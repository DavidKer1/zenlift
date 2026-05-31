import 'first_launch_migrator.dart';

abstract interface class MigrationBridgeSnapshotReader {
  Future<MigrationBridgeSnapshot> readSnapshot();
}

final class DefaultMigrationBridgeVerifier implements MigrationBridgeVerifier {
  const DefaultMigrationBridgeVerifier(this._snapshotReader);

  final MigrationBridgeSnapshotReader _snapshotReader;

  @override
  Future<MigrationBridgeVerificationResult> verify(
    MigrationBridgeImportResult result,
  ) async {
    final snapshot = await _snapshotReader.readSnapshot();

    for (final entry in result.tableRowCounts.entries) {
      final actualCount = snapshot.tableRowCounts[entry.key] ?? 0;
      if (actualCount < entry.value) {
        return MigrationBridgeVerificationResult.failed(
          'Expected at least ${entry.value} rows in ${entry.key}, found $actualCount.',
        );
      }
    }

    final missingUuids = result.requiredUuids.difference(snapshot.uuids);
    if (missingUuids.isNotEmpty) {
      return MigrationBridgeVerificationResult.failed(
        'Missing required UUIDs: ${missingUuids.join(', ')}.',
      );
    }

    final missingSettings = result.settingsKeys.difference(
      snapshot.settingsKeys,
    );
    if (missingSettings.isNotEmpty) {
      return MigrationBridgeVerificationResult.failed(
        'Missing settings keys: ${missingSettings.join(', ')}.',
      );
    }

    return const MigrationBridgeVerificationResult.passed();
  }
}

final class MigrationBridgeSnapshot {
  const MigrationBridgeSnapshot({
    required this.tableRowCounts,
    required this.uuids,
    required this.settingsKeys,
  });

  final Map<String, int> tableRowCounts;
  final Set<String> uuids;
  final Set<String> settingsKeys;
}
