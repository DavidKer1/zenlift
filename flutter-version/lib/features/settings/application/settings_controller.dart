import '../domain/settings_preferences.dart';
import '../domain/settings_repository.dart';
import '../domain/units.dart';

class SettingsController {
  SettingsController(this._repository);

  final SettingsRepository _repository;

  SettingsPreferences? _state;

  SettingsPreferences? get state => _state;

  Future<SettingsPreferences> load() async {
    final preferences = await _repository.readPreferences();
    _state = preferences;
    return preferences;
  }

  Future<SettingsPreferences> setWeightUnit(WeightUnit weightUnit) async {
    await _repository.setWeightUnit(weightUnit);
    return load();
  }

  Future<SettingsPreferences> setThemeMode(ZenliftThemeMode themeMode) async {
    await _repository.setThemeMode(themeMode);
    return load();
  }

  Future<SettingsPreferences> setWeeklyGoal(int weeklyGoal) async {
    await _repository.setWeeklyGoal(weeklyGoal);
    return load();
  }

  Future<SettingsPreferences> markOnboardingCompleted() async {
    await _repository.setOnboardingCompleted(true);
    return load();
  }
}
