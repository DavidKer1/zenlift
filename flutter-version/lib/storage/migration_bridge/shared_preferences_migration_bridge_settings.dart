import 'package:shared_preferences/shared_preferences.dart';

import 'first_launch_migrator.dart';

final class SharedPreferencesMigrationBridgeSettings
    implements MigrationBridgeSettings {
  SharedPreferencesMigrationBridgeSettings({
    SharedPreferencesAsync? preferences,
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  static const completedKey = 'zenlift.migration_bridge.completed';
  static const lastFailureKey = 'zenlift.migration_bridge.last_failure';

  final SharedPreferencesAsync _preferences;

  @override
  Future<bool> readMigrationBridgeCompleted() async {
    return await _preferences.getBool(completedKey) ?? false;
  }

  @override
  Future<void> writeMigrationBridgeCompleted(bool isCompleted) async {
    await _preferences.setBool(completedKey, isCompleted);
    if (isCompleted) {
      await _preferences.remove(lastFailureKey);
    }
  }

  @override
  Future<void> writeMigrationBridgeFailure(String failure) {
    return _preferences.setString(lastFailureKey, failure);
  }
}
