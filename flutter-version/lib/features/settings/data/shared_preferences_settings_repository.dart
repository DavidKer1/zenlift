import 'package:shared_preferences/shared_preferences.dart';

import '../../../storage/drift/app_database.dart' as drift_db;
import '../domain/settings_preferences.dart';
import '../domain/settings_repository.dart';
import '../domain/units.dart';

class SharedPreferencesSettingsRepository implements SettingsRepository {
  SharedPreferencesSettingsRepository({SharedPreferencesAsync? preferences})
    : this._(preferences ?? SharedPreferencesAsync(), null);

  SharedPreferencesSettingsRepository.withDatabase({
    SharedPreferencesAsync? preferences,
    required drift_db.AppDatabase database,
  }) : this._(preferences ?? SharedPreferencesAsync(), database);

  SharedPreferencesSettingsRepository._(this._preferences, this._database);

  static const weightUnitKey = 'zenlift.settings.weight_unit';
  static const themeModeKey = 'zenlift.settings.theme_mode';
  static const weeklyGoalKey = 'zenlift.settings.weekly_goal';
  static const onboardingCompletedKey = 'zenlift.settings.onboarding_completed';

  final SharedPreferencesAsync _preferences;
  final drift_db.AppDatabase? _database;

  @override
  Future<SettingsPreferences> readPreferences() async {
    final weightUnit = await _readString(weightUnitKey);
    final themeMode = await _readString(themeModeKey);
    final weeklyGoal = await _readString(weeklyGoalKey);
    final isOnboardingCompleted = await _readBool(onboardingCompletedKey);

    return SettingsPreferences.fromStoredValues(
      weightUnit: weightUnit,
      themeMode: themeMode,
      weeklyGoal: weeklyGoal,
      isOnboardingCompleted: isOnboardingCompleted,
    );
  }

  @override
  Future<void> setOnboardingCompleted(bool isCompleted) {
    return _setString(onboardingCompletedKey, isCompleted.toString());
  }

  @override
  Future<void> setThemeMode(ZenliftThemeMode themeMode) {
    return _setString(themeModeKey, themeMode.value);
  }

  @override
  Future<void> setWeeklyGoal(int weeklyGoal) {
    final clampedGoal = SettingsPreferences.clampWeeklyGoal(weeklyGoal);
    return _setString(weeklyGoalKey, clampedGoal.toString());
  }

  @override
  Future<void> setWeightUnit(WeightUnit weightUnit) {
    return _setString(weightUnitKey, weightUnit.value);
  }

  @override
  Future<void> clearPreferences() async {
    await Future.wait([
      _preferences.remove(weightUnitKey),
      _preferences.remove(themeModeKey),
      _preferences.remove(weeklyGoalKey),
      _preferences.remove(onboardingCompletedKey),
    ]);
    final database = _database;
    if (database == null) {
      return;
    }
    await database.batch((batch) {
      batch.deleteWhere(
        database.appSettings,
        (settings) => settings.key.isIn(_settingsKeys),
      );
    });
  }

  Future<String?> _readString(String key) async {
    final storedValue = await _preferences.getString(key);
    if (storedValue != null) {
      return storedValue;
    }
    return _readMirroredSetting(key);
  }

  Future<bool?> _readBool(String key) async {
    final storedValue = await _preferences.getBool(key);
    if (storedValue != null) {
      return storedValue;
    }
    final mirroredValue = await _readMirroredSetting(key);
    return switch (mirroredValue) {
      'true' => true,
      'false' => false,
      _ => null,
    };
  }

  Future<String?> _readMirroredSetting(String key) async {
    final database = _database;
    if (database == null) {
      return null;
    }
    final setting = await (database.select(
      database.appSettings,
    )..where((settings) => settings.key.equals(key))).getSingleOrNull();
    return setting?.value;
  }

  Future<void> _setString(String key, String value) async {
    if (key == onboardingCompletedKey) {
      await _preferences.setBool(key, value == 'true');
    } else {
      await _preferences.setString(key, value);
    }
    final database = _database;
    if (database == null) {
      return;
    }
    await database
        .into(database.appSettings)
        .insertOnConflictUpdate(
          drift_db.AppSettingsCompanion.insert(key: key, value: value),
        );
  }
}

const _settingsKeys = [
  SharedPreferencesSettingsRepository.weightUnitKey,
  SharedPreferencesSettingsRepository.themeModeKey,
  SharedPreferencesSettingsRepository.weeklyGoalKey,
  SharedPreferencesSettingsRepository.onboardingCompletedKey,
];
