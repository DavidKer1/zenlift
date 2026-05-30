import 'package:shared_preferences/shared_preferences.dart';

import '../domain/settings_preferences.dart';
import '../domain/settings_repository.dart';
import '../domain/units.dart';

class SharedPreferencesSettingsRepository implements SettingsRepository {
  SharedPreferencesSettingsRepository({SharedPreferencesAsync? preferences})
    : _preferences = preferences ?? SharedPreferencesAsync();

  static const weightUnitKey = 'zenlift.settings.weight_unit';
  static const themeModeKey = 'zenlift.settings.theme_mode';
  static const weeklyGoalKey = 'zenlift.settings.weekly_goal';
  static const onboardingCompletedKey =
      'zenlift.settings.onboarding_completed';

  final SharedPreferencesAsync _preferences;

  @override
  Future<SettingsPreferences> readPreferences() async {
    final weightUnit = await _preferences.getString(weightUnitKey);
    final themeMode = await _preferences.getString(themeModeKey);
    final weeklyGoal = await _preferences.getString(weeklyGoalKey);
    final isOnboardingCompleted = await _preferences.getBool(
      onboardingCompletedKey,
    );

    return SettingsPreferences.fromStoredValues(
      weightUnit: weightUnit,
      themeMode: themeMode,
      weeklyGoal: weeklyGoal,
      isOnboardingCompleted: isOnboardingCompleted,
    );
  }

  @override
  Future<void> setOnboardingCompleted(bool isCompleted) {
    return _preferences.setBool(onboardingCompletedKey, isCompleted);
  }

  @override
  Future<void> setThemeMode(ZenliftThemeMode themeMode) {
    return _preferences.setString(themeModeKey, themeMode.value);
  }

  @override
  Future<void> setWeeklyGoal(int weeklyGoal) {
    final clampedGoal = SettingsPreferences.clampWeeklyGoal(weeklyGoal);
    return _preferences.setString(weeklyGoalKey, clampedGoal.toString());
  }

  @override
  Future<void> setWeightUnit(WeightUnit weightUnit) {
    return _preferences.setString(weightUnitKey, weightUnit.value);
  }
}
