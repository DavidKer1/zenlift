import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/storage/migration_bridge/first_launch_migrator.dart';

void main() {
  late InMemoryMigrationBridgeSettings settings;
  late FakeMigrationBridgeImporter importer;
  late FakeMigrationBridgeVerifier verifier;
  late FirstLaunchMigrator migrator;

  setUp(() {
    settings = InMemoryMigrationBridgeSettings();
    importer = FakeMigrationBridgeImporter();
    verifier = FakeMigrationBridgeVerifier();
    migrator = FirstLaunchMigrator(
      settings: settings,
      importer: importer,
      verifier: verifier,
    );
  });

  test('skips import when the cutover marker already exists', () async {
    settings.completed = true;

    final result = await migrator.runOnce();

    expect(result.status, FirstLaunchMigrationStatus.alreadyCompleted);
    expect(importer.calls, 0);
    expect(verifier.calls, 0);
  });

  test(
    'writes the cutover marker when no Expo source data is present',
    () async {
      importer.nextResult = const MigrationBridgeImportResult(
        sourceDetected: false,
      );

      final result = await migrator.runOnce();

      expect(result.status, FirstLaunchMigrationStatus.noSourceData);
      expect(settings.completed, isTrue);
      expect(verifier.calls, 0);
    },
  );

  test(
    'marks cutover only after source import and verification pass',
    () async {
      importer.nextResult = const MigrationBridgeImportResult(
        sourceDetected: true,
        insertedRows: 4,
        skippedRows: 2,
        tableRowCounts: {'workout_sessions': 1},
        requiredUuids: {'session-1'},
        settingsKeys: {'zenlift.settings.weight_unit'},
      );

      final result = await migrator.runOnce();

      expect(result.status, FirstLaunchMigrationStatus.imported);
      expect(result.insertedRows, 4);
      expect(result.skippedRows, 2);
      expect(settings.completed, isTrue);
      expect(settings.lastFailure, isNull);
      expect(verifier.lastResult?.requiredUuids, contains('session-1'));
    },
  );

  test('does not mark cutover when verification fails', () async {
    importer.nextResult = const MigrationBridgeImportResult(
      sourceDetected: true,
      insertedRows: 1,
    );
    verifier.nextResult = const MigrationBridgeVerificationResult.failed(
      'Missing required UUID session-1.',
    );

    final result = await migrator.runOnce();

    expect(result.status, FirstLaunchMigrationStatus.verificationFailed);
    expect(result.failure, 'Missing required UUID session-1.');
    expect(settings.completed, isFalse);
    expect(settings.lastFailure, 'Missing required UUID session-1.');
  });

  test('records import failure without writing the cutover marker', () async {
    importer.nextError = StateError('Bridge JSON is invalid.');

    final result = await migrator.runOnce();

    expect(result.status, FirstLaunchMigrationStatus.failed);
    expect(result.failure, contains('Bridge JSON is invalid.'));
    expect(settings.completed, isFalse);
    expect(settings.lastFailure, contains('Bridge JSON is invalid.'));
  });
}

final class InMemoryMigrationBridgeSettings implements MigrationBridgeSettings {
  bool completed = false;
  String? lastFailure;

  @override
  Future<bool> readMigrationBridgeCompleted() async => completed;

  @override
  Future<void> writeMigrationBridgeCompleted(bool isCompleted) async {
    completed = isCompleted;
    if (isCompleted) {
      lastFailure = null;
    }
  }

  @override
  Future<void> writeMigrationBridgeFailure(String failure) async {
    lastFailure = failure;
  }
}

final class FakeMigrationBridgeImporter implements MigrationBridgeImporter {
  var calls = 0;
  MigrationBridgeImportResult nextResult = const MigrationBridgeImportResult(
    sourceDetected: false,
  );
  Object? nextError;

  @override
  Future<MigrationBridgeImportResult> importBridgeIfPresent() async {
    calls += 1;
    final error = nextError;
    if (error != null) {
      throw error;
    }
    return nextResult;
  }
}

final class FakeMigrationBridgeVerifier implements MigrationBridgeVerifier {
  var calls = 0;
  MigrationBridgeImportResult? lastResult;
  MigrationBridgeVerificationResult nextResult =
      const MigrationBridgeVerificationResult.passed();

  @override
  Future<MigrationBridgeVerificationResult> verify(
    MigrationBridgeImportResult result,
  ) async {
    calls += 1;
    lastResult = result;
    return nextResult;
  }
}
