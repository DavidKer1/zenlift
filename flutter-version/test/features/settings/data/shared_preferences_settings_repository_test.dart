import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';
import 'package:zenlift/features/settings/data/shared_preferences_settings_repository.dart';
import 'package:zenlift/features/settings/domain/settings_preferences.dart';
import 'package:zenlift/features/settings/domain/units.dart';

void main() {
  late SharedPreferencesSettingsRepository repository;

  setUp(() {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    repository = SharedPreferencesSettingsRepository(
      preferences: SharedPreferencesAsync(),
    );
  });

  test('reads default settings when namespaced keys are absent', () async {
    final preferences = await repository.readPreferences();

    expect(preferences, SettingsPreferences.defaults());
  });

  test('persists settings to namespaced shared preferences keys', () async {
    await repository.setWeightUnit(WeightUnit.lb);
    await repository.setThemeMode(ZenliftThemeMode.system);
    await repository.setWeeklyGoal(5);
    await repository.setOnboardingCompleted(true);

    final preferences = await repository.readPreferences();

    expect(preferences.weightUnit, WeightUnit.lb);
    expect(preferences.themeMode, ZenliftThemeMode.system);
    expect(preferences.weeklyGoal, 5);
    expect(preferences.isOnboardingCompleted, isTrue);
  });

  test('clamps weekly goal before saving', () async {
    await repository.setWeeklyGoal(0);
    expect((await repository.readPreferences()).weeklyGoal, 1);

    await repository.setWeeklyGoal(8);
    expect((await repository.readPreferences()).weeklyGoal, 7);
  });
}
