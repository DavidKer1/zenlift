import 'settings_preferences.dart';
import 'units.dart';

abstract interface class SettingsRepository {
  Future<SettingsPreferences> readPreferences();

  Future<void> setWeightUnit(WeightUnit weightUnit);

  Future<void> setThemeMode(ZenliftThemeMode themeMode);

  Future<void> setWeeklyGoal(int weeklyGoal);

  Future<void> setOnboardingCompleted(bool isCompleted);
}
