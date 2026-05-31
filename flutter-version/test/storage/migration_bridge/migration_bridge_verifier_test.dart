import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/storage/migration_bridge/first_launch_migrator.dart';
import 'package:zenlift/storage/migration_bridge/migration_bridge_verifier.dart';

void main() {
  late InMemoryMigrationBridgeSnapshotReader reader;
  late DefaultMigrationBridgeVerifier verifier;

  setUp(() {
    reader = InMemoryMigrationBridgeSnapshotReader(
      const MigrationBridgeSnapshot(
        tableRowCounts: {'workout_sessions': 2, 'set_logs': 6},
        uuids: {'session-1', 'set-1'},
        settingsKeys: {'zenlift.settings.weight_unit'},
      ),
    );
    verifier = DefaultMigrationBridgeVerifier(reader);
  });

  test('passes when counts UUIDs and settings keys are present', () async {
    final result = await verifier.verify(
      const MigrationBridgeImportResult(
        sourceDetected: true,
        tableRowCounts: {'workout_sessions': 1, 'set_logs': 6},
        requiredUuids: {'session-1'},
        settingsKeys: {'zenlift.settings.weight_unit'},
      ),
    );

    expect(result.passed, isTrue);
  });

  test(
    'fails when an expected table count is below the imported source',
    () async {
      final result = await verifier.verify(
        const MigrationBridgeImportResult(
          sourceDetected: true,
          tableRowCounts: {'set_logs': 7},
        ),
      );

      expect(result.passed, isFalse);
      expect(result.message, contains('Expected at least 7 rows in set_logs'));
    },
  );

  test('fails when required UUIDs are missing', () async {
    final result = await verifier.verify(
      const MigrationBridgeImportResult(
        sourceDetected: true,
        requiredUuids: {'missing-session'},
      ),
    );

    expect(result.passed, isFalse);
    expect(result.message, contains('missing-session'));
  });

  test('fails when required settings keys are missing', () async {
    final result = await verifier.verify(
      const MigrationBridgeImportResult(
        sourceDetected: true,
        settingsKeys: {'zenlift.settings.theme_mode'},
      ),
    );

    expect(result.passed, isFalse);
    expect(result.message, contains('zenlift.settings.theme_mode'));
  });
}

final class InMemoryMigrationBridgeSnapshotReader
    implements MigrationBridgeSnapshotReader {
  const InMemoryMigrationBridgeSnapshotReader(this.snapshot);

  final MigrationBridgeSnapshot snapshot;

  @override
  Future<MigrationBridgeSnapshot> readSnapshot() async => snapshot;
}
