import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';
import 'package:zenlift/storage/migration_bridge/shared_preferences_migration_bridge_settings.dart';

void main() {
  late SharedPreferencesMigrationBridgeSettings settings;

  setUp(() {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    settings = SharedPreferencesMigrationBridgeSettings(
      preferences: SharedPreferencesAsync(),
    );
  });

  test('defaults migration bridge completion to false', () async {
    expect(await settings.readMigrationBridgeCompleted(), isFalse);
  });

  test('persists migration bridge completion marker', () async {
    await settings.writeMigrationBridgeCompleted(true);

    expect(await settings.readMigrationBridgeCompleted(), isTrue);
  });

  test('clears previous failure after completed marker is written', () async {
    final preferences = SharedPreferencesAsync();
    await settings.writeMigrationBridgeFailure('bad bridge');
    expect(
      await preferences.getString(
        SharedPreferencesMigrationBridgeSettings.lastFailureKey,
      ),
      'bad bridge',
    );

    await settings.writeMigrationBridgeCompleted(true);

    expect(
      await preferences.getString(
        SharedPreferencesMigrationBridgeSettings.lastFailureKey,
      ),
      isNull,
    );
  });
}
